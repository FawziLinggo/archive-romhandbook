import argparse
import json
import os
import re
import sqlite3
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv("BASE_URL", "https://romhandbook.com").strip().rstrip("/")
DB_FILE = os.getenv("DB_FILE", "../backend-api/storage/rom.db")
DB_PATH = str(Path(DB_FILE).resolve())
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}


def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS furnitures (
            id TEXT PRIMARY KEY,
            detail_url TEXT UNIQUE,
            image TEXT,
            name TEXT,
            furniture_type TEXT,
            furniture_subtype TEXT,
            is_blueprint INTEGER DEFAULT 0,
            description TEXT,
            quality TEXT,
            effect_text TEXT,
            unlock_text TEXT,
            deposit_stats TEXT,
            raw_tags TEXT,
            raw_html TEXT
        );

        CREATE TABLE IF NOT EXISTS furniture_formulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            furniture_id TEXT NOT NULL,
            formula_index INTEGER NOT NULL,
            formula_json TEXT,
            UNIQUE(furniture_id, formula_index)
        );

        CREATE TABLE IF NOT EXISTS furniture_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            furniture_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            related_id TEXT,
            related_name TEXT,
            related_image TEXT,
            related_url TEXT,
            quantity TEXT,
            relation_index INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS crawl_resolved_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT,
            source_table TEXT,
            source_id TEXT,
            resolved_table TEXT,
            resolved_id TEXT,
            note TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS crawl_failures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT,
            source_table TEXT,
            source_id TEXT,
            status_code INTEGER,
            error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_furnitures_detail_url
        ON furnitures(detail_url);

        CREATE INDEX IF NOT EXISTS idx_furnitures_lower_name
        ON furnitures(LOWER(name));

        CREATE INDEX IF NOT EXISTS idx_furnitures_type
        ON furnitures(furniture_type);

        CREATE INDEX IF NOT EXISTS idx_furnitures_subtype
        ON furnitures(furniture_subtype);

        CREATE INDEX IF NOT EXISTS idx_furniture_formulas_furniture_id
        ON furniture_formulas(furniture_id);

        CREATE INDEX IF NOT EXISTS idx_furniture_relations_furniture_id
        ON furniture_relations(furniture_id);

        CREATE INDEX IF NOT EXISTS idx_furniture_relations_type
        ON furniture_relations(relation_type);
        """
    )

    conn.commit()

    return conn


def normalize_path(value):
    if not value:
        return None

    value = value.strip()
    absolute = urljoin(BASE_URL + "/", value)
    parsed = urlparse(absolute)
    base_host = urlparse(BASE_URL).netloc

    if parsed.netloc != base_host:
        return None

    return parsed.path.rstrip("/")


def absolute_url(path):
    return urljoin(BASE_URL + "/", path)


def id_from_path(path):
    slug = path.strip("/").split("/")[-1]
    match = re.search(r"-(\\d+)$", slug)

    if match:
        return match.group(1)

    return slug


def normalize_asset(value):
    if not value:
        return None

    value = value.strip()

    if value.startswith(BASE_URL):
        return value.replace(BASE_URL, "")

    return value


def clean_text(value):
    if not value:
        return None

    text = " ".join(value.split())

    return text.strip() or None


def clean_body_html(soup):
    body = soup.select_one("body")

    if not body:
        return str(soup)

    for el in body.select(
        "header, .sticky-top, .docs-sidebar, footer, script, style"
    ):
        el.decompose()

    for img in body.select("img[src]"):
        img["src"] = normalize_asset(img.get("src"))

    for link in body.select("link[href]"):
        link["href"] = normalize_asset(link.get("href"))

    return str(body)


def fetch_detail(path):
    response = requests.get(
        absolute_url(path),
        headers=HEADERS,
        timeout=30,
    )

    if response.status_code != 200:
        raise RuntimeError(f"HTTP {response.status_code}")

    source_soup = BeautifulSoup(response.text, "lxml")
    raw_html = clean_body_html(source_soup)
    soup = BeautifulSoup(raw_html, "lxml")

    return soup, raw_html


def first_text(soup, selectors):
    for selector in selectors:
        node = soup.select_one(selector)

        if node:
            text = clean_text(node.get_text(" ", strip=True))

            if text:
                return text

    return None


def extract_badges(soup):
    badges = []

    for badge in soup.select("span.inline-flex"):
        text = clean_text(badge.get_text(" ", strip=True))

        if text:
            badges.append(text)

    return badges


def extract_furniture_type(badges):
    for badge in badges:
        if badge.startswith("Furniture"):
            return badge

    return None


def extract_furniture_subtype(furniture_type):
    if not furniture_type:
        return None

    subtype = furniture_type.replace("Furniture", "", 1).strip()

    return subtype or None


def extract_sections(soup):
    sections = {}

    grids = soup.select("div.grid.grid-cols-12")

    for grid in grids:
        children = [
            child
            for child in grid.find_all("div", recursive=False)
        ]

        index = 0

        while index < len(children) - 1:
            label_node = children[index]
            value_node = children[index + 1]

            label = clean_text(label_node.get_text(" ", strip=True))

            if label:
                sections[label] = value_node

            index += 2

    return sections


def extract_section_texts(section):
    if not section:
        return []

    texts = []

    for node in section.select("p, span, div"):
        text = clean_text(node.get_text(" ", strip=True))

        if not text:
            continue

        if text in texts:
            continue

        if text in {
            "Quality",
            "Effect",
            "Unlock",
            "Deposit",
            "Craft Materials",
            "Craftable",
            "Formula",
        }:
            continue

        texts.append(text)

    if not texts:
        text = clean_text(section.get_text(" ", strip=True))

        if text:
            texts.append(text)

    return texts


def extract_quality(section):
    texts = extract_section_texts(section)

    for text in texts:
        for quality in ["White", "Green", "Blue", "Purple", "Orange"]:
            if quality.lower() == text.lower():
                return quality

    return texts[0] if texts else None


def relation_type_from_label(label):
    return (
        label.strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


def parse_quantity_and_name(text):
    if not text:
        return None, None

    match = re.match(r"^(\\d+)\\s*x\\s*(.+)$", text.strip(), re.I)

    if match:
        return match.group(1), clean_text(match.group(2))

    return None, clean_text(text)


def extract_relation_items(section):
    if not section:
        return []

    items = []
    seen = set()

    for link in section.select('a[href*="/things/"]'):
        href = normalize_path(link.get("href"))

        if not href or href in seen:
            continue

        seen.add(href)

        img = link.select_one("img")
        image = normalize_asset(img.get("src")) if img else None

        name_node = link.select_one("span")
        raw_name = None

        if name_node:
            raw_name = clean_text(name_node.get_text(" ", strip=True))
        else:
            raw_name = clean_text(link.get_text(" ", strip=True))

        quantity, name = parse_quantity_and_name(raw_name)

        items.append(
            {
                "id": id_from_path(href),
                "name": name,
                "image": image,
                "url": href,
                "quantity": quantity,
            }
        )

    return items


def extract_formulas(soup):
    formulas = []

    for index, code in enumerate(soup.select("code.language-json, pre code")):
        formula_text = code.get_text("\\n", strip=True)

        if not formula_text:
            continue

        if formula_text in formulas:
            continue

        formulas.append(formula_text)

    return formulas


def parse_furniture(path, soup, raw_html):
    badges = extract_badges(soup)
    furniture_type = extract_furniture_type(badges)

    if not furniture_type:
        raise RuntimeError("Furniture badge not found")

    furniture_subtype = extract_furniture_subtype(furniture_type)

    name = first_text(
        soup,
        [
            "span.text.font-semibold.leading-6.text-emerald-200",
            "span.text.font-semibold",
            "h1",
            "h2",
        ],
    )

    image = None
    img = soup.select_one("img.h-12, img.h-10, img.h-9, img")

    if img:
        image = normalize_asset(img.get("src") or img.get("data-src"))

    description = first_text(
        soup,
        [
            "div.border-t.border-gray-200.pt-2 p.text-base",
            "div.border-t p",
            "p.text-base",
            "p",
        ],
    )

    sections = extract_sections(soup)

    quality = extract_quality(sections.get("Quality"))

    effect_text = extract_section_texts(sections.get("Effect"))
    unlock_text = extract_section_texts(sections.get("Unlock"))
    deposit_stats = extract_section_texts(sections.get("Deposit"))

    relations = []

    for label, section in sections.items():
        relation_type = relation_type_from_label(label)

        if relation_type not in {
            "craft_materials",
            "craftable",
            "dropped_by",
            "synth_from",
            "synth_to",
        }:
            continue

        for item in extract_relation_items(section):
            item["relation_type"] = relation_type
            relations.append(item)

    formulas = extract_formulas(soup)

    return {
        "id": id_from_path(path),
        "detail_url": path,
        "image": image,
        "name": name,
        "furniture_type": furniture_type,
        "furniture_subtype": furniture_subtype,
        "is_blueprint": 1 if furniture_subtype == "Blueprint" else 0,
        "description": description,
        "quality": quality,
        "effect_text": json.dumps(effect_text, ensure_ascii=False),
        "unlock_text": json.dumps(unlock_text, ensure_ascii=False),
        "deposit_stats": json.dumps(deposit_stats, ensure_ascii=False),
        "raw_tags": json.dumps(badges, ensure_ascii=False),
        "raw_html": raw_html,
        "relations": relations,
        "formulas": formulas,
    }


def save_furniture(conn, data):
    conn.execute(
        """
        INSERT OR REPLACE INTO furnitures (
            id,
            detail_url,
            image,
            name,
            furniture_type,
            furniture_subtype,
            is_blueprint,
            description,
            quality,
            effect_text,
            unlock_text,
            deposit_stats,
            raw_tags,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["id"],
            data["detail_url"],
            data["image"],
            data["name"],
            data["furniture_type"],
            data["furniture_subtype"],
            data["is_blueprint"],
            data["description"],
            data["quality"],
            data["effect_text"],
            data["unlock_text"],
            data["deposit_stats"],
            data["raw_tags"],
            data["raw_html"],
        ),
    )

    conn.execute(
        """
        DELETE FROM furniture_formulas
        WHERE furniture_id = ?
        """,
        (data["id"],),
    )

    for index, formula in enumerate(data["formulas"]):
        conn.execute(
            """
            INSERT OR REPLACE INTO furniture_formulas (
                furniture_id,
                formula_index,
                formula_json
            )
            VALUES (?, ?, ?)
            """,
            (
                data["id"],
                index,
                formula,
            ),
        )

    conn.execute(
        """
        DELETE FROM furniture_relations
        WHERE furniture_id = ?
        """,
        (data["id"],),
    )

    for index, item in enumerate(data["relations"]):
        conn.execute(
            """
            INSERT INTO furniture_relations (
                furniture_id,
                relation_type,
                related_id,
                related_name,
                related_image,
                related_url,
                quantity,
                relation_index
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["id"],
                item["relation_type"],
                item["id"],
                item["name"],
                item["image"],
                item["url"],
                item["quantity"],
                index,
            ),
        )

    conn.execute(
        """
        INSERT OR REPLACE INTO things (
            id,
            type,
            name,
            image,
            detail_url
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            data["id"],
            "furniture",
            data["name"],
            data["image"],
            data["detail_url"],
        ),
    )


