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

# =========================================
# REWRITE LOCAL ASSET PATHS
# =========================================

def rewrite_local_assets(body_tag):

    # =========================
    # IMG SRC
    # =========================

    for img in body_tag.find_all("img"):

        src = img.get("src")

        if not src:
            continue

        # only romhandbook assets
        if "https://romhandbook.com/assets/" in src:

            # remove domain
            local_src = src.replace(
                "https://romhandbook.com",
                ""
            )

            # prepend local public path
            # local_src = (
            #     "/romhandbook"
            #     + local_src
            # )

            img["src"] = local_src

    # =========================
    # LINK HREF
    # =========================

    for link in body_tag.find_all("link"):

        href = link.get("href")

        if not href:
            continue

        if "https://romhandbook.com/assets/" in href:

            local_href = href.replace(
                "https://romhandbook.com",
                ""
            )

            # local_href = (
            #     "/romhandbook"
            #     + local_href
            # )

            link["href"] = local_href

    return body_tag

# =========================================
# CLEAN BODY HTML
# =========================================

def get_clean_body_html(soup):

    # =========================
    # GET BODY
    # =========================

    body_tag = soup.select_one("body")

    if not body_tag:
        return ""

    # =========================
    # REMOVE HEADER
    # =========================

    for el in body_tag.select(
        "header, .sticky-top"
    ):
        el.decompose()

    # =========================
    # REMOVE SIDEBAR
    # =========================

    for el in body_tag.select(
        ".docs-sidebar"
    ):
        el.decompose()

    # =========================
    # REMOVE FOOTER
    # =========================

    for el in body_tag.select(
        "footer"
    ):
        el.decompose()

    # =========================
    # REMOVE SCRIPTS
    # =========================

    for el in body_tag.select(
        "script"
    ):
        el.decompose()

    # =========================
    # REMOVE STYLE TAGS
    # =========================

    for el in body_tag.select(
        "style"
    ):
        el.decompose()

    # =========================
    # REMOVE SHUTDOWN NOTICE
    # =========================

    for el in body_tag.find_all(
        string=lambda t:
        t and "will shut down" in t
    ):

        parent = el.find_parent("div")

        if parent:
            parent.decompose()

    # =========================
    # REWRITE LOCAL ASSETS
    # =========================

    body_tag = rewrite_local_assets(
        body_tag
    )

    # =========================
    # RETURN HTML
    # =========================

    return str(body_tag)
# =========================
# GET FORMULA DETAIL
# =========================

def get_formula_detail(item):

    url = item["detail_url"]

    print(f"[DETAIL] {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    raw_html = response.text

    raw_html = get_clean_body_html(
        soup
    )

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

    data["detail_url"] = data["detail_url"].replace(
        BASE_URL,
        ""
    )

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

                print(
                    f"[SAVED] {detail['name']}"
                )

                time.sleep(1)

            except Exception as e:

                print(
                    f"[ERROR] {item['detail_url']}"
                )

                print(e)

        page += 1

    print("\n[DONE]")



if __name__ == "__main__":
    main()