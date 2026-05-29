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
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}

INGREDIENT_TYPES = {
    "Vegetable",
    "Seafood",
    "Meat",
    "Spice",
    
           "Fruit",
           "Arrows",
           "Zeny",
    "Enhance Equipment",
    "Redeem Item",
    "Pet Material"
}


def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS cooking_ingredients (
            id TEXT PRIMARY KEY,
            detail_url TEXT UNIQUE,
            image TEXT,
            name TEXT,
            ingredient_type TEXT,
            description TEXT,
            quality TEXT,
            raw_tags TEXT,
            raw_html TEXT
        );

        CREATE TABLE IF NOT EXISTS cooking_ingredient_formulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ingredient_id TEXT NOT NULL,
            formula_index INTEGER NOT NULL,
            formula_json TEXT,
            UNIQUE(ingredient_id, formula_index)
        );

        CREATE TABLE IF NOT EXISTS cooking_ingredient_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ingredient_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            related_id TEXT,
            related_name TEXT,
            related_image TEXT,
            related_url TEXT,
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
    """)

    conn.commit()

    return conn


def clean_text(value):
    if not value:
        return None

    text = " ".join(value.split())

    return text.strip() or None


def normalize_path(value):
    if not value:
        return None

    absolute = urljoin(BASE_URL + "/", value.strip())
    parsed = urlparse(absolute)

    if parsed.netloc != urlparse(BASE_URL).netloc:
        return None

    return parsed.path.rstrip("/")


def absolute_url(path):
    return urljoin(BASE_URL + "/", path)


def normalize_asset(value):
    if not value:
        return None

    value = value.strip()

    if value.startswith(BASE_URL):
        return value.replace(BASE_URL, "")

    return value


def id_from_path(path):
    slug = path.strip("/").split("/")[-1]
    match = re.search(r"-(\d+)$", slug)

    if match:
        return match.group(1)

    return slug


def clean_body_html(soup):
    body = soup.select_one("body")

    if not body:
        return str(soup)

    for el in body.select("header, .sticky-top, .docs-sidebar, footer, script, style"):
        el.decompose()

    for img in body.select("img[src]"):
        img["src"] = normalize_asset(img.get("src"))

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


def extract_badges(soup):
    badges = []

    for badge in soup.select("span.inline-flex"):
        text = clean_text(badge.get_text(" ", strip=True))

        if text:
            badges.append(text)

    return badges


def extract_ingredient_type(badges):
    for badge in badges:
        if badge in INGREDIENT_TYPES:
            return badge

    return None


def first_text(soup, selectors):
    for selector in selectors:
        node = soup.select_one(selector)

        if node:
            text = clean_text(node.get_text(" ", strip=True))

            if text:
                return text

    return None


def extract_sections(soup):
    sections = {}

    for grid in soup.select("div.grid.grid-cols-12"):
        children = grid.find_all("div", recursive=False)
        index = 0

        while index < len(children) - 1:
            label_node = children[index]
            value_node = children[index + 1]

            label = clean_text(label_node.get_text(" ", strip=True))

            if label:
                sections[label] = value_node

            index += 2

    return sections


def relation_type_from_label(label):
    return (
        label.strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )


def extract_relation_items(section):
    if not section:
        return []

    items = []
    seen = set()

    for link in section.select("a[href]"):
        href = normalize_path(link.get("href"))

        if not href or href in seen:
            continue

        seen.add(href)

        img = link.select_one("img")
        name_node = link.select_one("span")

        items.append({
            "id": id_from_path(href),
            "name": clean_text(name_node.get_text(" ", strip=True)) if name_node else clean_text(link.get_text(" ", strip=True)),
            "image": normalize_asset(img.get("src")) if img else None,
            "url": href,
        })

    return items


def extract_quality(sections):
    section = sections.get("Quality")

    if not section:
        return None

    text = clean_text(section.get_text(" ", strip=True))

    for quality in ["White", "Green", "Blue", "Purple", "Orange"]:
        if quality.lower() in text.lower():
            return quality

    return text


def extract_formulas(soup):
    formulas = []

    for code in soup.select("code.language-json, pre code"):
        text = code.get_text("\n", strip=True)

        if text and text not in formulas:
            formulas.append(text)

    return formulas


def parse_ingredient(path, soup, raw_html):
    badges = extract_badges(soup)
    ingredient_type = extract_ingredient_type(badges)

    if not ingredient_type:
        raise RuntimeError("Ingredient badge not found")

    name = first_text(
        soup,
        [
            "span.text.font-semibold.leading-6.text-emerald-200",
            "span.text.font-semibold",
            "h1",
            "h2",
        ],
    )

    img = soup.select_one("img.h-12, img.h-10, img.h-9, img")
    image = normalize_asset(img.get("src") or img.get("data-src")) if img else None

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

    relations = []

    for label, section in sections.items():
        relation_type = relation_type_from_label(label)

        if relation_type not in {
            "dropped_by",
            "craft_materials",
            "craftable",
            "synth_from",
            "synth_to",
        }:
            continue

        for item in extract_relation_items(section):
            item["relation_type"] = relation_type
            relations.append(item)

    return {
        "id": id_from_path(path),
        "detail_url": path,
        "image": image,
        "name": name,
        "ingredient_type": ingredient_type,
        "description": description,
        "quality": extract_quality(sections),
        "raw_tags": json.dumps(badges, ensure_ascii=False),
        "raw_html": raw_html,
        "relations": relations,
        "formulas": extract_formulas(soup),
    }


def save_ingredient(conn, data):
    conn.execute("""
        INSERT OR REPLACE INTO cooking_ingredients (
            id,
            detail_url,
            image,
            name,
            ingredient_type,
            description,
            quality,
            raw_tags,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["detail_url"],
        data["image"],
        data["name"],
        data["ingredient_type"],
        data["description"],
        data["quality"],
        data["raw_tags"],
        data["raw_html"],
    ))

    conn.execute(
        "DELETE FROM cooking_ingredient_formulas WHERE ingredient_id = ?",
        (data["id"],),
    )

    for index, formula in enumerate(data["formulas"]):
        conn.execute("""
            INSERT OR REPLACE INTO cooking_ingredient_formulas (
                ingredient_id,
                formula_index,
                formula_json
            )
            VALUES (?, ?, ?)
        """, (
            data["id"],
            index,
            formula,
        ))

    conn.execute(
        "DELETE FROM cooking_ingredient_relations WHERE ingredient_id = ?",
        (data["id"],),
    )

    for index, item in enumerate(data["relations"]):
        conn.execute("""
            INSERT INTO cooking_ingredient_relations (
                ingredient_id,
                relation_type,
                related_id,
                related_name,
                related_image,
                related_url,
                relation_index
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["id"],
            item["relation_type"],
            item["id"],
            item["name"],
            item["image"],
            item["url"],
            index,
        ))

    conn.execute("""
        INSERT OR REPLACE INTO things (
            id,
            type,
            name,
            image,
            detail_url
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["id"],
        "cooking_ingredient",
        data["name"],
        data["image"],
        data["detail_url"],
    ))


