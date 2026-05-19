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

        for label in labels:

            # cari parent container
            parent = label.find_parent()

            if not parent:
                continue

            # ambil semua link things
            links = parent.find_all(
                "a",
                href=True
            )

            for link in links:

                href = link.get("href", "")

                # hanya /things/
                if "/things/" not in href:
                    continue

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
    detail_url = BASE_URL + row[1] if row[1].startswith("/") else row[1]

    print(f"\nFetching: {detail_url}")

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
        # NAME
        # =========================================

        name = None

        title = soup.find(
            class_="text font-semibold"
        )

        if title:

            name = title.get_text(
                strip=True
            )

        # =========================================
        # DESCRIPTION
        # =========================================

        description = None

        desc = soup.find(
            "p",
            class_="text-base"
        )

        if desc:

            description = desc.get_text(
                strip=True
            )

        # =========================================
        # QUALITY
        # =========================================

        quality = None

        quality_label = soup.find(
            string=lambda text:
            text and "Quality" in text
        )

        if quality_label:

            quality_parent = (
                quality_label
                .find_parent()
            )

            if quality_parent:

                next_div = (
                    quality_parent
                    .find_next_sibling()
                )

                if next_div:

                    quality = (
                        next_div.get_text(
                            strip=True
                        )
                    )

                    quality = (
                        quality
                        .replace("►", "")
                        .strip()
                    )

        # =========================================
        # MAIN IMAGE
        # =========================================

        image = None

        main_image = soup.find(
            "img",
            class_="h-12"
        )

        if main_image:

            image = main_image.get("src")

        # =========================================
        # UPDATE DB
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

        conn.commit()

        print(f"[OK] {name}")

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