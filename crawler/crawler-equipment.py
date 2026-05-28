import json
import time
import sqlite3
import requests
import os

from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv("BASE_URL", "https://romhandbook.com")
DB_FILE = os.getenv("DB_FILE", "database.db")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}

session = requests.Session()

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

with open("sql/init.sql", "r", encoding="utf-8") as f:
    cursor.executescript(f.read())

conn.commit()


def ensure_schema():
    try:
        cursor.execute("ALTER TABLE equipments ADD COLUMN quality TEXT")
    except sqlite3.OperationalError:
        pass

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS equipment_formulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id TEXT NOT NULL,
            formula_id TEXT,
            formula_index INTEGER NOT NULL,
            formula_json TEXT,
            UNIQUE(equipment_id, formula_index)
        );

        CREATE TABLE IF NOT EXISTS equipment_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id TEXT NOT NULL,
            relation_type TEXT NOT NULL,
            related_id TEXT,
            related_name TEXT,
            related_image TEXT,
            related_url TEXT,
            relation_index INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS equipment_tiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id TEXT NOT NULL,
            tier_index INTEGER NOT NULL,
            tier_text TEXT NOT NULL,
            UNIQUE(equipment_id, tier_index)
        );

        CREATE TABLE IF NOT EXISTS equipment_equip_effects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id TEXT NOT NULL,
            effect_index INTEGER NOT NULL,
            effect_text TEXT,
            UNIQUE(equipment_id, effect_index)
        );

        CREATE TABLE IF NOT EXISTS equipment_equip_effect_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equip_effect_id INTEGER NOT NULL,
            item_id TEXT,
            item_name TEXT,
            item_image TEXT,
            item_url TEXT,
            item_index INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_equipment_relations_equipment_id
        ON equipment_relations(equipment_id);

        CREATE INDEX IF NOT EXISTS idx_equipment_tiers_equipment_id
        ON equipment_tiers(equipment_id);

        CREATE INDEX IF NOT EXISTS idx_equipment_formulas_equipment_id
        ON equipment_formulas(equipment_id);

        CREATE INDEX IF NOT EXISTS idx_equipment_equip_effects_equipment_id
        ON equipment_equip_effects(equipment_id);

        CREATE INDEX IF NOT EXISTS idx_equipment_equip_effect_items_effect_id
        ON equipment_equip_effect_items(equip_effect_id);
    """)

    conn.commit()


ensure_schema()


def normalize_url(value):
    if not value:
        return value

    return (
        value
        .replace("https://romhandbook.com", "")
        .replace("http://romhandbook.com", "")
    )


def absolute_url(value):
    if not value:
        return value

    if value.startswith("http"):
        return value

    return BASE_URL + value


def get_id_from_url(url):
    if not url:
        return None

    clean_url = url.rstrip("/")
    last_part = clean_url.split("/")[-1]

    if "-" not in last_part:
        return last_part

    return last_part.split("-")[-1]


def clean_lines(text):
    return [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]


def extract_text_items(content):
    items = []

    paragraphs = content.select("p")

    if paragraphs:
        for p in paragraphs:
            text = p.get_text("\n", strip=True)
            items.extend(clean_lines(text))

        return items

    text = content.get_text("\n", strip=True)

    return clean_lines(text)


def extract_detail_sections(soup):
    sections = {}

    grid = soup.select_one("div.grid.grid-cols-12")

    if not grid:
        return sections

    children = [
        child
        for child in grid.find_all("div", recursive=False)
    ]

    i = 0

    while i < len(children) - 1:
        label_div = children[i]
        content_div = children[i + 1]

        label_span = label_div.select_one(
            "span.text-sm.font-light.leading-6.text-emerald-200"
        )

        label_classes = label_div.get("class", [])
        content_classes = content_div.get("class", [])

        if (
            not label_span
            or "col-span-2" not in label_classes
            or "col-span-10" not in content_classes
        ):
            i += 1
            continue

        label = label_span.get_text(" ", strip=True)

        sections[label] = content_div

        i += 2

    return sections


def extract_relation_items(content):
    items = []

    links = content.select('a[href^="/things/"]')

    for index, link in enumerate(links):
        href = normalize_url(link.get("href"))

        image_tag = link.select_one("img")
        name_tag = link.select_one(
            "span.text-sm.font-semibold.leading-6.text-emerald-200"
        )

        if not name_tag:
            name_tag = link.select_one("span")

        image = None
        name = None

        if image_tag:
            image = normalize_url(image_tag.get("src"))

        if name_tag:
            name = name_tag.get_text(" ", strip=True)

        items.append({
            "id": get_id_from_url(href),
            "name": name,
            "image": image,
            "url": href,
            "index": index,
        })

    return items


def extract_equip_effects(content):
    effects = []

    blocks = content.select("div.border-dashed.border-b")

    if not blocks:
        blocks = [content]

    for effect_index, block in enumerate(blocks):
        items = extract_relation_items(block)

        p = block.select_one("p.text-sm.font-light.leading-6.text-white")

        effect_text = None

        if p:
            effect_text = p.get_text(" ", strip=True)

        if items or effect_text:
            effects.append({
                "index": effect_index,
                "items": items,
                "effect_text": effect_text,
            })

    return effects


def rewrite_local_assets(body_tag):
    for img in body_tag.find_all("img"):
        src = img.get("src")

        if not src:
            continue

        img["src"] = normalize_url(src)

    for link in body_tag.find_all("link"):
        href = link.get("href")

        if not href:
            continue

        link["href"] = normalize_url(href)

    return body_tag


def get_clean_body_html(soup):
    body_tag = soup.select_one("body")

    if not body_tag:
        return ""

    for el in body_tag.select(
        "header, .sticky-top, .docs-sidebar, footer, script, style"
    ):
        el.decompose()

    for el in body_tag.find_all(
        string=lambda t: t and "will shut down" in t
    ):
        parent = el.find_parent("div")

        if parent:
            parent.decompose()

    body_tag = rewrite_local_assets(body_tag)

    return str(body_tag)


def get_listing_items(page):
    url = f"{BASE_URL}/equipments?page={page}"

    print(f"\n[INFO] LIST PAGE {page}")

    response = session.get(url, headers=HEADERS)

    soup = BeautifulSoup(response.text, "lxml")

    cards = soup.select('a[href^="/things/"]')

    results = []

    for card in cards:
        href = card.get("href")

        if not href:
            continue

        image = card.select_one("img")

        image_url = None

        if image:
            image_url = normalize_url(image.get("src"))

        results.append({
            "id": get_id_from_url(href),
            "detail_url": normalize_url(href),
            "image": image_url,
        })

    return results


def clear_equipment_relations(equipment_id):
    cursor.execute(
        "DELETE FROM equipment_formulas WHERE equipment_id = ?",
        (equipment_id,)
    )

    cursor.execute(
        "DELETE FROM equipment_relations WHERE equipment_id = ?",
        (equipment_id,)
    )

    cursor.execute(
        "DELETE FROM equipment_tiers WHERE equipment_id = ?",
        (equipment_id,)
    )

    cursor.execute("""
        DELETE FROM equipment_equip_effect_items
        WHERE equip_effect_id IN (
            SELECT id
            FROM equipment_equip_effects
            WHERE equipment_id = ?
        )
    """, (equipment_id,))

    cursor.execute(
        "DELETE FROM equipment_equip_effects WHERE equipment_id = ?",
        (equipment_id,)
    )


def save_relation_items(equipment_id, relation_type, items):
    for item in items:
        cursor.execute("""
            INSERT INTO equipment_relations (
                equipment_id,
                relation_type,
                related_id,
                related_name,
                related_image,
                related_url,
                relation_index
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            equipment_id,
            relation_type,
            item.get("id"),
            item.get("name"),
            item.get("image"),
            item.get("url"),
            item.get("index", 0),
        ))


