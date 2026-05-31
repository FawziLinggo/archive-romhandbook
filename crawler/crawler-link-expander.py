import argparse
import json
import os
import random
import re
import sqlite3
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
)

DB_FILE = "../backend-api/storage/rom.db"

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

DIRECT_PATHS = {
    "/skills/": "skills",
    "/jobs/": "jobs",
    "/monsters/": "monsters",
    "/pets/": "pets",
    "/buffs/": "buffs",
    "/mounts/": "mounts",
    "/formulas/": "formulas_code",
}

CATEGORY_ROOTS = {
    "/cards",
    "/skills",
    "/jobs",
    "/monsters",
    "/pets",
    "/buffs",
    "/mounts",
    "/formulas",
    "/equipments",
    "/headwears",
    "/things",
}

HEADWEAR_TYPES = {
    "Headwear",
    "Face",
    "Mouth",
    "Back",
    "Tail",
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

PET_HEADWEAR_UNLOCK_TYPES = {
    "Pet Headwear Unlock Item",
    "Pet Headwear Blueprint",
}

EQUIPMENT_TYPES = {
    "Accessory",
    "Armor",
    "Costume",
    "Footgears",
    "Garments",
    "Off Hand Bangle",
    "Off Hand Bracer",
    "Off Hand Holy Statue",
    "Off Hand Jewelry",
    "Off Hand Rig",
    "Off Hand Shield",
    "Weapon",
    "Weapon Axe",
    "Weapon Book",
    "Weapon Bow",
    "Weapon Dagger",
    "Weapon Katar",
    "Weapon Knuckles",
    "Weapon Mace",
    "Weapon Musical Instrument",
    "Weapon Pistol",
    "Weapon Rifle",
    "Weapon Spear",
    "Weapon Staff",
    "Weapon Sword",
    "Weapon Whip",
}

MATERIAL_TYPES = {
    "Crafting Material",
    "Blueprint",
    "Potion Effect",
}

THING_TYPE_BY_TABLE = {
    "cards": "card",
    "equipments": "equipment",
    "headwears": "headwear",
    "crafting_materials": "crafting_material",
    "monsters": "monster",
    "mounts": "mount",
    "pet_eggs": "pet_egg",
    "furnitures": "furniture",
    "cooking_ingredients": "cooking_ingredient",
    "artifacts": "artifact",
    "pet_headwear_unlock_items": "pet_headwear_unlock_item",
}

INSERT_COLUMNS = {
    "cards": [
        "id",
        "detail_url",
        "image",
        "name",
        "card_type",
        "raw_html",
    ],
    "artifacts": [
    "id",
    "detail_url",
    "image",
    "name",
    "artifact_type",
    "description",
    "raw_html",
],
    "equipments": [
        "id",
        "detail_url",
        "image",
        "name",
        "type",
        "description",
        "raw_html",
    ],
    "headwears": [
        "id",
        "detail_url",
        "image",
        "name",
        "type",
        "description",
        "raw_html",
    ],
    "crafting_materials": [
        "id",
        "detail_url",
        "image",
        "name",
        "material_type",
        "description",
        "raw_html",
    ],
    "monsters": [
        "id",
        "detail_url",
        "image",
        "name",
        "raw_html",
    ],
    "mounts": [
        "id",
        "detail_url",
        "image",
        "name",
        "mount_type",
        "description",
        "raw_html",
    ],
    "pet_eggs": [
        "id",
        "detail_url",
        "image",
        "name",
        "description",
        "raw_html",
    ],
    "pets": [
        "id",
        "detail_url",
        "image",
        "name",
        "description",
        "raw_html",
    ],
    "skills": [
        "id",
        "detail_url",
        "image",
        "name",
        "description",
        "raw_html",
    ],
    "buffs": [
        "id",
        "detail_url",
        "image",
        "name",
        "description",
        "raw_html",
    ],
    "jobs": [
        "id",
        "slug",
        "detail_url",
        "image",
        "name",
        "raw_html",
    ],
    "formulas_code": [
        "id",
        "name",
        "detail_url",
        "formula_code",
        "raw_html",
    ],
    "furnitures": [
        "id",
        "detail_url",
        "image",
        "name",
        "furniture_type",
        "furniture_subtype",
        "is_blueprint",
        "description",
        "raw_html",
    ],
    "cooking_ingredients": [
        "id",
        "detail_url",
        "image",
        "name",
        "ingredient_type",
        "description",
        "raw_html",
    ],
    "pet_headwear_unlock_items": [
        "id",
        "detail_url",
        "image",
        "name",
        "item_type",
        "pet_headwear_name",
        "pet_name",
        "description",
        "raw_html",
    ],
}


def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    init_path = Path("sql") / "init.sql"

    if init_path.exists():
        conn.executescript(init_path.read_text(encoding="utf-8"))

    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS crawl_unknown_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE,
            source_table TEXT,
            source_id TEXT,
            reason TEXT,
            detected_name TEXT,
            detected_types TEXT,
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
        """
    )

    conn.commit()

    return conn


def normalize_path(href):
    if not href:
        return None

    href = href.strip()

    if href.startswith("#"):
        return None

    absolute = urljoin(BASE_URL + "/", href)
    parsed = urlparse(absolute)
    base_host = urlparse(BASE_URL).netloc

    if parsed.netloc != base_host:
        return None

    path = parsed.path.rstrip("/")

    if not path:
        return None

    if path in CATEGORY_ROOTS:
        return None

    if path.startswith("/assets/"):
        return None

    if path.startswith("/search"):
        return None

    allowed = (
        "/things/",
        "/skills/",
        "/jobs/",
        "/monsters/",
        "/pets/",
        "/buffs/",
        "/mounts/",
        "/formulas/",
    )

    if not path.startswith(allowed):
        return None

    return path


def extract_links(raw_html):
    soup = BeautifulSoup(raw_html or "", "html.parser")
    links = set()

    for a in soup.select("a[href]"):
        path = normalize_path(a.get("href"))

        if path:
            links.add(path)

    return links


def get_raw_source_tables(conn, selected):
    if selected:
        return selected

    rows = conn.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
        """
    ).fetchall()

    tables = []

    for row in rows:
        table = row["name"]

        if table.startswith("sqlite_"):
            continue

        cols = {
            col["name"]
            for col in conn.execute(f"PRAGMA table_info({table})").fetchall()
        }

        if "raw_html" in cols:
            tables.append(table)

    return tables


