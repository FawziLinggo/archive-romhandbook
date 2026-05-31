import json
import time
import sqlite3
import requests

from bs4 import BeautifulSoup

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
)

DB_FILE = "../backend-api/storage/rom.db"

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

    url = f"{BASE_URL}/skills?page={page}"

    print(f"\n[INFO] LIST PAGE {page}")
    print(f"[INFO] URL: {url}")

    response = session.get(
        url,
        headers=HEADERS
    )

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    # ambil semua link skill
    links = soup.select(
        'a[href^="/skills/"]'
    )

    print("links", len(links))

    results = []

    seen = set()

    for link in links:

        href = link.get("href")

        if not href:
            continue

        # skip duplicate
        if href in seen:
            continue

        seen.add(href)

        # extract id
        skill_id = href.split("-")[-1]

        # image
        image_tag = link.select_one("img")

        image_url = None

        if image_tag:
            image_url = image_tag.get("src")

        # name
        name = None

        name_tag = link.select_one(
            "span.text.font-semibold.leading-6.text-emerald-200"
        )

        if name_tag:
            name = name_tag.get_text(
                strip=True
            )

        results.append({
            "id": skill_id,
            "name": name,
            "detail_url": BASE_URL + href,
            "image": image_url
        })

    print("results", len(results))

    return results

# =========================================
# HELPERS
# =========================================

def parse_tags(container):

    tags = []

    spans = container.select(
        "span.inline-flex"
    )

    for span in spans:

        text = span.get_text(
            " ",
            strip=True
        )

        if text:
            tags.append(text)

    return tags

def extract_tag_value(tags, prefix):

    for tag in tags:

        if tag.startswith(prefix):

            return tag.replace(
                prefix,
                ""
            ).strip()

    return None

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

def get_skill_detail(item):

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

    raw_html = get_clean_body_html(
        soup
    )

    # =====================================
    # BASIC INFO
    # =====================================

    name = item["name"]

    description = None

    description_tag = soup.select_one(
        "div.text-sm.text-white.font-medium p"
    )

    if description_tag:

        description = description_tag.get_text(
            " ",
            strip=True
        )

    # =====================================
    # TAGS
    # =====================================

    first_tag_container = soup.select_one(
        "div.py-1"
    )

    tags = []

    if first_tag_container:

        tags = parse_tags(
            first_tag_container
        )

    max_level = None

    skill_type = None
    damage_type = None

    cooldown = None
    range_value = None

    cast_time = None
    fixed_cast_time = None

    for tag in tags:

        if tag.startswith("Lvl:"):

            try:

                max_level = int(
                    tag.replace(
                        "Lvl:",
                        ""
                    ).strip()
                )

            except:
                pass

        elif tag.startswith("CD:"):

            cooldown = tag.replace(
                "CD:",
                ""
            ).strip()

        elif tag.startswith("Range:"):

            range_value = tag.replace(
                "Range:",
                ""
            ).strip()

        elif tag.startswith("Cast Time:"):

            cast_time = tag.replace(
                "Cast Time:",
                ""
            ).strip()

        elif tag.startswith("Fixed Cast Time:"):

            fixed_cast_time = tag.replace(
                "Fixed Cast Time:",
                ""
            ).strip()

        else:

            # heuristic
            if not skill_type:

                skill_type = tag

            elif not damage_type:

                damage_type = tag
    
    # =====================================
    # AESIR
    # =====================================

    aesir_items = []

    aesir_title = soup.find(
        "p",
        string=lambda t:
        t and t.strip() == "Aesir"
    )

    if aesir_title:

        aesir_container = aesir_title.find_parent(
            "div",
            class_="mt-2 grid grid-cols-1 py-3 px-3 border rounded border-slate-700"
        )

        if aesir_container:

            aesir_divs = aesir_container.select(
                "div.text-sm.text-white.font-xs"
            )

            for item_div in aesir_divs:

                text = item_div.get_text(
                    " ",
                    strip=True
                )

                if text:

                    aesir_items.append(text)

    print("aesir_items", aesir_items, "with id", item["id"], "\n")
    aesir_raw = json.dumps(
        aesir_items,
        ensure_ascii=False
    )
    # =====================================
    # FORMULA
    # =====================================

    formula_raw = None
    formula_type = None

    code_tag = soup.select_one(
        "code.language-json"
    )

    if code_tag:

        formula_raw = code_tag.get_text(
            "\n",
            strip=True
        )

        formula_raw_trim = formula_raw.strip()

        if formula_raw_trim.startswith("{"):

            formula_type = "json"

        elif (
            "function " in formula_raw_trim
            or "CommonFun" in formula_raw_trim
        ):

            formula_type = "lua"

        else:

            formula_type = "unknown"

    # =====================================
    # SAVE MAIN SKILL
    # =====================================


    if item["detail_url"].startswith(BASE_URL):
        item["detail_url"] = item["detail_url"][len(BASE_URL):]
    if item["image"] and item["image"].startswith(BASE_URL):
        item["image"] = item["image"][len(BASE_URL):]

    cursor.execute("""
    INSERT OR REPLACE INTO skills (
        id,
        detail_url,
        image,

        name,

        max_level,

        skill_type,
        damage_type,

        cooldown,
        range_value,

        cast_time,
        fixed_cast_time,

        raw_tags,

        description,
        aesir_raw,
        formula_type,
        formula_raw,

        raw_html
    )
    VALUES (
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, 
        ?
    )
    """, (

        item["id"],
        item["detail_url"],
        item["image"],

        name,

        max_level,

        skill_type,
        damage_type,

        cooldown,
        range_value,

        cast_time,
        fixed_cast_time,

        json.dumps(
            tags,
            ensure_ascii=False
        ),

        description,
        aesir_raw,
        formula_type,
        formula_raw,

        raw_html
    ))

    # =====================================
    # DELETE OLD LEVELS
    # =====================================

    cursor.execute("""
    DELETE FROM skill_levels
    WHERE skill_id = ?
    """, (
        item["id"],
    ))

    # =====================================
    # SKILL LEVELS
    # =====================================

    level_blocks = soup.select(
        "div.py-4.border-b"
    )

    for block in level_blocks:

        level_tags = parse_tags(block)

        level_value = None

        for tag in level_tags:

            if tag.startswith("Lvl:"):

                try:

                    level_value = int(
                        tag.replace(
                            "Lvl:",
                            ""
                        ).strip()
                    )

                except:
                    pass

        desc_div = block.select_one(
            "div.text-sm.text-white.font-xs"
        )

        level_description = None

        if desc_div:

            level_description = desc_div.get_text(
                " ",
                strip=True
            )

        if level_value:

            cursor.execute("""
            INSERT INTO skill_levels (
                skill_id,
                level,
                description,
                raw_tags
            )
            VALUES (?, ?, ?, ?)
            """, (

                item["id"],
                level_value,
                level_description,

                json.dumps(
                    level_tags,
                    ensure_ascii=False
                )
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

    print(f"[INFO] FOUND {len(listing_items)} SKILLS")

    if len(listing_items) == 0:

        print("[INFO] NO MORE SKILLS")

        break

    new_items = []

    for item in listing_items:

        if item["id"] not in seen_ids:

            seen_ids.add(item["id"])

            new_items.append(item)

    if len(new_items) == 0:

        print("[INFO] NO NEW SKILLS")

        break

    for item in new_items:

        try:

            get_skill_detail(item)

            time.sleep(1)

        except Exception as e:

            print("ERROR:", e)

    page += 1

conn.close()

print("\n[INFO] DONE")