def save_tiers(equipment_id, tiers):
    for index, tier_text in enumerate(tiers):
        cursor.execute("""
            INSERT OR REPLACE INTO equipment_tiers (
                equipment_id,
                tier_index,
                tier_text
            )
            VALUES (?, ?, ?)
        """, (
            equipment_id,
            index,
            tier_text,
        ))


def save_equip_effects(equipment_id, effects):
    for effect in effects:
        cursor.execute("""
            INSERT OR REPLACE INTO equipment_equip_effects (
                equipment_id,
                effect_index,
                effect_text
            )
            VALUES (?, ?, ?)
        """, (
            equipment_id,
            effect["index"],
            effect["effect_text"],
        ))

        equip_effect_id = cursor.lastrowid

        if not equip_effect_id:
            row = cursor.execute("""
                SELECT id
                FROM equipment_equip_effects
                WHERE equipment_id = ?
                AND effect_index = ?
            """, (
                equipment_id,
                effect["index"],
            )).fetchone()

            equip_effect_id = row[0] if row else None

        if not equip_effect_id:
            continue

        for item in effect["items"]:
            cursor.execute("""
                INSERT INTO equipment_equip_effect_items (
                    equip_effect_id,
                    item_id,
                    item_name,
                    item_image,
                    item_url,
                    item_index
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                equip_effect_id,
                item.get("id"),
                item.get("name"),
                item.get("image"),
                item.get("url"),
                item.get("index", 0),
            ))


def save_formulas(equipment_id, soup):
    formula_id = None

    code_tags = soup.select("code.language-json")

    for index, code_tag in enumerate(code_tags):
        raw_json = code_tag.get_text(strip=True)

        try:
            formula_json = json.loads(raw_json)
            current_formula_id = str(formula_json.get("id"))

            cursor.execute("""
                INSERT OR REPLACE INTO formulas (
                    id,
                    raw_json
                )
                VALUES (?, ?)
            """, (
                current_formula_id,
                json.dumps(formula_json, ensure_ascii=False),
            ))

            cursor.execute("""
                INSERT OR REPLACE INTO equipment_formulas (
                    equipment_id,
                    formula_id,
                    formula_index,
                    formula_json
                )
                VALUES (?, ?, ?, ?)
            """, (
                equipment_id,
                current_formula_id,
                index,
                json.dumps(formula_json, ensure_ascii=False),
            ))

            if formula_id is None:
                formula_id = current_formula_id

        except Exception as e:
            print("[FORMULA ERROR]", e)

            cursor.execute("""
                INSERT OR REPLACE INTO equipment_formulas (
                    equipment_id,
                    formula_id,
                    formula_index,
                    formula_json
                )
                VALUES (?, ?, ?, ?)
            """, (
                equipment_id,
                None,
                index,
                raw_json,
            ))

    return formula_id


def get_item_detail(item):
    request_url = absolute_url(item["detail_url"])

    print(f"[DETAIL] {request_url}")

    response = session.get(request_url, headers=HEADERS)

    if response.status_code != 200:
        print("[ERROR] DETAIL FAILED")
        return None

    source_soup = BeautifulSoup(response.text, "lxml")

    raw_html = get_clean_body_html(source_soup)

    soup = BeautifulSoup(raw_html, "lxml")

    name = None
    item_type = None
    description = None
    quality = None

    name_tag = soup.select_one(
        "span.text.font-semibold.leading-6.text-emerald-200"
    )

    if name_tag:
        name = name_tag.get_text(" ", strip=True)

    type_tag = soup.select_one("span.inline-flex.items-center")

    if type_tag:
        item_type = type_tag.get_text(" ", strip=True)

    desc_tag = soup.select_one(
        "div.mt-1.grid.grid-cols-1 > div.border-t p.text-base"
    )

    if desc_tag:
        description = desc_tag.get_text(" ", strip=True)

    effect_text = []
    unlock_text = []
    deposit_stats = []
    unlock_stats = []
    jobs = []

    synth_from = []
    tiers = []
    equip_effects = []
    craft_materials = []

    sections = extract_detail_sections(soup)

    if "Quality" in sections:
        quality_items = extract_text_items(sections["Quality"])
        quality = quality_items[0] if quality_items else None

    if "Effect" in sections:
        effect_text = extract_text_items(sections["Effect"])

    if "Unlock" in sections:
        unlock_text = extract_text_items(sections["Unlock"])
        unlock_stats = unlock_text

    if "Deposit" in sections:
        deposit_stats = extract_text_items(sections["Deposit"])

    if "Jobs" in sections:
        jobs_section = sections["Jobs"]

        jobs = [
            x.get_text(strip=True)
            for x in jobs_section.select("span.inline-flex")
            if x.get_text(strip=True)
        ]

        if not jobs:
            jobs = extract_text_items(jobs_section)

    if "Synth From" in sections:
        synth_from = extract_relation_items(sections["Synth From"])

    if "Tiers" in sections:
        tiers = extract_text_items(sections["Tiers"])

    if "Equip Effects" in sections:
        equip_effects = extract_equip_effects(sections["Equip Effects"])

    if "Craft Materials" in sections:
        craft_materials = extract_relation_items(sections["Craft Materials"])

    item["detail_url"] = normalize_url(item["detail_url"])
    item["image"] = normalize_url(item["image"])

    clear_equipment_relations(item["id"])

    formula_id = save_formulas(item["id"], soup)

    cursor.execute("""
        INSERT OR REPLACE INTO equipments (
            id,
            detail_url,
            image,
            name,
            type,
            description,
            quality,
            effect_text,
            unlock_text,
            deposit_stats,
            unlock_stats,
            jobs,
            formula_id,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item["id"],
        item["detail_url"],
        item["image"],
        name,
        item_type,
        description,
        quality,
        json.dumps(effect_text, ensure_ascii=False),
        json.dumps(unlock_text, ensure_ascii=False),
        json.dumps(deposit_stats, ensure_ascii=False),
        json.dumps(unlock_stats, ensure_ascii=False),
        json.dumps(jobs, ensure_ascii=False),
        formula_id,
        raw_html,
    ))

    save_relation_items(
        item["id"],
        "synth_from",
        synth_from
    )

    save_relation_items(
        item["id"],
        "craft_material",
        craft_materials
    )

    save_tiers(
        item["id"],
        tiers
    )

    save_equip_effects(
        item["id"],
        equip_effects
    )

    cursor.execute("""
        INSERT OR REPLACE INTO things (
            id,
            type,
            name,
            image,
            detail_url
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        item["id"],
        "equipment",
        name,
        item["image"],
        item["detail_url"],
    ))

    conn.commit()

    print(
        "[OK]",
        name,
        "| effect:",
        len(effect_text),
        "| unlock:",
        len(unlock_text),
        "| jobs:",
        len(jobs),
        "| synth:",
        len(synth_from),
        "| tiers:",
        len(tiers),
        "| equip effects:",
        len(equip_effects),
        "| craft:",
        len(craft_materials),
    )

    return True


page = 1
seen_ids = set()

while True:
    listing_items = get_listing_items(page)

    print(f"[INFO] FOUND {len(listing_items)} ITEMS")

    if len(listing_items) == 0:
        print("[INFO] NO MORE ITEMS")
        break

    new_items = []

    for item in listing_items:
        if item["id"] not in seen_ids:
            seen_ids.add(item["id"])
            new_items.append(item)

    if len(new_items) == 0:
        print("[INFO] NO NEW ITEMS")
        break

    for item in new_items:
        try:
            get_item_detail(item)
            time.sleep(1)

        except Exception as e:
            print("ERROR:", e)

    page += 1

conn.close()

print("\n[INFO] DONE")