def iter_source_rows(conn, source_tables):
    for table in source_tables:
        cols = {
            col["name"]
            for col in conn.execute(f"PRAGMA table_info({table})").fetchall()
        }

        id_col = "id" if "id" in cols else "rowid"

        rows = conn.execute(
            f"""
            SELECT
                {id_col} AS source_id,
                raw_html
            FROM {table}
            WHERE raw_html IS NOT NULL
              AND TRIM(raw_html) != ''
            """
        )

        for row in rows:
            yield table, str(row["source_id"]), row["raw_html"]


def slug_from_path(path):
    return path.strip("/").split("/")[-1]


def id_from_path(path):
    slug = slug_from_path(path)
    match = re.search(r"-(\d+)$", slug)

    if match:
        return match.group(1)

    return slug


def detail_variants(path):
    slug = slug_from_path(path)

    variants = {
        path,
        BASE_URL + path,
        slug,
    }

    if path.startswith("/skills/"):
        variants.add(path.replace("/skills/", "", 1))

    if path.startswith("/pets/"):
        variants.add(path.replace("/pets/", "", 1))

    return list(variants)


def normalize_detail_for_table(table, path):
    if table == "skills":
        return path.replace("/skills/", "", 1)

    if table == "pets":
        return path.replace("/pets/", "", 1)

    return path


def exists_in_table(conn, table, path):
    if table not in INSERT_COLUMNS:
        return False

    cols = {
        col["name"]
        for col in conn.execute(f"PRAGMA table_info({table})").fetchall()
    }

    checks = []
    values = []

    if "detail_url" in cols:
        variants = detail_variants(path)
        placeholders = ",".join(["?"] * len(variants))
        checks.append(f"detail_url IN ({placeholders})")
        values.extend(variants)

    if "id" in cols:
        checks.append("id = ?")
        values.append(id_from_path(path))

    if not checks:
        return False

    row = conn.execute(
        f"""
        SELECT 1
        FROM {table}
        WHERE {" OR ".join(checks)}
        LIMIT 1
        """,
        values,
    ).fetchone()

    return row is not None


