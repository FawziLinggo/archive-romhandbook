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

        # div col-span-2
        label_div = lbl.find_parent(
            "div"
        )

        if not label_div:
            continue

        # next div = content
        content_div = label_div.find_next_sibling(
            "div"
        )

        if not content_div:
            continue

        # ambil semua p
        items = content_div.select(
            "p.text-sm.font-light.leading-6.text-white"
        )

        # fallback span
        if not items:

            items = content_div.select(
                "span.text-sm.font-light.leading-6.text-white"
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

        label_div = lbl.find_parent(
            "div"
        )

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
# GET CARD LIST
# =========================================

def get_card_list(page):

    url = f"{BASE_URL}/cards?page={page}"

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
        name_tag = link.select_one(
            "span.text-sm.font-semibold.leading-6.text-emerald-200"
        )

        name = None

        if name_tag:
            name = clean_text(
                name_tag.get_text()
            )

        # card type
        type_tag = link.select_one(
            "p.inline-flex"
        )

        card_type = None

        if type_tag:
            card_type = clean_text(
                type_tag.get_text()
            )

        # id
        card_id = href.split("-")[-1]

        results.append({
            "id": card_id,
            "detail_url": BASE_URL + href,
            "image": image,
            "name": name,
            "card_type": card_type
        })

    print(
        f"[INFO] FOUND {len(results)} CARDS"
    )

    return results


# =========================================
# GET CARD DETAIL
# =========================================

def get_card_detail(item):

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

    # quality
    quality = extract_quality(soup)

    effects = extract_section_values(
    soup,
    "Effect"
)
    deposits = extract_section_values(
    soup,
    "Deposit"
)

    unlocks = extract_section_values(
        soup,
        "Unlock"
    )

    labels = soup.find_all(
        "span",
        class_="text-sm font-light leading-6 text-emerald-200"
    )

    for label in labels:

        label_text = clean_text(
            label.get_text()
        )

        if label_text == "Quality":

            parent = label.find_parent(
                "div",
                class_="grid"
            )

            if parent:

                white = parent.select_one(
                    "span.text-sm.font-light.leading-6.text-white"
                )

                if white:
                    quality = clean_text(
                        white.get_text()
                    )

            break


    # craft materials
    craft_materials = []

    for label in labels:

        label_text = clean_text(
            label.get_text()
        )

        if label_text != "Craft Materials":
            continue

        parent = label.find_parent(
            "div",
            class_="grid"
        )

        if not parent:
            continue

        spans = parent.select(
            "span.text.font-semibold.leading-6.text-emerald-200"
        )

        for sp in spans:

            val = clean_text(
                sp.get_text()
            )

            if val:
                craft_materials.append(val)

        break

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
        "card_type": item["card_type"],
        "quality": quality,
        "effects": effects,
        "deposits": deposits,
        "unlocks": unlocks,
        "craft_materials": craft_materials,
        "formulas": formulas,
        "raw_html": raw_html
    }


# =========================================
# SAVE CARD
# =========================================

def save_card(data):

    cursor.execute("""
        INSERT OR REPLACE INTO cards (
            id,
            detail_url,
            image,
            name,
            card_type,
            quality,
            effect_text,
            deposit_text,
            unlock_text,
            craft_materials,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["detail_url"],
        data["image"],
        data["name"],
        data["card_type"],
        data["quality"],
        json.dumps(data["effects"]),
        json.dumps(data["deposits"]),
        json.dumps(data["unlocks"]),
        json.dumps(data["craft_materials"]),
        data["raw_html"]
    ))

    conn.commit()


# =========================================
# SAVE FORMULAS
# =========================================

def save_card_formulas(
    card_id,
    formulas
):

    cursor.execute("""
        DELETE FROM card_formulas
        WHERE card_id = ?
    """, (card_id,))

    for formula in formulas:

        cursor.execute("""
            INSERT INTO card_formulas (
                card_id,
                formula_index,
                formula_json
            )
            VALUES (?, ?, ?)
        """, (
            card_id,
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

        cards = get_card_list(page)

        if not cards:

            print(
                "\n[INFO] NO MORE CARDS"
            )

            break

        for item in cards:

            try:

                detail = get_card_detail(
                    item
                )

                save_card(detail)

                save_card_formulas(
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