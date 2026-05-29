import os
import time
import sqlite3
import requests

from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
).rstrip("/")

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
    "skills",
    "crafting_materials",
    "pet_eggs",
    "jobs",
    "furnitures",
    "cooking_ingredients",
    "pet_headwear_unlock_items",
    ]

FORCE_ITEM_FOLDER_TABLES = {
    "crafting_materials",
    "pet_eggs",
    "furnitures",
    "cooking_ingredients",
    "pet_headwear_unlock_items",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}

os.makedirs(
    SAVE_DIR,
    exist_ok=True
)

session = requests.Session()

conn = sqlite3.connect(DB_FILE)

cursor = conn.cursor()


def build_absolute_url(image_url):
    if not image_url:
        return None

    image_url = image_url.strip()

    if image_url.startswith("http://") or image_url.startswith("https://"):
        return image_url

    if image_url.startswith("/"):
        return BASE_URL + image_url

    return BASE_URL + "/" + image_url


def get_folder_from_image_url(
    image_url,
    table_name,
):
    if table_name in FORCE_ITEM_FOLDER_TABLES:
        return os.path.join(
            SAVE_DIR,
            "items",
        )

    parsed = urlparse(image_url)
    path_dir = os.path.dirname(parsed.path).strip("/")

    if path_dir.startswith("assets/"):
        path_dir = path_dir.replace(
            "assets/",
            "",
            1,
        )

    if not path_dir:
        path_dir = table_name

    return os.path.join(
        SAVE_DIR,
        path_dir,
    )


def download_image(
    image_url,
    table_name,
    item_id,
):
    if not image_url:
        return

    image_url = build_absolute_url(image_url)

    if not image_url:
        return

    try:
        folder = get_folder_from_image_url(
            image_url,
            table_name,
        )

        os.makedirs(
            folder,
            exist_ok=True,
        )

        filename = os.path.basename(
            urlparse(image_url).path
        )

        if not filename:
            filename = f"{item_id}.png"

        filepath = os.path.join(
            folder,
            filename,
        )

        if os.path.exists(filepath):
            print(f"[SKIP] {filepath}")
            return

        response = session.get(
            image_url,
            headers=HEADERS,
            timeout=30,
        )

        if response.status_code != 200:
            print(f"[FAILED] {response.status_code} {image_url}")
            return

        with open(filepath, "wb") as f:
            f.write(response.content)

        print(f"[DOWNLOADED] {filepath}")

        time.sleep(0.5)

    except Exception as e:
        print(f"[ERROR] {image_url}")
        print(e)


def main():
    for table in TABLES:
        print("")
        print("====================")
        print(f"[TABLE] {table}")
        print("====================")

        try:
            cursor.execute(f"""
                SELECT id, image
                FROM {table}
                WHERE image IS NOT NULL
                  AND image != ''
            """)

            rows = cursor.fetchall()

            print(f"[FOUND] {len(rows)} IMAGES")

            for row in rows:
                item_id = row[0]
                image_url = row[1]

                download_image(
                    image_url,
                    table,
                    item_id,
                )

        except Exception as e:
            print(f"[ERROR TABLE] {table}")
            print(e)

    print("")
    print("[DONE]")


if __name__ == "__main__":
    main()