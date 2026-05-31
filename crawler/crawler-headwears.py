import json
import time
import sqlite3
import requests
import os

from bs4 import BeautifulSoup
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

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

with open(
    "sql/init.sql",
    "r",
    encoding="utf-8"
) as f:
    cursor.executescript(
        f.read()
    )

conn.commit()


def normalize_url(
    value
):
    if not value:
        return value

    return (
        value
        .replace("https://romhandbook.com", "")
        .replace("http://romhandbook.com", "")
    )


def clean_lines(
    text
):
    return [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]


def extract_section_items(
    content
):
    items = []

    paragraphs = content.select("p")

    if paragraphs:

        for p in paragraphs:

            text = p.get_text(
                    "\n",
                    strip=True
                )

            items.extend(
                clean_lines(text)
            )

        return items

    text = content.get_text(
            "\n",
            strip=True
        )

    return clean_lines(text)


def extract_detail_sections(
    soup
):
    sections = {}

    grid = soup.select_one("div.grid.grid-cols-12")

    if not grid:
        return sections

    children = [
        child
        for child in grid.find_all(
            "div",
            recursive=False
        )
    ]

    i = 0

    while i < len(children) - 1:

        label_div = children[i]

        content_div = children[i + 1]

        label_span = label_div.select_one(
            "span.text-sm.font-light.leading-6.text-emerald-200"
        )

        label_classes = label_div.get("class", [])

        content_classes = content_div.get("class", [])

        if (
            not label_span
            or "col-span-2" not in label_classes
            or "col-span-10" not in content_classes
        ):
            i += 1
            continue

        label = label_span.get_text(
                " ",
                strip=True
            )

        sections[label] = content_div

        i += 2

    return sections


def get_listing_items(
    page
):
    url = f"{BASE_URL}/headwears?page={page}"

    print(f"\n[INFO] LIST PAGE {page}")

    response = session.get(
            url,
            headers=HEADERS
        )

    soup = BeautifulSoup(
            response.text,
            "lxml"
        )

    cards = soup.select(
            'a[href^="/things/"]'
        )

    results = []

    for card in cards:

        href = card.get("href")

        if not href:
            continue

        item_id = href.split("-")[-1]

        image = card.select_one("img")

        image_url = None

        if image:
            image_url = normalize_url(
                image.get("src")
            )

        results.append({
            "id": item_id,
            "detail_url": normalize_url(href),
            "image": image_url,
        })

    return results


def rewrite_local_assets(
    body_tag
):
    for img in body_tag.find_all("img"):

        src = img.get("src")

        if not src:
            continue

        img["src"] = normalize_url(src)

    for link in body_tag.find_all("link"):

        href = link.get("href")

        if not href:
            continue

        link["href"] = normalize_url(href)

    return body_tag


def get_clean_body_html(
    soup
):
    body_tag = soup.select_one("body")

    if not body_tag:
        return ""

    for el in body_tag.select(
        "header, .sticky-top, .docs-sidebar, footer, script, style"
    ):
        el.decompose()

    for el in body_tag.find_all(
        string=lambda t:
            t and "will shut down" in t
    ):
        parent = el.find_parent("div")

        if parent:
            parent.decompose()

    body_tag = rewrite_local_assets(body_tag)

    return str(body_tag)


def save_formula(
    headwear_id,
    formula_index,
    formula_json
):
    formula_id = str(
        formula_json.get("id")
    )

    cursor.execute("""
        INSERT OR REPLACE INTO headwear_formulas (
            id,
    headwear_id,
    formula_index,
    formula_json
        )
        VALUES (?, ?, ?, ?)
    """, (
        formula_id,
        headwear_id,
        formula_index,
        json.dumps(
            formula_json,
            ensure_ascii=False
        )
    ))

    return formula_id