def get_existing_thing(conn, path):
    row = conn.execute(
        """
        SELECT type, name, image, detail_url
        FROM things
        WHERE detail_url IN (?, ?)
        LIMIT 1
        """,
        (
            path,
            BASE_URL + path,
        ),
    ).fetchone()

    if not row:
        return None

    return dict(row)


def clean_body_html(soup):
    body = soup.select_one("body")

    if not body:
        return str(soup)

    for el in body.select(
        "header, .sticky-top, .docs-sidebar, footer, script, style"
    ):
        el.decompose()

    for img in body.select("img[src]"):
        src = img.get("src")

        if src and src.startswith(BASE_URL + "/assets/"):
            img["src"] = src.replace(BASE_URL, "")

    return str(body)


def fetch_page(
    session,
    path,
    sleep_seconds=1.0,
    max_retries=5,
):
    url = BASE_URL + path

    for attempt in range(max_retries):

        if sleep_seconds > 0:
            delay = sleep_seconds + random.uniform(0, sleep_seconds * 0.75)

            time.sleep(delay)

        response = session.get(
                url,
                headers=HEADERS,
                timeout=30,
            )

        if response.status_code == 200:
            source_soup = BeautifulSoup(
                    response.text,
                    "html.parser",
                )

            raw_html = clean_body_html(source_soup)

            soup = BeautifulSoup(
                    raw_html,
                    "html.parser",
                )

            return soup, raw_html

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")

            if retry_after and retry_after.isdigit():
                wait_seconds = int(retry_after)
            else:
                wait_seconds = min(
                        120,
                        max(10, sleep_seconds) * (attempt + 1),
                    )

            print(
                f"[RATE LIMITED] {path} - waiting {wait_seconds}s"
            )

            time.sleep(wait_seconds)

            continue

        if response.status_code >= 500:
            wait_seconds = min(
                    60,
                    5 * (attempt + 1),
                )

            print(
                f"[SERVER ERROR {response.status_code}] {path} - waiting {wait_seconds}s"
            )

            time.sleep(wait_seconds)

            continue

        raise RuntimeError(
            f"HTTP {response.status_code}"
        )

    raise RuntimeError(
        "HTTP 429 too many retries"
    )


def first_text(soup, selectors):
    for selector in selectors:
        node = soup.select_one(selector)

        if node:
            text = node.get_text(" ", strip=True)

            if text:
                return text

    return None


def extract_basic_data(table, path, soup, raw_html, detected_type=None):
    name = first_text(
        soup,
        [
            "span.text.font-semibold.leading-6.text-emerald-200",
            "span.text.font-semibold",
            "span.text-sm.font-semibold.leading-6.text-emerald-200",
            "h1",
            "h2",
            "h4",
        ],
    )

    image = None
    img = soup.select_one("img.h-12, img.h-10, img.h-9, img.h-7, img")

    if img:
        image = img.get("src") or img.get("data-src")

        if image and image.startswith(BASE_URL):
            image = image.replace(BASE_URL, "")

    description = first_text(
        soup,
        [
            "div.text-sm.text-white.font-medium p",
            "div.border-t p",
            "p.text-base",
            "p",
        ],
    )

    item_id = id_from_path(path)
    detail_url = normalize_detail_for_table(table, path)

    data = {
        "id": item_id,
        "slug": slug_from_path(path),
        "detail_url": detail_url,
        "image": image,
        "name": name or slug_from_path(path),
        "description": description,
        "raw_html": raw_html,
        "type": detected_type,
        "card_type": detected_type,
        "material_type": detected_type,
        "mount_type": detected_type,
        "formula_code": None,
    }

    if table == "furnitures":
        furniture_subtype = None
        is_blueprint = 0

        if detected_type and detected_type.startswith("Furniture"):
            furniture_subtype = (
                detected_type
                .replace("Furniture", "", 1)
                .strip()
            )

            if furniture_subtype == "Blueprint":
                is_blueprint = 1

        data.update({
            "furniture_type": detected_type,
            "furniture_subtype": furniture_subtype,
            "is_blueprint": is_blueprint,
        })

    if table == "cooking_ingredients":
        data.update({
            "ingredient_type": detected_type,
        })

    if table == "pet_headwear_unlock_items":
        pet_headwear_name = data["name"]
        pet_name = None

        match = re.match(
            r"^(.*?)\s*\((.*?)\)\s*$",
            data["name"] or "",
        )

        if match:
            pet_headwear_name = match.group(1).strip()
            pet_name = match.group(2).strip()

        data.update({
            "item_type": detected_type,
            "pet_headwear_name": pet_headwear_name,
            "pet_name": pet_name,
        })

    return data

