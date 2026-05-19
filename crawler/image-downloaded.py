import os
import time
import sqlite3
import requests

from urllib.parse import urlparse

# =========================
# ENV
# =========================

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

DB_FILE = os.getenv(
    "DB_FILE",
    "database.db"
)

SAVE_DIR = os.getenv(
    "SAVE_DIR",
    "assets/img"
)

TABLES = [
    "cards",
    "equipments",
    "headwears",
    "monsters",
    "mounts",
    "pets",
    "skills"
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}

# =========================
# INIT
# =========================

os.makedirs(
    SAVE_DIR,
    exist_ok=True
)

session = requests.Session()

conn = sqlite3.connect(DB_FILE)

cursor = conn.cursor()

# =========================
# HELPERS
# =========================

def get_extension(url):

    path = urlparse(url).path

    ext = os.path.splitext(path)[1]

    if not ext:
        ext = ".png"

    return ext


def download_image(
    image_url,
    table_name,
    item_id
):

    if not image_url:
        return

    try:

        ext = get_extension(
            image_url
        )

        folder = os.path.join(
            SAVE_DIR,
            table_name
        )

        os.makedirs(
            folder,
            exist_ok=True
        )

        filename = f"{item_id}{ext}"

        filepath = os.path.join(
            folder,
            filename
        )

        # skip kalau sudah ada
        if os.path.exists(filepath):

            print(
                f"[SKIP] {filepath}"
            )

            return

        response = session.get(
            image_url,
            headers=HEADERS,
            timeout=30
        )

        if response.status_code != 200:

            print(
                f"[FAILED] {image_url}"
            )

            return

        with open(
            filepath,
            "wb"
        ) as f:

            f.write(
                response.content
            )

        print(
            f"[DOWNLOADED] {filepath}"
        )

        time.sleep(0.1)

    except Exception as e:

        print(
            f"[ERROR] {image_url}"
        )

        print(e)

# =========================
# MAIN
# =========================

def main():

    for table in TABLES:

        print(f"\n====================")
        print(f"[TABLE] {table}")
        print(f"====================")

        try:

            cursor.execute(f"""
                SELECT id, image
                FROM {table}
                WHERE image IS NOT NULL
                AND image != ''
            """)

            rows = cursor.fetchall()

            print(
                f"[FOUND] {len(rows)} IMAGES"
            )

            for row in rows:

                item_id = row[0]

                image_url = row[1]

                download_image(
                    image_url,
                    table,
                    item_id
                )

        except Exception as e:

            print(
                f"[ERROR TABLE] {table}"
            )

            print(e)

    print("\n[DONE]")


if __name__ == "__main__":
    main()