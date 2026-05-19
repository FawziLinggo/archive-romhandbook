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

# =========================
# GET FORMULA LIST
# =========================
def get_formula_list(page):

    url = f"{BASE_URL}/formulas?page={page}"

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
        'a[href^="/formulas/"]'
    )

    results = []

    seen = set()

    for link in links:

        href = link.get("href")

        if not href:
            continue

        if href == "/formulas":
            continue

        if href in seen:
            continue

        seen.add(href)

        name_tag = link.select_one("p")

        name = None

        if name_tag:
            name = name_tag.get_text(
                strip=True
            )

        formula_id = href.replace(
            "/formulas/",
            ""
        )

        results.append({
            "id": formula_id,
            "name": name,
            "detail_url": BASE_URL + href
        })

    print(
        f"[INFO] FOUND {len(results)} FORMULAS"
    )

    return results
# =========================
# GET FORMULA DETAIL
# =========================

def get_formula_detail(item):

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

    # formula code
    code_block = soup.select_one(
        "pre code"
    )

    formula_code = None

    if code_block:
        formula_code = code_block.get_text(
            "\n",
            strip=True
        )

    return {
        "id": item["id"],
        "name": item["name"],
        "detail_url": item["detail_url"],
        "formula_code": formula_code,
        "raw_html": raw_html
    }


# =========================
# SAVE
# =========================

def save_formula(data):

    cursor.execute("""
        INSERT OR REPLACE INTO formulas_code (
            id,
            name,
            detail_url,
            formula_code,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["name"],
        data["detail_url"],
        data["formula_code"],
        data["raw_html"]
    ))

    conn.commit()

def main():

    page = 1

    while True:

        formulas = get_formula_list(
            page
        )

        # stop kalau kosong
        if not formulas:

            print(
                "\n[INFO] NO MORE FORMULAS"
            )

            break

        for item in formulas:

            try:

                detail = get_formula_detail(
                    item
                )

                save_formula(detail)

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