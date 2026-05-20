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

def extract_link_items(
    soup,
    label
):

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

        links = content_div.select(
            "a[href]"
        )

        for link in links:

            href = link.get("href")

            if not href:
                continue

            img = link.select_one(
                "img"
            )

            image = None

            if img:

                image = (
                    img.get("src")
                )

            name_tag = link.select_one(
                "span.text-sm.font-semibold.leading-6.text-emerald-200"
            )

            name = None

            if name_tag:

                name = clean_text(
                    name_tag.get_text()
                )

            if not name:
                continue

            results.append({

                "name": name,

                "image": image,

                "url": BASE_URL + href

            })

        break

    return results

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
# GET CARD DETAIL
# =========================================

def get_card_detail(item):

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
    soup)   


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


    
    skills = extract_link_items(
    soup,
    "Skills"
)


    # craft materials
    craft_materials = extract_link_items(
    soup,
    "Craft Materials"
)

    craftable = extract_link_items(
        soup,
        "Craftable"
    )

    dropped_by = extract_link_items(
        soup,
        "Dropped by"
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
    "card_type": item["card_type"],
    "quality": quality,
    "effects": effects,
    "deposits": deposits,
    "unlocks": unlocks,
    "craft_materials": craft_materials,
    "craftable": craftable,
    "skills": skills,
    "dropped_by": dropped_by,
    "formulas": formulas,
    "raw_html": raw_html

}


# =========================================
# SAVE CARD
# =========================================

def save_card(data):

    # update data detail_url & image remove BASE_URL if exist
    if data["detail_url"].startswith(BASE_URL):
        data["detail_url"] = data["detail_url"][len(BASE_URL):]
    if data["image"] and data["image"].startswith(BASE_URL):
        data["image"] = data["image"][len(BASE_URL):]

    cursor.execute("""

    INSERT OR REPLACE INTO cards (

        id,
        detail_url,
        image,
        name,
        card_type,
        quality,
        effect_text,
        raw_html

    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

    """, (

        data["id"],
        data["detail_url"],
        data["image"],
        data["name"],
        data["card_type"],
        data["quality"],

        json.dumps(
            data["effects"]
        ),

        data["raw_html"]

    ))

    conn.commit()

    # save to things table

    # update data detail_url & image remove BASE_URL if exist
    if data["detail_url"].startswith(BASE_URL):
        data["detail_url"] = data["detail_url"][len(BASE_URL):]
    if data["image"] and data["image"].startswith(BASE_URL):
        data["image"] = data["image"][len(BASE_URL):]

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
        data["id"],
        "card",
        data["name"],
        data["image"],
        data["detail_url"]
    ))

    conn.commit()


def save_card_bonuses(
    card_id,
    deposits,
    unlocks
):

    cursor.execute("""
        DELETE FROM
        card_account_bonuses
        WHERE card_id = ?
    """, (card_id,))

    for item in deposits:

        cursor.execute("""

            INSERT INTO
            card_account_bonuses (

                card_id,
                bonus_type,
                bonus_text

            )
            VALUES (?, ?, ?)

        """, (

            card_id,
            "deposit",
            item

        ))

    for item in unlocks:

        cursor.execute("""

            INSERT INTO
            card_account_bonuses (

                card_id,
                bonus_type,
                bonus_text

            )
            VALUES (?, ?, ?)

        """, (

            card_id,
            "unlock",
            item

        ))

    conn.commit()



def save_relation_items(
    table,
    card_id,
    items,
    name_field,
    image_field,
    url_field
):

    cursor.execute(f"""
        DELETE FROM {table}
        WHERE card_id = ?
    """, (card_id,))

    for item in items:
        # update data detail_url & image remove BASE_URL if exist
        if item["url"].startswith(BASE_URL):
            item["url"] = item["url"][len(BASE_URL):]
        if item["image"] and item["image"].startswith(BASE_URL):
            item["image"] = item["image"][len(BASE_URL):]

        cursor.execute(f"""

            INSERT INTO {table} (

                card_id,

                {name_field},
                {image_field},
                {url_field}

            )
            VALUES (?, ?, ?, ?)

        """, (

            card_id,

            item["name"],
            item["image"],
            item["url"]

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


                save_card_bonuses(
                    detail["id"],
                    detail["deposits"],
                    detail["unlocks"]
                )

                save_relation_items(
                    "card_craft_materials",
                    detail["id"],
                    detail["craft_materials"],
                    "material_name",
                    "material_image",
                    "material_url"
                )

                save_relation_items(
                    "card_skills",
                    detail["id"],
                    detail["skills"],
                    "skill_name",
                    "skill_image",
                    "skill_url"
                )

                save_relation_items(
                    "card_dropped_by",
                    detail["id"],
                    detail["dropped_by"],
                    "monster_name",
                    "monster_image",
                    "monster_url"
                )

                save_relation_items(
                    "card_craftable",
                    detail["id"],
                    detail["craftable"],
                    "item_name",
                    "item_image",
                    "item_url"
                )

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