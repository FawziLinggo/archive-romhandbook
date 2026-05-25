import time
import os
import json
import html

from dotenv import load_dotenv

from utils.db import conn, cursor
from utils.requests import get_soup
from utils.html import clean_text

load_dotenv(
    dotenv_path="../.env"
)

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
)


# =========================
# GET URLS
# =========================

def get_egg_urls():

    rows = cursor.execute("""
        SELECT DISTINCT
            egg_url
        FROM pets
        WHERE
            egg_url IS NOT NULL
            AND egg_url != ''
    """).fetchall()

    return [
        row[0]
        for row in rows
    ]


# =========================
# PARSE PET EGG
# =========================

def parse_pet_egg(
    soup,
    egg_url
):

    # =========================
    # DEFAULTS
    # =========================

    egg_id = None

    image = None

    name = None

    description = None

    effect_text = None

    unlock_text = None

    jobs_raw = "[]"

    pet_url = None

    formulas_raw = "[]"

    raw_html = str(soup)

    # =========================
    # ID
    # =========================

    egg_id = (
        egg_url
        .split("/")[-1].split("-")[-1]
    )

    # =========================
    # HEADER
    # =========================

    header = soup.select_one(
        "div.flex.min-w-0.gap-x-4"
    )

    if header:

        # IMAGE

        img = header.select_one("img")

        if img:

            image = img.get("src")

            if image and image.startswith(BASE_URL):

                image = image.replace(
                    BASE_URL,
                    ""
                )

        # NAME

        name_el = header.select_one(
            "span.text.font-semibold"
        )

        if name_el:

            name = clean_text(
                name_el.get_text()
            )

    # =========================
    # DESCRIPTION
    # =========================

    desc_el = soup.select_one(
        "div.border-t.border-gray-200.pt-2 p"
    )

    if desc_el:

        description = clean_text(
            desc_el.get_text()
        )

    # =========================
    # DETAILS GRID
    # =========================

    details_grid = soup.select_one(
        "div.grid.grid-cols-12"
    )

    if details_grid:

        rows = details_grid.select(
            ":scope > div"
        )

        for i in range(0, len(rows), 2):

            try:

                label_div = rows[i]

                value_div = rows[i + 1]

            except IndexError:

                continue

            label = clean_text(
                label_div.get_text()
            ).lower()

            value = clean_text(
                value_div.get_text(" ")
            )

            # =========================
            # EFFECT
            # =========================

            if "effect" in label:

                effect_text = value

            # =========================
            # UNLOCK
            # =========================

            elif "unlock" in label:

                unlock_text = value

            # =========================
            # JOBS
            # =========================

            elif "jobs" in label:

                jobs = []

                for badge in value_div.select("span"):

                    jobs.append(
                        clean_text(
                            badge.get_text()
                        )
                    )

                jobs_raw = json.dumps(
                    jobs,
                    ensure_ascii=False
                )

            # =========================
            # PET
            # =========================

            elif "pet" in label:

                pet_link = value_div.select_one(
                    "a"
                )

                if pet_link:

                    pet_url = pet_link.get(
                        "href"
                    )

    # =========================
    # FORMULAS
    # =========================

    formulas = []

    formula_blocks = soup.select(
        "code.language-json"
    )

    for block in formula_blocks:

        raw = html.unescape(
            block.get_text("\n")
        )

        formulas.append(raw)

    formulas_raw = json.dumps(
        formulas,
        ensure_ascii=False
    )

    # =========================
    # RETURN
    # =========================

    return {

        "id": egg_id,

        "detail_url": egg_url,

        "image": image,

        "name": name,

        "description": description,

        "effect_text": effect_text,

        "unlock_text": unlock_text,

        "jobs_raw": jobs_raw,

        "pet_url": pet_url,

        "formulas_raw": formulas_raw,

        "raw_html": raw_html
    }


# =========================
# SAVE
# =========================

def save_egg(data):

    cursor.execute("""
        INSERT OR REPLACE INTO pet_eggs (
            id,
            detail_url,
            image,
            name,
            description,
            effect_text,
            unlock_text,
            jobs_raw,
            pet_url,
            formulas_raw,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        data["id"],
        data["detail_url"],
        data["image"],
        data["name"],
        data["description"],
        data["effect_text"],
        data["unlock_text"],
        data["jobs_raw"],
        data["pet_url"],
        data["formulas_raw"],
        data["raw_html"]
    ))


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
        "pet_egg",
        data["name"],
        data["image"],
        data["detail_url"]
    ))





# =========================
# MAIN
# =========================

def main():

    egg_urls = get_egg_urls()

    print(
        f"[FOUND] {len(egg_urls)} EGGS"
    )

    for egg_url in egg_urls:

        try:

            url = BASE_URL + egg_url

            print(f"\n[CRAWL] {url}")

            soup = get_soup(url)

            if not soup:

                print("[SKIP] NO SOUP")

                continue

            data = parse_pet_egg(
                soup,
                egg_url
            )

            save_egg(data)

            conn.commit()

            print(
                f"[SAVED] {data['name']}"
            )

            time.sleep(0.5)

        except Exception as e:

            print(
                f"[ERROR] {egg_url}"
            )

            print(e)

    print("\n[DONE]")


if __name__ == "__main__":

    main()