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

# =========================================
# CREATE TABLE
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
# SOURCE TABLES
# =========================================

sources = [
    "cards",
    "equipments",
    "headwears"
]

# =========================================
# DISCOVERY PHASE
# =========================================

print("\n============================")
print("DISCOVERY PHASE")
print("============================")

for table in sources:

    print(f"\nScanning {table}...")

    rows = cursor.execute(f"""
        SELECT id, raw_html
        FROM {table}
        WHERE raw_html IS NOT NULL
    """).fetchall()

    print(f"Found {len(rows)} rows")

    for row in rows:

        source_id = row[0]
        raw_html = row[1]

        if not raw_html:
            continue

        soup = BeautifulSoup(
            raw_html,
            "html.parser"
        )

        # =========================================
        # FIND "CRAFT MATERIALS"
        # =========================================

        labels = soup.find_all(
            string=lambda text:
            text and "Craft Materials" in text
        )

        if len(labels) == 0:
            continue


        for label in labels:

            # cari wrapper title
            title_wrapper = label.find_parent("div")

            if not title_wrapper:
                continue

            # cari container material
            materials_container = (
                title_wrapper.find_next_sibling("div")
            )

            if not materials_container:
                continue

            # ambil semua link
            links = materials_container.find_all(
                "a",
                href=True
            )

            for link in links:

                href = link.get("href", "")

                # hanya /things/
                if "/things/" not in href:
                    continue

                print(f"Found link: {href}")

                # =========================================
                # EXTRACT ID
                # =========================================

                slug = href.split("/")[-1]

                material_id = slug.split("-")[-1]

                # =========================================
                # NAME
                # =========================================

                text = link.get_text(
                    strip=True
                )

                # fallback kalau text kosong
                if not text:

                    img = link.find("img")

                    if img:
                        text = img.get(
                            "alt",
                            ""
                        )

                if not text:
                    continue

                # =========================================
                # IMAGE
                # =========================================

                image = None

                img = link.find("img")

                if img:

                    image = (
                        img.get("src")
                        or
                        img.get("data-src")
                    )

                # =========================================
                # DETAIL URL
                # =========================================

                detail_url = href

                if detail_url.startswith("/"):

                    detail_url = (
                        BASE_URL
                        + detail_url
                    )

                print(
                    f"[DISCOVER] "
                    f"{text} ({material_id})"
                )

                # =========================================
                # INSERT MATERIAL
                # =========================================

                cursor.execute("""

                    INSERT OR IGNORE INTO crafting_materials (

                        id,
                        detail_url,
                        image,
                        name,
                        material_type

                    )
                    VALUES (?, ?, ?, ?, ?)

                """, (

                    material_id,
                    detail_url,
                    image,
                    text,
                    "Crafting Material"

                ))

                # =========================================
                # INSERT THINGS
                # =========================================

                cursor.execute("""

                    INSERT OR IGNORE INTO things (

                        id,
                        type,
                        name,
                        image,
                        detail_url

                    )
                    VALUES (?, ?, ?, ?, ?)

                """, (

                    material_id,
                    "crafting_material",
                    text,
                    image,
                    detail_url

                ))

    conn.commit()

# =========================================
# DETAIL SCRAPING PHASE
# =========================================

print("\n============================")
print("DETAIL SCRAPING PHASE")
print("============================")

materials = cursor.execute("""

    SELECT
        id,
        detail_url
    FROM crafting_materials

""").fetchall()

print(f"\nTotal materials: {len(materials)}")

for row in materials:

    material_id = row[0]
    detail_url = row[1]

    print(f"\nFetching: {detail_url}")

    time.sleep(0.5)

    try:

        response = session.get(
            detail_url,
            headers=HEADERS,
            timeout=30
        )

        if response.status_code != 200:

            print(
                f"Failed: "
                f"{response.status_code}"
            )

            continue

        html = response.text

        soup = BeautifulSoup(
            html,
            "html.parser"
        )

        # =========================================
        # VALIDATE TYPE
        # =========================================

        badges = soup.select(
            "span.inline-flex"
        )

        is_crafting_material = any(

            badge.get_text(
                strip=True
            ) == "Crafting Material"

            for badge in badges

        )

        if not is_crafting_material:

            print(
                f"[SKIP] "
                f"Not crafting material"
            )

            continue

        # =========================================
        # NAME
        # =========================================

        name = None

        title = soup.select_one(
            "span.text.font-semibold"
        )

        if title:

            name = title.get_text(
                strip=True
            )

        # =========================================
        # DESCRIPTION
        # =========================================

        description = None

        paragraphs = soup.find_all("p")

        for p in paragraphs:

            text = p.get_text(
                strip=True
            )

            if (
                text
                and
                "Formula" not in text
                and
                len(text) > 10
            ):

                description = text
                break

        # =========================================
        # QUALITY
        # =========================================

        quality = None

        all_spans = soup.find_all("span")

        qualities = [
            "White",
            "Green",
            "Blue",
            "Purple"
        ]

        for span in all_spans:

            text = span.get_text(
                strip=True
            )

            if text in qualities:

                quality = text
                break

        # =========================================
        # IMAGE
        # =========================================

        image = None

        img = soup.find(
            "img",
            class_="h-12"
        )

        if img:

            image = (
                img.get("src")
                or
                img.get("data-src")
            )

        # =========================================
        # UPDATE MATERIAL
        # =========================================

        cursor.execute("""

            UPDATE crafting_materials
            SET

                name = ?,
                image = ?,
                quality = ?,
                description = ?,
                raw_html = ?

            WHERE id = ?

        """, (

            name,
            image,
            quality,
            description,
            html,
            material_id

        ))

        # =========================================
        # DELETE OLD FORMULAS
        # =========================================

        cursor.execute("""

            DELETE FROM
            crafting_material_formulas

            WHERE material_id = ?

        """, (
            material_id,
        ))

        # =========================================
        # EXTRACT FORMULAS
        # =========================================

        formula_blocks = soup.find_all(
            "code",
            class_="language-json"
        )

        for index, formula in enumerate(
            formula_blocks
        ):

            formula_text = (
                formula.get_text(
                    strip=True
                )
            )

            cursor.execute("""

                INSERT INTO
                crafting_material_formulas (

                    material_id,
                    formula_index,
                    formula_json

                )
                VALUES (?, ?, ?)

            """, (

                material_id,
                index,
                formula_text

            ))

        conn.commit()

        print(
            f"[OK] "
            f"{name}"
        )

        time.sleep(0.5)

    except Exception as e:

        print(
            f"[ERROR] "
            f"{material_id}: {e}"
        )
# =========================================
# DONE
# =========================================

print("\nDONE")

conn.close()