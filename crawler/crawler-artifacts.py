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
        CREATE TABLE IF NOT EXISTS artifacts (
            id TEXT PRIMARY KEY,
            detail_url TEXT UNIQUE,
            image TEXT,
            name TEXT,
            artifact_type TEXT,
            artifact_subtype TEXT,
            description TEXT,
            quality TEXT,
            effect_text TEXT,
            unlock_text TEXT,
            availability_date TEXT,
            raw_tags TEXT,
            raw_html TEXT
        );

        CREATE TABLE IF NOT EXISTS artifact_formulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artifact_id TEXT NOT NULL,
            formula_id TEXT,
            formula_index INTEGER NOT NULL,
            formula_json TEXT,
            UNIQUE(artifact_id, formula_index)
        );

        CREATE TABLE IF NOT EXISTS artifact_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            artifact_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            related_id TEXT,
            related_name TEXT,
            related_image TEXT,
            related_url TEXT,
            quantity TEXT,
            relation_index INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS things (
            id TEXT PRIMARY KEY,
            type TEXT,
            name TEXT,
            image TEXT,
            detail_url TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_artifacts_detail_url
        ON artifacts(detail_url);

        CREATE INDEX IF NOT EXISTS idx_artifacts_lower_name
        ON artifacts(LOWER(name));

        CREATE INDEX IF NOT EXISTS idx_artifacts_type
        ON artifacts(artifact_type);

        CREATE INDEX IF NOT EXISTS idx_artifacts_subtype
        ON artifacts(artifact_subtype);

        CREATE INDEX IF NOT EXISTS idx_artifact_formulas_artifact_id
        ON artifact_formulas(artifact_id);

        CREATE INDEX IF NOT EXISTS idx_artifact_relations_artifact_id
        ON artifact_relations(artifact_id);

        CREATE INDEX IF NOT EXISTS idx_artifact_relations_type
        ON artifact_relations(relation_type);
        """
    )

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
    base_host = urlparse(BASE_URL).netloc

    if parsed.netloc != base_host:
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

    match = re.match(r"^(\d+)\s*x\s*(.+)$", text.strip(), re.I)

    if match:
        return match.group(1), clean_text(match.group(2))

    return None, clean_text(text)


def request_page(session, path, max_retries=3, sleep_seconds=1.0):
    url = absolute_url(path)

    for attempt in range(max_retries + 1):
        response = session.get(
            url,
            headers=HEADERS,
            timeout=30,
        )

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            delay = float(retry_after) if retry_after else sleep_seconds * (attempt + 2)

            print(f"[429] {path} sleep {delay}s")
            time.sleep(delay)
            continue

        if response.status_code != 200:
            raise RuntimeError(f"HTTP {response.status_code}")

        return response.text

    raise RuntimeError("HTTP 429 after retries")


def clean_body_html(soup):
    body = soup.select_one("body")

    if not body:
        return str(soup)

    for el in body.select("header, .sticky-top, .docs-sidebar, footer, script, style"):
        el.decompose()

    for img in body.select("img[src]"):
        img["src"] = normalize_asset(img.get("src"))

    for link in body.select("link[href]"):
        link["href"] = normalize_asset(link.get("href"))

    return str(body)


def fetch_detail(session, path, sleep_seconds, max_retries):
    html = request_page(
        session,
        path,
        max_retries=max_retries,
        sleep_seconds=sleep_seconds,
    )

    source_soup = BeautifulSoup(html, "lxml")
    raw_html = clean_body_html(source_soup)
    soup = BeautifulSoup(raw_html, "lxml")

    return soup, raw_html


def fetch_list_paths(session, sleep_seconds, max_retries):
    html = request_page(
        session,
        "/artifacts",
        max_retries=max_retries,
        sleep_seconds=sleep_seconds,
    )

    soup = BeautifulSoup(html, "lxml")
    paths = []
    seen = set()

    for link in soup.select('a[href^="/things/"]'):
        path = normalize_path(link.get("href"))

        if not path:
            continue

        if path in seen:
            continue

        seen.add(path)
        paths.append(path)

    return paths


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


def extract_artifact_type(badges):
    for badge in badges:
        if badge.startswith("Artifact"):
            return badge

    return None


def extract_artifact_subtype(artifact_type):
    if not artifact_type:
        return None

    subtype = artifact_type.replace("Artifact", "", 1).strip()

    return subtype or None


def extract_sections(soup):
    sections = {}

    for grid in soup.select("div.grid.grid-cols-12"):
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
            "Jobs",
            "Materials",
            "Skills",
            "Availability Date",
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


def extract_plain_items(section):
    if not section:
        return []

    values = []

    for node in section.select("span, a, p, div"):
        text = clean_text(node.get_text(" ", strip=True))

        if not text:
            continue

        if text in values:
            continue

        values.append(text)

    return values


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

    for code in soup.select("code.language-json, pre code"):
        formula_text = code.get_text("\n", strip=True)

        if not formula_text:
            continue

        if formula_text in formulas:
            continue

        formulas.append(formula_text)

    return formulas


def formula_id_from_json(formula_text):
    try:
        parsed = json.loads(formula_text)

        value = parsed.get("id")

        if value is None:
            return None

        return str(value)
    except Exception:
        return None


def parse_artifact(path, soup, raw_html):
    badges = extract_badges(soup)
    artifact_type = extract_artifact_type(badges)

    if not artifact_type:
        raise RuntimeError("Artifact badge not found")

    artifact_subtype = extract_artifact_subtype(artifact_type)

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
    availability_date = None

    availability_texts = extract_section_texts(sections.get("Availability Date"))

    if availability_texts:
        availability_date = availability_texts[0]

    relations = []

    for label, section in sections.items():
        relation_type = relation_type_from_label(label)

        if relation_type in {
            "materials",
            "skills",
            "craft_materials",
            "craftable",
            "synth_from",
            "synth_to",
        }:
            for item in extract_relation_items(section):
                item["relation_type"] = relation_type
                relations.append(item)

        if relation_type == "jobs":
            for index, job_name in enumerate(extract_plain_items(section)):
                if not job_name or job_name == "Jobs":
                    continue

                relations.append(
                    {
                        "relation_type": "jobs",
                        "id": None,
                        "name": job_name,
                        "image": None,
                        "url": None,
                        "quantity": None,
                    }
                )

    formulas = extract_formulas(soup)

    return {
        "id": id_from_path(path),
        "detail_url": path,
        "image": image,
        "name": name,
        "artifact_type": artifact_type,
        "artifact_subtype": artifact_subtype,
        "description": description,
        "quality": quality,
        "effect_text": json.dumps(effect_text, ensure_ascii=False),
        "unlock_text": json.dumps(unlock_text, ensure_ascii=False),
        "availability_date": availability_date,
        "raw_tags": json.dumps(badges, ensure_ascii=False),
        "raw_html": raw_html,
        "relations": relations,
        "formulas": formulas,
    }


def save_artifact(conn, data):
    conn.execute(
        """
        INSERT OR REPLACE INTO artifacts (
            id,
            detail_url,
            image,
            name,
            artifact_type,
            artifact_subtype,
            description,
            quality,
            effect_text,
            unlock_text,
            availability_date,
            raw_tags,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["id"],
            data["detail_url"],
            data["image"],
            data["name"],
            data["artifact_type"],
            data["artifact_subtype"],
            data["description"],
            data["quality"],
            data["effect_text"],
            data["unlock_text"],
            data["availability_date"],
            data["raw_tags"],
            data["raw_html"],
        ),
    )

    conn.execute(
        """
        DELETE FROM artifact_formulas
        WHERE artifact_id = ?
        """,
        (data["id"],),
    )

    for index, formula in enumerate(data["formulas"]):
        conn.execute(
            """
            INSERT OR REPLACE INTO artifact_formulas (
                artifact_id,
                formula_id,
                formula_index,
                formula_json
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                data["id"],
                formula_id_from_json(formula),
                index,
                formula,
            ),
        )

    conn.execute(
        """
        DELETE FROM artifact_relations
        WHERE artifact_id = ?
        """,
        (data["id"],),
    )

    for index, item in enumerate(data["relations"]):
        conn.execute(
            """
            INSERT INTO artifact_relations (
                artifact_id,
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
            "artifact",
            data["name"],
            data["image"],
            data["detail_url"],
        ),
    )