def get_item_detail(
    item
):
    detail_url = item["detail_url"]

    if detail_url.startswith("/"):
        detail_url = BASE_URL + detail_url

    response = session.get(
            detail_url,
            headers=HEADERS
        )

    if response.status_code != 200:
        print("[ERROR] DETAIL FAILED", detail_url)
        return

    clean_html =get_clean_body_html(
            BeautifulSoup(
                response.text,
                "lxml"
            )
        )

    soup = BeautifulSoup(
            clean_html,
            "lxml"
        )

    name = None
    item_type = None
    description = None
    quality = None

    name_tag = soup.select_one(
            "span.text.font-semibold.leading-6.text-emerald-200"
        )

    if name_tag:
        name = name_tag.get_text(
                " ",
                strip=True
            )

    type_tag = soup.select_one(
            "span.inline-flex.items-center"
        )

    if type_tag:
        item_type = type_tag.get_text(
                " ",
                strip=True
            )

    desc_tag = soup.select_one(
            "div.mt-1.grid.grid-cols-1 > div.border-t p.text-base"
        )

    if desc_tag:
        description = desc_tag.get_text(
                " ",
                strip=True
            )

    effect_text = []
    unlock_text = []
    deposit_stats = []
    unlock_stats = []
    jobs = []
    availability_date = None

    sections = extract_detail_sections(
            soup
        )

    if "Quality" in sections:

        quality_items = extract_section_items(
                sections["Quality"]
            )

        quality = quality_items[0] if quality_items else None

    if "Effect" in sections:

        effect_text = extract_section_items(
                sections["Effect"]
            )

    if "Deposit" in sections:

        deposit_stats = extract_section_items(
                sections["Deposit"]
            )

    if "Unlock" in sections:

        unlock_text = extract_section_items(
                sections["Unlock"]
            )

        unlock_stats = unlock_text

    if "Jobs" in sections:

        jobs_section = sections["Jobs"]

        jobs = [
            x.get_text(strip=True)
            for x in jobs_section.select(
                "span.inline-flex"
            )
        ]

        if not jobs:
            jobs = extract_section_items(
                jobs_section
            )

    if "Availability Date" in sections:

        availability_items = extract_section_items(
                sections["Availability Date"]
            )

        availability_date = availability_items[0] if availability_items else None

    formula_id = None

    code_tags = soup.select(
            "code.language-json"
        )

    for index, code_tag in enumerate(code_tags):

        raw_json = code_tag.get_text(
                strip=True
            )

        try:
            formula_json = json.loads(raw_json)

            current_formula_id = save_formula(
                    item["id"],
                    index,
                    formula_json
                )

            if formula_id is None:
                formula_id = current_formula_id

        except Exception as e:
            print("[FORMULA ERROR]", e)

    item["detail_url"] = normalize_url(
            item["detail_url"]
        )

    item["image"] = normalize_url(
            item["image"]
        )

    cursor.execute("""
        INSERT OR REPLACE INTO headwears (
            id,
            detail_url,
            image,
            name,
            type,
            description,
            quality,
            effect_text,
            unlock_text,
            deposit_stats,
            unlock_stats,
            jobs,
            formula_id,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item["id"],
        item["detail_url"],
        item["image"],
        name,
        item_type,
        description,
        quality,
        json.dumps(effect_text, ensure_ascii=False),
        json.dumps(unlock_text, ensure_ascii=False),
        json.dumps(deposit_stats, ensure_ascii=False),
        json.dumps(unlock_stats, ensure_ascii=False),
        json.dumps(jobs, ensure_ascii=False),
        formula_id,
        clean_html
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
        item["id"],
        "headwear",
        name,
        item["image"],
        item["detail_url"]
    ))

    conn.commit()

    print(
        f"[OK] {name} | effect={len(effect_text)} deposit={len(deposit_stats)} unlock={len(unlock_text)} jobs={len(jobs)}"
    )


page = 1
seen_ids = set()

while True:

    listing_items = get_listing_items(page)

    print(f"[INFO] FOUND {len(listing_items)} ITEMS")

    if len(listing_items) == 0:
        print("[INFO] NO MORE ITEMS")
        break

    new_items = []

    for item in listing_items:

        if item["id"] not in seen_ids:

            seen_ids.add(
                item["id"]
            )

            new_items.append(
                item
            )

    if len(new_items) == 0:
        print("[INFO] NO NEW ITEMS")
        break

    for item in new_items:

        try:
            get_item_detail(item)
            time.sleep(1)

        except Exception as e:
            print("ERROR:", e)

    page += 1

conn.close()

print("\n[INFO] DONE")