def badge_texts(soup):
    texts = []

    for badge in soup.select("span.inline-flex"):
        text = badge.get_text(" ", strip=True)

        if text:
            texts.append(text)

    return texts


def classify_thing(soup):
    badges = badge_texts(soup)
    badge_set = set(badges)

    for text in badges:
        if "Card" in text:
            return "cards", text, badges

    if badge_set & HEADWEAR_TYPES:
        detected = list(badge_set & HEADWEAR_TYPES)[0]
        return "headwears", detected, badges

    if badge_set & EQUIPMENT_TYPES:
        detected = list(badge_set & EQUIPMENT_TYPES)[0]
        return "equipments", detected, badges
    
    for text in badges:
        if text in PET_HEADWEAR_UNLOCK_TYPES:
            return "pet_headwear_unlock_items", text, badges

    for text in badges:
        if text.startswith("Furniture"):
            return "furnitures", text, badges

    for text in badges:
        if text in INGREDIENT_TYPES:
            return "cooking_ingredients", text, badges

    for text in badges:
        if text.startswith("Weapon ") or text.startswith("Off Hand "):
            return "equipments", text, badges

    if badge_set & MATERIAL_TYPES:
        detected = list(badge_set & MATERIAL_TYPES)[0]
        return "crafting_materials", detected, badges

    if "Mount" in badge_set:
        return "mounts", "Mount", badges

    if "Pet Egg" in badge_set:
        return "pet_eggs", "Pet Egg", badges

    if "Monster" in badge_set:
        return "monsters", "Monster", badges

    name = first_text(
        soup,
        [
            "span.text.font-semibold",
            "h1",
            "h2",
        ],
    ) or ""

    if "egg" in name.lower():
        return "pet_eggs", "Pet Egg", badges
    
    if text.startswith("Artifact"):
        return "artifacts", text, badges

    return None, None, badges


def table_for_direct_path(path):
    for prefix, table in DIRECT_PATHS.items():
        if path.startswith(prefix):
            return table

    return None


def insert_minimal(conn, table, data):
    columns = INSERT_COLUMNS[table]
    placeholders = ",".join(["?"] * len(columns))

    conn.execute(
        f"""
        INSERT OR IGNORE INTO {table} (
            {", ".join(columns)}
        )
        VALUES ({placeholders})
        """,
        [data.get(col) for col in columns],
    )


def upsert_thing(conn, path, table, data):
    thing_type = THING_TYPE_BY_TABLE.get(table)

    if not thing_type:
        return

    conn.execute(
        """
        INSERT OR IGNORE INTO things (
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
            thing_type,
            data["name"],
            data["image"],
            path,
        ),
    )


def save_unknown(conn, path, source_table, source_id, reason, name, badges):
    conn.execute(
        """
        INSERT OR IGNORE INTO crawl_unknown_links (
            path,
            source_table,
            source_id,
            reason,
            detected_name,
            detected_types
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            path,
            source_table,
            source_id,
            reason,
            name,
            json.dumps(badges, ensure_ascii=False),
        ),
    )


def save_failure(conn, path, source_table, source_id, error):
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
            path,
            source_table,
            source_id,
            None,
            str(error),
        ),
    )


