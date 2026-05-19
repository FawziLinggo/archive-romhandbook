import json
import time
import sqlite3
import requests

from bs4 import BeautifulSoup

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
)

DB_FILE = os.getenv(
    "DB_FILE",
    "database.db"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}

session = requests.Session()

# =========================================
# SQLITE
# =========================================

conn = sqlite3.connect(DB_FILE)

cursor = conn.cursor()

with open(
    "sql/init.sql",
    "r",
    encoding="utf-8"
) as f:

    sql_script = f.read()

cursor.executescript(sql_script)

conn.commit()

# =========================================
# LISTING
# =========================================

def get_listing_items(page):

    url = f"{BASE_URL}/monsters?page={page}"

    print(f"\n[INFO] LIST PAGE {page}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    cards = soup.select(
        'a[href^="/monsters/"]'
    )

    results = []

    for card in cards:

        href = card.get("href")

        if not href:
            continue

        # skip root page
        if href == "/monsters":
            continue

        item_id = href.split("-")[-1]

        image = card.select_one("img")

        image_url = None

        if image:
            image_url = image.get("src")

        results.append({
            "id": item_id,
            "detail_url": BASE_URL + href,
            "image": image_url,
        })

    return results

# =========================================
# HELPER
# =========================================

def clean_value(value):

    if not value:
        return None

    value = value.strip()

    if value == "":
        return None

    return value

# =========================================
# DETAIL
# =========================================

def get_item_detail(item):

    response = session.get(
        item["detail_url"],
        headers=HEADERS
    )

    if response.status_code != 200:

        print("[ERROR] DETAIL FAILED")

        return

    raw_html = response.text

    soup = BeautifulSoup(
        raw_html,
        "lxml"
    )

    # =====================================
    # BASIC INFO
    # =====================================

    name = None

    race = None
    element = None
    size = None
    location = None

    name_tag = soup.select_one(
        "span.text.font-semibold.leading-6.text-emerald-200"
    )

    if name_tag:
        name = name_tag.get_text(strip=True)

    info_tag = soup.select_one(
        "p.mt-1.text-sm.font-semibold.leading-5.text-gray-200"
    )

    if info_tag:

        parts = [
            x.strip()
            for x in info_tag.get_text(
                " ",
                strip=True
            ).split("·")
        ]

        if len(parts) >= 1:
            race = parts[0]

        if len(parts) >= 2:
            element = parts[1]

        if len(parts) >= 3:
            size = parts[2]

        if len(parts) >= 4:
            location = parts[3]

    # =====================================
    # STATS
    # =====================================

    stats = {}

    rows = soup.select("table tbody tr")

    for row in rows:

        cols = row.select("td")

        if len(cols) < 4:
            continue

        key1 = cols[0].get_text(strip=True)
        val1 = cols[1].get_text(strip=True)

        key2 = cols[2].get_text(strip=True)
        val2 = cols[3].get_text(strip=True)

        stats[key1] = clean_value(val1)
        stats[key2] = clean_value(val2)

    # =====================================
    # RAW JSON
    # =====================================

    raw_json = None

    code_tag = soup.select_one(
        "code.language-json"
    )

    if code_tag:

        raw_json = code_tag.get_text(
            strip=True
        )

    # =====================================
    # SAVE
    # =====================================

    cursor.execute("""
    INSERT OR REPLACE INTO monsters (
        id,
        detail_url,
        image,

        name,

        race,
        element,
        size,
        location,

        level,
        hp,

        base_exp,
        job_exp,

        str,
        agi,
        vit,
        int_stat,
        dex,
        luk,

        atk,
        matk,

        def,
        mdef,

        hit,
        flee,

        move_speed,
        aspd,

        raw_json,
        raw_html
    )
    VALUES (
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?
    )
    """, (

        item["id"],
        item["detail_url"],
        item["image"],

        name,

        race,
        element,
        size,
        location,

        stats.get("Level"),
        stats.get("HP"),

        stats.get("Base Exp"),
        stats.get("Job Exp"),

        stats.get("Str"),
        stats.get("Agi"),
        stats.get("Vit"),
        stats.get("Int"),
        stats.get("Dex"),
        stats.get("Luk"),

        stats.get("Atk"),
        stats.get("M.Atk"),

        stats.get("Def"),
        stats.get("M.Def"),

        stats.get("Hit"),
        stats.get("Flee"),

        stats.get("MoveSpd"),
        stats.get("ASPD"),

        raw_json,
        raw_html
    ))

    conn.commit()

       # save to things table

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
        "monster",
        name,
        item["image"],
        item["detail_url"]
    ))

    conn.commit()

    print(f"[OK] {name}")

# =========================================
# MAIN
# =========================================

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

            time.sleep(0.5)

        except Exception as e:

            print("ERROR:", e)

    page += 1

conn.close()

print("\n[INFO] DONE")