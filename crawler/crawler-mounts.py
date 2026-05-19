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
# HELPERS
# =========================================

def clean_text(text):

    if not text:
        return None

    return " ".join(
        text.strip().split()
    )


def extract_section_values(soup, label):

    results = []

    labels = soup.select(
        "span.text-sm.font-light.leading-6.text-emerald-200"
    )

    for lbl in labels:

        current_label = clean_text(
            lbl.get_text()
        )

        if current_label != label:
            continue

        label_div = lbl.find_parent("div")

        if not label_div:
            continue

        content_div = label_div.find_next_sibling(
            "div"
        )

        if not content_div:
            continue

        items = content_div.select(
            "p.text-sm.font-light.leading-6.text-white"
        )

        if not items:

            items = content_div.select(
                "span.text-sm.font-light.leading-6.text-white"
            )

        if not items:

            items = content_div.select(
                "span.inline-flex"
            )

        for item in items:

            value = clean_text(
                item.get_text(
                    " ",
                    strip=True
                )
            )

            if not value:
                continue

            value = value.replace(
                "▶",
                ""
            ).strip()

            results.append(value)

        break

    return results


def extract_quality(soup):

    labels = soup.select(
        "span.text-sm.font-light.leading-6.text-emerald-200"
    )

    for lbl in labels:

        current_label = clean_text(
            lbl.get_text()
        )

        if current_label != "Quality":
            continue

        label_div = lbl.find_parent("div")

        if not label_div:
            continue

        content_div = label_div.find_next_sibling(
            "div"
        )

        if not content_div:
            continue

        value_tag = content_div.select_one(
            "span.text-sm.font-light.leading-6.text-white"
        )

        if not value_tag:
            continue

        value = clean_text(
            value_tag.get_text(
                " ",
                strip=True
            )
        )

        return value.replace(
            "▶",
            ""
        ).strip()

    return None

# =========================================
# GET MOUNT LIST
# =========================================

def get_mount_list(page):

    url = f"{BASE_URL}/mounts?page={page}"

    print(f"\n[INFO] PAGE {page}")
    print(f"[INFO] URL: {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    links = soup.select(
        'a[href^="/things/"]'
    )

    results = []

    seen = set()

    for link in links:
        href = link.get("href")

        if not href:
            continue

        if href in seen:
            continue

        seen.add(href)

        # image
        img = link.select_one("img")

        image = None

        if img:
            image = img.get("src")

        # name
        name = None

        name_tag = link.select_one(
            "span.text-emerald-200"
        )

        if name_tag:

            name = clean_text(
                name_tag.get_text()
            )

        # type
        mount_type = None

        type_tag = link.select_one(
            "span.rounded-md"
        )

        if type_tag:

            mount_type = clean_text(
                type_tag.get_text()
            )

        mount_id = href.split("-")[-1]

        results.append({
            "id": mount_id,
            "detail_url": BASE_URL + href,
            "image": image,
            "name": name,
            "mount_type": mount_type
        })
    print(
        f"[INFO] FOUND {len(results)} MOUNTS"
    )

    return results

# =========================================
# DETAIL
# =========================================

def get_mount_detail(item):

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

    # description
    description = None

    desc_tag = soup.select_one(
        "div.border-t.border-gray-200.pt-2 p.text-base"
    )

    if desc_tag:
        description = clean_text(
            desc_tag.get_text()
        )

    quality = extract_quality(soup)

    effects = extract_section_values(
        soup,
        "Effect"
    )

    unlocks = extract_section_values(
        soup,
        "Unlock"
    )

    jobs = extract_section_values(
        soup,
        "Jobs"
    )

    # formulas
    formulas = []

    code_blocks = soup.select(
        "pre code"
    )

    for index, code in enumerate(code_blocks):

        formula_text = code.get_text(
            "\n",
            strip=True
        )

        if formula_text:

            formulas.append({
                "formula_index": index + 1,
                "formula_json": formula_text
            })

    return {
        "id": item["id"],
        "detail_url": item["detail_url"],
        "image": item["image"],
        "name": item["name"],
        "mount_type": item["mount_type"],
        "description": description,
        "quality": quality,
        "effects": effects,
        "unlocks": unlocks,
        "jobs": jobs,
        "formulas": formulas,
        "raw_html": raw_html
    }

# =========================================
# SAVE
# =========================================

def save_mount(data):

    cursor.execute("""
        INSERT OR REPLACE INTO mounts (
            id,
            detail_url,
            image,
            name,
            mount_type,
            description,
            quality,
            effect_text,
            unlock_text,
            jobs,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["detail_url"],
        data["image"],
        data["name"],
        data["mount_type"],
        data["description"],
        data["quality"],
        json.dumps(data["effects"]),
        json.dumps(data["unlocks"]),
        json.dumps(data["jobs"]),
        data["raw_html"]
    ))

    conn.commit()


def save_mount_formulas(
    mount_id,
    formulas
):

    cursor.execute("""
        DELETE FROM mount_formulas
        WHERE mount_id = ?
    """, (mount_id,))

    for formula in formulas:

        cursor.execute("""
            INSERT INTO mount_formulas (
                mount_id,
                formula_index,
                formula_json
            )
            VALUES (?, ?, ?)
        """, (
            mount_id,
            formula["formula_index"],
            formula["formula_json"]
        ))

    conn.commit()

# =========================================
# MAIN
# =========================================

def main():

    page = 1

    while True:

        mounts = get_mount_list(page)

        if not mounts:

            print(
                "\n[INFO] NO MORE MOUNTS"
            )

            break

        for item in mounts:

            try:

                detail = get_mount_detail(
                    item
                )

                save_mount(detail)

                save_mount_formulas(
                    detail["id"],
                    detail["formulas"]
                )

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