def write_unknown_file(conn, output_file):
    rows = conn.execute(
        """
        SELECT
            path,
            reason,
            detected_name,
            detected_types
        FROM crawl_unknown_links
        ORDER BY path
        """
    ).fetchall()

    with open(output_file, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(
                json.dumps(
                    dict(row),
                    ensure_ascii=False,
                )
                + "\n"
            )


def discover_links(conn, source_tables):
    found = {}

    for source_table, source_id, raw_html in iter_source_rows(conn, source_tables):
        for path in extract_links(raw_html):
            found.setdefault(path, set()).add((source_table, source_id))

    return found


def process_path(conn, session, path, source_table, source_id, dry_run, sleep_seconds):
    existing_thing = None

    if path.startswith("/things/"):
        existing_thing = get_existing_thing(conn, path)

        if existing_thing:
            existing_type = existing_thing.get("type")
            table = {
                "card": "cards",
                "equipment": "equipments",
                "headwear": "headwears",
                "crafting_material": "crafting_materials",
                "monster": "monsters",
                "mount": "mounts",
                "pet_egg": "pet_eggs",
                "furniture": "furnitures",
                "cooking_ingredient": "cooking_ingredients",
                "pet_headwear_unlock_item": "pet_headwear_unlock_items",
            }.get(existing_type)

            if table and exists_in_table(conn, table, path):
                return "skip"

        table = None
    else:
        table = table_for_direct_path(path)

        if table and exists_in_table(conn, table, path):
            return "skip"

    if dry_run:
        return "would_fetch"

    soup, raw_html = fetch_page(
    session,
    path,
    sleep_seconds=sleep_seconds,
)

    detected_type = None
    badges = []

    if path.startswith("/things/"):
        table, detected_type, badges = classify_thing(soup)

        # skip if badges null or empty
        if not badges:
            return "skip" 

        if not table:
            name = first_text(
                soup,
                [
                    "span.text.font-semibold",
                    "h1",
                    "h2",
                ],
            )

            save_unknown(
                conn,
                path,
                source_table,
                source_id,
                "unknown things type",
                name,
                badges,
            )

            return "unknown"

        if exists_in_table(conn, table, path):
            return "skip"
    else:
        if not table:
            return "skip"

    data = extract_basic_data(
        table,
        path,
        soup,
        raw_html,
        detected_type=detected_type,
    )

    insert_minimal(conn, table, data)

    if path.startswith("/things/"):
        upsert_thing(conn, path, table, data)

    return "insert"


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--source",
        action="append",
        default=[],
        help="Optional source table. Example: --source skills --source cards",
    )

    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Max missing links to fetch. 0 means unlimited.",
    )

    parser.add_argument(
        "--sleep",
        type=float,
        default=0.4,
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
    )

    parser.add_argument(
        "--unknown-file",
        default=str(Path("unresolved-things-links.jsonl").resolve()),
    )

    args = parser.parse_args()

    conn = connect_db()
    session = requests.Session()

    source_tables = get_raw_source_tables(
        conn,
        args.source,
    )

    print("[INFO] DB:", DB_PATH)
    print("[INFO] Source tables:", ", ".join(source_tables))

    discovered = discover_links(
        conn,
        source_tables,
    )

    print("[INFO] Unique links found:", len(discovered))

    counts = {
        "skip": 0,
        "would_fetch": 0,
        "insert": 0,
        "unknown": 0,
        "failed": 0,
    }

    processed = 0

    for path, sources in sorted(discovered.items()):
        if args.limit and processed >= args.limit:
            break

        source_table, source_id = sorted(sources)[0]

        try:
            result = process_path(
    conn,
    session,
    path,
    source_table,
    source_id,
    args.dry_run,
    args.sleep,
)

            counts[result] = counts.get(result, 0) + 1

            if result in {"insert", "unknown", "would_fetch"}:
                processed += 1
                print(f"[{result.upper()}] {path}")

                if not args.dry_run:
                    conn.commit()
                    time.sleep(args.sleep)

        except Exception as exc:
            counts["failed"] += 1
            processed += 1
            save_failure(
                conn,
                path,
                source_table,
                source_id,
                exc,
            )
            conn.commit()
            print(f"[FAILED] {path} - {exc}")

    write_unknown_file(
        conn,
        args.unknown_file,
    )

    conn.commit()
    conn.close()

    print("[DONE]", counts)
    print("[UNKNOWN FILE]", args.unknown_file)


if __name__ == "__main__":
    main()