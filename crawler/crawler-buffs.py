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
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64; rv:150.0) "
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
# GET LIST
# =========================================

def get_buff_list(page):

    url = f"{BASE_URL}/buffs?page={page}"

    print(f"\n[INFO] PAGE {page}")
    print(f"[INFO] URL {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    links = soup.select(
        'a[href^="/buffs/"]'
    )

    results = []

    seen = set()

    for link in links:

        href = link.get("href")

        if not href:
            continue

        if href == "/buffs":
            continue

        if href in seen:
            continue

        seen.add(href)

        name = link.get_text(
            strip=True
        )

        buff_id = href.replace(
            "/buffs/",
            ""
        )

        results.append({
            "id": buff_id,
            "name": name,
            "detail_url": BASE_URL + href
        })

    print(
        f"[INFO] FOUND {len(results)} BUFFS"
    )

    return results

# =========================================
# DETAIL
# =========================================

def get_buff_detail(item):

    url = item["detail_url"]

    # print(f"[DETAIL] {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    raw_html = response.text

    # =====================================
    # IMAGE
    # =====================================

    image = None

    image_tag = soup.select_one(
        "img"
    )

    if image_tag:
        image = image_tag.get("src")

    # =====================================
    # DESCRIPTION
    # =====================================

    description = None

    desc_tag = soup.select_one(
        "p.text-white"
    )

    if desc_tag:

        description = desc_tag.get_text(
            " ",
            strip=True
        )

    # =====================================
    # RAW JSON
    # =====================================

    raw_json = None

    code_block = soup.select_one(
        "pre code"
    )

    if code_block:

        raw_json = code_block.get_text(
            "\n",
            strip=True
        )

        # pretty format kalau valid json
        try:

            parsed = json.loads(raw_json)

            raw_json = json.dumps(
                parsed,
                indent=2,
                ensure_ascii=False
            )

        except:
            pass

    return {
        "id": item["id"],
        "name": item["name"],
        "detail_url": item["detail_url"],
        "image": image,
        "description": description,
        "raw_json": raw_json,
        "raw_html": raw_html
    }

# =========================================
# SAVE
# =========================================

def save_buff(data):

    cursor.execute("""
        INSERT OR REPLACE INTO buffs (
            id,
            name,
            detail_url,
            image,
            description,
            raw_json,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["name"],
        data["detail_url"],
        data["image"],
        data["description"],
        data["raw_json"],
        data["raw_html"]
    ))

    conn.commit()

# =========================================
# MAIN
# =========================================

def main():

    page = 1

    while True:

        buffs = get_buff_list(
            page
        )

        if not buffs:

            print(
                "\n[INFO] NO MORE BUFFS"
            )

            break

        for item in buffs:

            try:

                detail = get_buff_detail(
                    item
                )

                save_buff(detail)

                # print(
                #     f"[SAVED] {detail['name']}"
                # )

                time.sleep(0.3)

            except Exception as e:

                print(
                    f"[ERROR] {item['detail_url']}"
                )

                print(e)

        page += 1

    print("\n[DONE]")


if __name__ == "__main__":
    main()