def already_saved(conn, path):
    row = conn.execute("""
        SELECT 1
        FROM cooking_ingredients
        WHERE detail_url = ?
           OR id = ?
        LIMIT 1
    """, (
        path,
        id_from_path(path),
    )).fetchone()

    return row is not None


def mark_resolved(conn, row, data, keep_unknown):
    conn.execute("""
        INSERT INTO crawl_resolved_links (
            path,
            source_table,
            source_id,
            resolved_table,
            resolved_id,
            note
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        row["path"],
        row["source_table"],
        row["source_id"],
        "cooking_ingredients",
        data["id"],
        data["ingredient_type"],
    ))

    if not keep_unknown:
        conn.execute(
            "DELETE FROM crawl_unknown_links WHERE path = ?",
            (row["path"],),
        )


def save_failure(conn, row, error):
    conn.execute("""
        INSERT INTO crawl_failures (
            path,
            source_table,
            source_id,
            status_code,
            error
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        row["path"],
        row["source_table"],
        row["source_id"],
        None,
        str(error),
    ))


def get_rows(conn, limit):
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
        WHERE detected_types LIKE '%Vegetable%'
           OR detected_types LIKE '%Seafood%'
           OR detected_types LIKE '%Meat%'
           OR detected_types LIKE '%Spice%'
           OR detected_types LIKE '%Fruit%'
           OR detected_types LIKE '%Arrows%'
           OR detected_types LIKE '%Zeny%'
           OR detected_types LIKE '%Enhance Equipment%'
           OR detected_types LIKE '%Redeem Item%'
           OR detected_types LIKE '%Pet Material%'

        ORDER BY path
    """

    params = []

    if limit > 0:
        sql += " LIMIT ?"
        params.append(limit)

    return conn.execute(sql, params).fetchall()


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--sleep", type=float, default=0.5)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--keep-unknown", action="store_true")

    args = parser.parse_args()

    conn = connect_db()

    rows = get_rows(conn, args.limit)

    print("[INFO] DB:", DB_PATH)
    print("[INFO] Cooking ingredient rows:", len(rows))

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
            print("[SKIP]", path)
            continue

        print("[FETCH]", path)

        try:
            if args.dry_run:
                counts["inserted"] += 1
                print("[DRY RUN]", absolute_url(path))
                continue

            soup, raw_html = fetch_detail(path)
            data = parse_ingredient(path, soup, raw_html)

            save_ingredient(conn, data)
            mark_resolved(conn, row, data, args.keep_unknown)

            conn.commit()

            counts["inserted"] += 1

            print(
                "[OK]",
                data["name"],
                "|",
                data["ingredient_type"],
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