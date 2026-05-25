import json
import time

from bs4 import BeautifulSoup

from utils.db import (
    conn,
    cursor,
    init_db
)

from utils.requests import (
    BASE_URL,
    session
)

from utils.parser import (
    clean_text
)

from utils.assets import (
    normalize_local_url
)

from utils.html import (
    get_clean_body_html
)

from utils.formulas import (
    extract_formulas
)

normalize_asset_url = normalize_local_url


# =========================================
# INIT DB
# =========================================

init_db()


# =========================================
# PET LIST
# =========================================

def get_pet_list(page):

    url = f"{BASE_URL}/pets?page={page}"

    print(f"\n[PAGE] {page}")
    print(f"[URL] {url}")

    response = session.get(url)

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    links = soup.select(
        'a[href^="/pets/"]'
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

        # =========================
        # IMAGE
        # =========================

        image = None

        img = link.select_one(
            "img"
        )

        if img:

            image = normalize_local_url(
                img.get("src")
            )

        # =========================
        # NAME
        # =========================

        name = None

        name_tag = link.select_one(
            """
            p.text-sm.font-semibold.leading-6.text-emerald-200
            """
        )

        if name_tag:

            name = clean_text(
                name_tag.get_text()
            )

        if not name:
            continue

        # =========================
        # ID
        # =========================

        pet_id = href.split("-")[-1]

        results.append({

            "id": pet_id,

            "detail_url": normalize_local_url(
                href
            ),

            "image": image,

            "name": name

        })

    print(
        f"[FOUND] {len(results)} PETS"
    )

    return results


# =========================================
# EXTRACT SKILLS
# =========================================

def extract_skills(soup):

    skills = []

    # =========================
    # FIND "Skills" LABEL
    # =========================

    labels = soup.find_all(
        "p",
        class_="text-sm font-medium leading-6 text-emerald-200"
    )

    skills_label = None

    for label in labels:

        if clean_text(label.get_text()) == "Skills":

            skills_label = label
            break

    if not skills_label:

        return skills

    # =========================
    # FIND CONTAINER
    # =========================

    container = (
        skills_label
        .parent
        .find_next_sibling("div")
    )

    if not container:

        return skills

    # =========================
    # PARSE LINKS
    # =========================

    links = container.find_all("a")

    for link in links:

        url = link.get("href")

        if not url:

            continue

        name_tag = link.select_one(
            "p.text-sm.leading-6.text-white"
        )

        img_tag = link.select_one("img")

        skills.append({

            "name": clean_text(
                name_tag.get_text()
            ) if name_tag else None,

            "url": url,

            "image": normalize_asset_url(
                img_tag.get("src")
            ) if img_tag else None
        })

    return skills


# =========================================
# EXTRACT SIMPLE TEXT
# =========================================

def extract_simple_text(
    soup,
    label
):

    rows = soup.select(
        "div.grid.grid-cols-12"
    )

    for row in rows:

        cols = row.select(
            "div"
        )

        if len(cols) < 2:
            continue

        label_tag = cols[0].select_one(
            "p"
        )

        if not label_tag:
            continue

        current_label = clean_text(
            label_tag.get_text()
        )

        if current_label != label:
            continue

        value = clean_text(
            cols[1].get_text(
                " ",
                strip=True
            )
        )

        return value

    return None
# =========================================
# EXTRACT EGG
# =========================================

def extract_egg(soup):

    result = {

        "egg_id": None,

        "egg_url": None

    }

    rows = soup.select(
        "div.grid.grid-cols-12"
    )

    for row in rows:

        cols = row.select("div")

        if len(cols) < 2:
            continue

        label_tag = cols[0].select_one(
            "p"
        )

        if not label_tag:
            continue

        current_label = clean_text(
            label_tag.get_text()
        )

        if current_label != "Egg":
            continue

        egg_link = cols[1].select_one(
            'a[href^="/things/"]'
        )

        if not egg_link:
            continue

        href = egg_link.get("href")

        if not href:
            continue

        result["egg_url"] = normalize_local_url(
            href
        )

        result["egg_id"] = href.split("-")[-1]

        break

    return result
# =========================================
# PET DETAIL
# =========================================

def get_pet_detail(item):

    url = BASE_URL + item["detail_url"]

    print(f"[DETAIL] {url}")

    response = session.get(url)

    soup = BeautifulSoup(
        response.text,
        "lxml"
    )

    # =========================
    # RAW HTML
    # =========================

    raw_html = get_clean_body_html(
        soup
    )

    # =========================
    # DESCRIPTION
    # =========================

    description = None

    desc = soup.select_one(
        "div.border-t.border-dashed p"
    )

    if desc:

        description = clean_text(
            desc.get_text(
                " ",
                strip=True
            )
        )

    # =========================
    # BASIC INFO
    # =========================
    basic_info = soup.select_one(
    "p.text.text-base"
)
    
    race = None
    element = None
    size = None

    if basic_info:

        parts = [
            clean_text(x)
            for x in basic_info.get_text().split("/")
        ]

        if len(parts) >= 3:

            race = parts[0]
            element = parts[1]
            size = parts[2]
    # =========================
    # UNLOCK TEXT
    # =========================

    unlock_text = extract_simple_text(
        soup,
        "Unlock"
    )
    # =========================
    # EGG
    # =========================

    egg = extract_egg(
        soup
    )

    # =========================
    # SKILLS
    # =========================

    skills = extract_skills(
        soup
    )

    # =========================
    # FORMULAS
    # =========================

    formulas = extract_formulas(
        soup
    )

    

    return {

        "id": item["id"],

        "detail_url": item["detail_url"],

        "image": item["image"],

        "name": item["name"],

        "race": race,

        "element": element,

        "size": size,

        "description": description,

        "unlock_text": unlock_text,

        "egg_id": egg["egg_id"],

        "egg_url": egg["egg_url"],

        "skills": skills,

        "formula_ids": formulas,

        "raw_html": raw_html
    }


# =========================================
# SAVE PET
# =========================================

def save_pet(data):

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

        egg_id,

        egg_url,

        skills,

        formula_ids,

        raw_html

    )

    VALUES (

        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?

    )

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

        data["egg_id"],

        data["egg_url"],

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


# =========================================
# MAIN
# =========================================

def main():

    page = 1

    while True:

        pets = get_pet_list(page)

        if not pets:

            print(
                "\n[INFO] NO MORE PETS"
            )

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

                time.sleep(1)

            except Exception as e:

                print(
                    f"[ERROR] {item['detail_url']}"
                )

                print(e)

        conn.commit()

        page += 1

    print("\n[DONE]")


if __name__ == "__main__":

    main()