import json
import time
import sqlite3
import requests

from bs4 import BeautifulSoup

# get from .env 
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv("BASE_URL", "https://romhandbook.com")

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


DB_FILE = os.getenv("DB_FILE", "database.db")
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
# GET LISTING
# =========================================

def get_listing_items(page):

    url = f"{BASE_URL}/equipments?page={page}"

    print(f"\n[INFO] LIST PAGE {page}")

    response = session.get(
        url,
        headers=HEADERS
    )

    # print("[STATUS]", response.status_code)

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
# GET DETAIL
# =========================================

def get_item_detail(item):

    print(f"[DETAIL] {item['detail_url']}")

    response = session.get(
        item["detail_url"],
        headers=HEADERS
    )

    if response.status_code != 200:

        print("[ERROR] DETAIL FAILED")

        return None

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    raw_html = response.text

    # =====================================
    # NAME
    # =====================================

    name = None

    name_tag = soup.select_one(
        "span.text.font-semibold.leading-6.text-emerald-200"
    )

    if name_tag:
        name = name_tag.get_text(strip=True)

    # =====================================
    # TYPE
    # =====================================

    item_type = None

    type_tag = soup.select_one(
        "span.inline-flex.items-center"
    )

    if type_tag:
        item_type = type_tag.get_text(strip=True)

    # =====================================
    # DESCRIPTION
    # =====================================

    description = None

    desc_tag = soup.select_one(
        "p.text-base"
    )

    if desc_tag:
        description = desc_tag.get_text(strip=True)

    # =====================================
    # EFFECT / UNLOCK / JOBS
    # =====================================

    effect_text = None
    unlock_text = None

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

        # =================================
        # EFFECT
        # =================================

        if label == "Effect":

            p = row.select_one(
                "p.text-sm.font-light.leading-6.text-white"
            )

            if p:

                effect_text = p.get_text(
                    " ",
                    strip=True
                )

        # =================================
        # UNLOCK
        # =================================

        elif label == "Unlock":

            p = row.select_one(
                "p.text-sm.font-light.leading-6.text-white"
            )

            # unlock text
            if p:

                unlock_text = p.get_text(
                    " ",
                    strip=True
                )

            # unlock stats
            else:

                unlock_stats = [
                    x.get_text(strip=True)
                    for x in row.select(
                        "span, p"
                    )
                    if x.get_text(strip=True)
                    and x.get_text(strip=True) != "Unlock"
                ]

        # =================================
        # DEPOSIT
        # =================================

        elif label == "Deposit":

            deposit_stats = [
                x.get_text(strip=True)
                for x in row.select(
                    "span, p"
                )
                if x.get_text(strip=True)
                and x.get_text(strip=True) != "Deposit"
            ]

        # =================================
        # JOBS
        # =================================

        elif label == "Jobs":

            jobs = [
                x.get_text(strip=True)
                for x in row.select(
                    "span.inline-flex"
                )
                if x.get_text(strip=True)
            ]

    # =====================================
    # FORMULA JSON
    # =====================================

    formula_json = None
    formula_id = None

    code_tag = soup.select_one(
        "code.language-json"
    )

    if code_tag:

        raw_json = code_tag.get_text(
            strip=True
        )

        try:

            formula_json = json.loads(raw_json)

            formula_id = str(
                formula_json.get("id")
            )

        except:

            formula_json = raw_json

    # =====================================
    # SAVE FORMULA
    # =====================================

    if formula_id and formula_json:

        cursor.execute("""
        INSERT OR REPLACE INTO formulas (
            id,
            raw_json
        )
        VALUES (?, ?)
        """, (
            formula_id,
            json.dumps(
                formula_json,
                ensure_ascii=False
            )
        ))

    # =====================================
    # SAVE EQUIPMENT
    # =====================================

    cursor.execute("""
    INSERT OR REPLACE INTO equipments (
        id,
        detail_url,
        image,
        name,
        type,
        description,
        effect_text,
        unlock_text,
        deposit_stats,
        unlock_stats,
        jobs,
        formula_id,
        raw_html
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item["id"],
        item["detail_url"],
        item["image"],
        name,
        item_type,
            description,    
    effect_text,
    unlock_text,
    json.dumps(
        deposit_stats,
        ensure_ascii=False
    ),
    json.dumps(
        unlock_stats,
        ensure_ascii=False
    ),
    json.dumps(
        jobs,
        ensure_ascii=False
    ),
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
        "equipment",
        name,
        item["image"],
        item["detail_url"]
        
    ))

    conn.commit()

    print(f"[OK] {name}")

    return True


# =========================================
# MAIN LOOP
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


# =========================================
# DONE
# =========================================

conn.close()

print("\n[INFO] DONE")