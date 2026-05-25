import re
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

# =====================================
# SQLITE
# =====================================

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

# =====================================
# HELPERS
# =====================================

def clean_text(text):

    if not text:
        return None

    return re.sub(
        r"\s+",
        " ",
        text
    ).strip()


# =====================================
# LIST
# =====================================

def get_pet_list(page):

    url = f"{BASE_URL}/pets?page={page}"

    print(f"\n[PAGE] {page}")
    print(f"[URL] {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    cards = soup.select(
        "#items > div"
    )

    results = []

    seen = set()

    for card in cards:

        link = card.select_one(
            'a[href^="/pets/"]'
        )

        if not link:
            continue

        href = link.get("href")

        if href in seen:
            continue

        seen.add(href)

        detail_url = BASE_URL + href

        pet_id = href.replace(
            "/pets/",
            ""
        )

        # image
        img = link.select_one("img")

        image = None

        if img:
            image = img.get("src")

        # name
        name_tag = link.select_one(
            "p.text-emerald-200"
        )

        name = None

        if name_tag:
            name = clean_text(
                name_tag.get_text()
            )

        # race/element/size
        info_tag = link.select_one(
            "p.text-white"
        )

        race = None
        element = None
        size = None

        if info_tag:

            info = clean_text(
                info_tag.get_text()
            )

            parts = [
                x.strip()
                for x in info.split("/")
            ]

            if len(parts) >= 3:

                race = parts[0]
                element = parts[1]
                size = parts[2]

        results.append({
            "id": pet_id,
            "detail_url": detail_url,
            "image": image,
            "name": name,
            "race": race,
            "element": element,
            "size": size
        })

    print(f"[FOUND] {len(results)} PETS")

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

# =====================================
# DETAIL
# =====================================

def get_pet_detail(item):

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

    raw_html = get_clean_body_html(
        soup
    )

    # description
    description = None

    desc_tag = soup.select_one(
        ".mt-1.grid.grid-cols-1 > div.border-t"
    )

    if desc_tag:

        description = clean_text(
            desc_tag.get_text()
        )

    # unlock
    unlock_text = None

    unlock_label = soup.find(
        string=lambda x:
        x and "Unlock" in x
    )

    if unlock_label:

        parent = unlock_label.find_parent(
            "div",
            class_="col-span-3"
        )

        if parent:

            value_div = parent.find_next_sibling(
                "div"
            )

            if value_div:

                unlock_text = clean_text(
                    value_div.get_text(
                        " ",
                        strip=True
                    )
                )

    # egg
    egg_name = None
    egg_url = None
    egg_image = None

    egg_label = soup.find(
        string=lambda x:
        x and "Egg" in x
    )

    if egg_label:

        parent = egg_label.find_parent(
            "div",
            class_="col-span-3"
        )

        if parent:

            value_div = parent.find_next_sibling(
                "div"
            )

            if value_div:

                egg_link = value_div.select_one(
                    'a[href^="/things/"]'
                )

                if egg_link:

                    egg_url = (
                        BASE_URL +
                        egg_link.get("href")
                    )

                    egg_name_tag = egg_link.select_one(
                        "p"
                    )

                    if egg_name_tag:

                        egg_name = clean_text(
                            egg_name_tag.get_text()
                        )

                    egg_img = egg_link.select_one(
                        "img"
                    )

                    if egg_img:

                        egg_image = egg_img.get(
                            "src"
                        )

    # skills
    # skills
    skills = []

    skill_header = soup.find(
        "p",
        string=lambda x:
        x and x.strip() == "Skills"
    )

    if skill_header:

        # ambil parent col-span-2
        header_col = skill_header.find_parent(
            "div",
            class_=lambda c:
            c and "col-span-2" in c
        )

        if header_col:

            # value ada di sibling col-span-10
            value_div = header_col.find_next_sibling(
                "div"
            )

            if value_div:

                skill_links = value_div.select(
                    'a[href^="/skills/"]'
                )

                for skill in skill_links:

                    href = skill.get("href")

                    if not href:
                        continue

                    skill_url = href

                    # name
                    name_tag = skill.select_one("p")

                    skill_name = None

                    if name_tag:

                        skill_name = clean_text(
                            name_tag.get_text()
                        )

                    # image
                    img = skill.select_one("img")

                    skill_image = None

                    if img:

                        skill_image = img.get("src")

                    skills.append({
                        "name": skill_name,
                        "url": skill_url,
                        "image": skill_image
                    })

    # formulas
    formula_ids = []

    code_blocks = soup.select(
        "pre code"
    )

    for block in code_blocks:

        text = block.get_text()

        match = re.search(
            r'"id"\s*:\s*(\d+)',
            text
        )

        if match:

            formula_ids.append(
                match.group(1)
            )

    return {
        **item,

        "description": description,

        "unlock_text": unlock_text,

        "egg_name": egg_name,
        "egg_url": egg_url,
        "egg_image": egg_image,

        "skills": skills,

        "formula_ids": formula_ids,

        "raw_html": raw_html
    }


# =====================================
# SAVE
# =====================================

def save_pet(data):


    if data["detail_url"].startswith(BASE_URL):
        data["detail_url"] = data["detail_url"][len(BASE_URL):]
    if data["image"] and data["image"].startswith(BASE_URL):
        data["image"] = data["image"][len(BASE_URL):]

    cursor.execute("""
        INSERT OR REPLACE INTO pets (
            id,
            detail_url,
            image,
            name,
            race,
            element,
            size,
            description,
            unlock_text,
            egg_name,
            egg_url,
            egg_image,
            skills,
            formula_ids,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        data["id"],

        data["detail_url"],

        data["image"],

        data["name"],

        data["race"],
        data["element"],
        data["size"],

        data["description"],

        data["unlock_text"],

        data["egg_name"],
        data["egg_url"],
        data["egg_image"],

        json.dumps(
            data["skills"],
            ensure_ascii=False
        ),

        json.dumps(
            data["formula_ids"],
            ensure_ascii=False
        ),

        data["raw_html"]
    ))

    conn.commit()


# =====================================
# MAIN
# =====================================

def main():

    page = 1

    while True:

        pets = get_pet_list(page)

        if not pets:

            print("\n[DONE]")
            break

        for item in pets:

            try:

                detail = get_pet_detail(
                    item
                )

                save_pet(detail)

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


if __name__ == "__main__":
    main()