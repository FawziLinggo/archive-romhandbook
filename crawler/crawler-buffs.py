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
# =========================================
# DETAIL
# =========================================

def get_buff_detail(item):

    url = item["detail_url"]

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
    soup)   

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


    # update data detail_url & image remove BASE_URL if exist
    if data["detail_url"].startswith(BASE_URL):
        data["detail_url"] = data["detail_url"][len(BASE_URL):]
    if data["image"] and data["image"].startswith(BASE_URL):
        data["image"] = data["image"][len(BASE_URL):]

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

                print(
                    f"[SAVED] {detail['name']}"
                )

                time.sleep(0.5)

            except Exception as e:

                print(
                    f"[ERROR] {item['detail_url']}"
                )

                print(e)

        page += 1

    print("\n[DONE]")


if __name__ == "__main__":
    main()