def already_saved(conn, path):
    row = conn.execute(
        """
        SELECT 1
        FROM artifacts
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
        default=1.0,
    )

    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
    )

    parser.add_argument(
        "--force",
        action="store_true",
        help="Fetch and overwrite rows even if artifact already exists.",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
    )

    args = parser.parse_args()

    conn = connect_db()
    session = requests.Session()

    paths = fetch_list_paths(
        session,
        args.sleep,
        args.max_retries,
    )

    if args.limit > 0:
        paths = paths[:args.limit]

    print("[INFO] DB:", DB_PATH)
    print("[INFO] Artifact paths:", len(paths))

    counts = {
        "inserted": 0,
        "skipped": 0,
        "failed": 0,
    }

    for path in paths:
        if not args.force and already_saved(conn, path):
            counts["skipped"] += 1
            print("[SKIP]", path)
            continue

        print("[FETCH]", path)

        try:
            if args.dry_run:
                counts["inserted"] += 1
                print("[DRY RUN]", absolute_url(path))
                continue

            soup, raw_html = fetch_detail(
                session,
                path,
                args.sleep,
                args.max_retries,
            )

            data = parse_artifact(
                path,
                soup,
                raw_html,
            )

            save_artifact(
                conn,
                data,
            )

            conn.commit()

            counts["inserted"] += 1

            print(
                "[OK]",
                data["name"],
                "|",
                data["artifact_type"],
                "| formulas:",
                len(data["formulas"]),
                "| relations:",
                len(data["relations"]),
            )

            time.sleep(args.sleep)

        except Exception as exc:
            counts["failed"] += 1
            conn.rollback()
            print("[FAILED]", path, "-", exc)

            time.sleep(args.sleep)

    conn.close()

    print("[DONE]", counts)


if __name__ == "__main__":
    main()