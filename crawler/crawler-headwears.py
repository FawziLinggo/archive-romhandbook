import json
import time
import sqlite3
import requests

from bs4 import BeautifulSoup

# ENV
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

    url = f"{BASE_URL}/headwears?page={page}"

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
        'a[href^="/things/"]'
    )

    results = []

    for card in cards:

        href = card.get("href")

        if not href:
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
    item_type = None
    description = None
    quality = None

    name_tag = soup.select_one(
        "span.text.font-semibold.leading-6.text-emerald-200"
    )

    if name_tag:
        name = name_tag.get_text(strip=True)

    type_tag = soup.select_one(
        "span.inline-flex.items-center"
    )

    if type_tag:
        item_type = type_tag.get_text(strip=True)

    desc_tag = soup.select_one(
        "p.text-base"
    )

    if desc_tag:
        description = desc_tag.get_text(strip=True)

    # =====================================
    # DETAILS
    # =====================================

    effect_text = []
    unlock_text = []

    deposit_stats = []
    unlock_stats = []

    jobs = []

    rows = soup.select(
        "div.grid.grid-cols-12"
    )

    for row in rows:

        label_span = row.select_one(
            "span.text-sm.font-light.leading-6.text-emerald-200"
        )

        if not label_span:
            continue

        label = label_span.get_text(
            strip=True
        )

        content_divs = row.select(
            "div.col-span-10"
        )

        if not content_divs:
            continue

        content = content_divs[0]

        # =================================
        # QUALITY
        # =================================

        if label == "Quality":

            quality = content.get_text(
                " ",
                strip=True
            )

        # =================================
        # EFFECT
        # =================================

        elif label == "Effect":

            effect_text = [
                p.get_text(
                    " ",
                    strip=True
                )
                for p in content.select("p")
            ]

        # =================================
        # DEPOSIT
        # =================================

        elif label == "Deposit":

            deposit_stats = [
                p.get_text(
                    " ",
                    strip=True
                )
                for p in content.select("p")
            ]

        # =================================
        # UNLOCK
        # =================================

        elif label == "Unlock":

            unlock_text = [
                p.get_text(
                    " ",
                    strip=True
                )
                for p in content.select("p")
            ]

            unlock_stats = unlock_text

        # =================================
        # JOBS
        # =================================

        elif label == "Jobs":

            jobs = [
                x.get_text(strip=True)
                for x in content.select(
                    "span.inline-flex"
                )
            ]

    # =====================================
    # FORMULA
    # =====================================

    formula_id = None

    code_tags = soup.select(
        "code.language-json"
    )

    for code_tag in code_tags:

        raw_json = code_tag.get_text(
            strip=True
        )

        try:

            formula_json = json.loads(
                raw_json
            )

            current_formula_id = str(
                formula_json.get("id")
            )

            cursor.execute("""
            INSERT OR REPLACE INTO formulas (
                id,
                raw_json
            )
            VALUES (?, ?)
            """, (
                current_formula_id,
                json.dumps(
                    formula_json,
                    ensure_ascii=False
                )
            ))

            # ambil formula terakhir sebagai root
            formula_id = current_formula_id

        except Exception as e:

            print("[FORMULA ERROR]", e)

    # =====================================
    # SAVE HEADWEAR
    # =====================================

    cursor.execute("""
    INSERT OR REPLACE INTO headwears (
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
        "headwear",
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