def mark_resolved(conn, row, data, keep_unknown):
    conn.execute(
        """
        INSERT INTO crawl_resolved_links (
            path,
            source_table,
            source_id,
            resolved_table,
            resolved_id,
            note
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            row["path"],
            row["source_table"],
            row["source_id"],
            "furnitures",
            data["id"],
            data["furniture_type"],
        ),
    )

    if not keep_unknown:
        conn.execute(
            """
            DELETE FROM crawl_unknown_links
            WHERE path = ?
            """,
            (row["path"],),
        )


def save_failure(conn, row, error):
    conn.execute(
        """
        INSERT INTO crawl_failures (
            path,
            source_table,
            source_id,
            status_code,
            error
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            row["path"],
            row["source_table"],
            row["source_id"],
            None,
            str(error),
        ),
    )


def already_saved(conn, path):
    row = conn.execute(
        """
        SELECT 1
        FROM furnitures
        WHERE detail_url IN (?, ?)
           OR id = ?
        LIMIT 1
        """,
        (
            path,
            BASE_URL + path,
            id_from_path(path),
        ),
    ).fetchone()

    return row is not None


def get_unknown_furniture_rows(conn, limit):
    sql = """
        SELECT
            id,
            path,
            source_table,
            source_id,
            reason,
            detected_name,
            detected_types
        FROM crawl_unknown_links
        WHERE detected_types LIKE '%Furniture%'
        ORDER BY path
    """

    params = []

    if limit > 0:
        sql += " LIMIT ?"
        params.append(limit)

    return conn.execute(sql, params).fetchall()


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--limit",
        type=int,
        default=0,
    )

    parser.add_argument(
        "--sleep",
        type=float,
        default=0.5,
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
    )

    parser.add_argument(
        "--keep-unknown",
        action="store_true",
        help="Do not delete successful rows from crawl_unknown_links.",
    )

    args = parser.parse_args()

    conn = connect_db()

    rows = get_unknown_furniture_rows(
        conn,
        args.limit,
    )

    print("[INFO] DB:", DB_PATH)
    print("[INFO] Furniture unknown rows:", len(rows))

    counts = {
        "inserted": 0,
        "skipped": 0,
        "failed": 0,
    }

    for row in rows:
        path = normalize_path(row["path"])

        if not path:
            counts["failed"] += 1
            save_failure(conn, row, "Invalid path")
            conn.commit()
            continue

        if already_saved(conn, path):
            counts["skipped"] += 1

            if not args.dry_run:
                data = {
                    "id": id_from_path(path),
                    "furniture_type": "already saved",
                }

                mark_resolved(
                    conn,
                    row,
                    data,
                    args.keep_unknown,
                )

                conn.commit()

            print("[SKIP]", path)
            continue

        print("[FETCH]", path)

        try:
            if args.dry_run:
                counts["inserted"] += 1
                print("[DRY RUN]", absolute_url(path))
                continue

            soup, raw_html = fetch_detail(path)
            data = parse_furniture(path, soup, raw_html)

            save_furniture(conn, data)

            mark_resolved(
                conn,
                row,
                data,
                args.keep_unknown,
            )

            conn.commit()

            counts["inserted"] += 1

            print(
                "[OK]",
                data["name"],
                "|",
                data["furniture_type"],
                "| formulas:",
                len(data["formulas"]),
                "| relations:",
                len(data["relations"]),
            )

            time.sleep(args.sleep)

        except Exception as exc:
            counts["failed"] += 1
            save_failure(conn, row, exc)
            conn.commit()
            print("[FAILED]", path, "-", exc)

    conn.close()

    print("[DONE]", counts)


if __name__ == "__main__":
    main()