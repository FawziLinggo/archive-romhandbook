import argparse
import os
import re
import sqlite3
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")

BASE_URL = os.getenv("BASE_URL", "https://romhandbook.com").strip().rstrip("/")
DB_FILE = "../backend-api/storage/rom.db"
DB_PATH = str(Path(DB_FILE).resolve())

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"
    )
}


def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS maps (
            id TEXT PRIMARY KEY,
            detail_url TEXT UNIQUE,
            image TEXT,
            name TEXT,
            raw_html TEXT
        );

        CREATE TABLE IF NOT EXISTS map_monsters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            map_id TEXT NOT NULL,
            monster_id TEXT,
            monster_name TEXT,
            monster_image TEXT,
            monster_url TEXT,
            level TEXT,
            race TEXT,
            element TEXT,
            size TEXT,
            relation_index INTEGER DEFAULT 0,
            FOREIGN KEY(map_id) REFERENCES maps(id)
        );

        CREATE INDEX IF NOT EXISTS idx_maps_detail_url
        ON maps(detail_url);

        CREATE INDEX IF NOT EXISTS idx_maps_lower_name
        ON maps(LOWER(name));

        CREATE INDEX IF NOT EXISTS idx_map_monsters_map_id
        ON map_monsters(map_id);

        CREATE INDEX IF NOT EXISTS idx_map_monsters_monster_id
        ON map_monsters(monster_id);
        """
    )

    conn.commit()

    return conn


def clean_text(value):
    if not value:
        return None

    text = " ".join(value.split())

    return text.strip() or None


def normalize_path(value):
    if not value:
        return None

    absolute = urljoin(BASE_URL + "/", value.strip())
    parsed = urlparse(absolute)

    if parsed.netloc != urlparse(BASE_URL).netloc:
        return None

    return parsed.path.rstrip("/")


def absolute_url(path):
    return urljoin(BASE_URL + "/", path)


def normalize_asset(value):
    if not value:
        return None

    value = value.strip()

    if value.startswith(BASE_URL):
        return value.replace(BASE_URL, "")

    return value


def slug_from_path(path):
    return path.strip("/").split("/")[-1]


def id_from_monster_url(path):
    if not path:
        return None

    slug = slug_from_path(path)
    match = re.search(r"-(\d+)$", slug)

    if match:
        return match.group(1)

    return slug


def request_page(session, path, max_retries=3, sleep_seconds=1.0):
    url = absolute_url(path)

    for attempt in range(max_retries + 1):
        response = session.get(
            url,
            headers=HEADERS,
            timeout=30,
        )

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            delay = float(retry_after) if retry_after else sleep_seconds * (attempt + 2)

            print(f"[429] {path} sleep {delay}s")
            time.sleep(delay)
            continue

        if response.status_code != 200:
            raise RuntimeError(f"HTTP {response.status_code}")

        return response.text

    raise RuntimeError("HTTP 429 after retries")


def clean_body_html(soup):
    body = soup.select_one("body")

    if not body:
        return str(soup)

    for el in body.select("header, .sticky-top, .docs-sidebar, footer, script, style"):
        el.decompose()

    for img in body.select("img[src]"):
        img["src"] = normalize_asset(img.get("src"))

    for link in body.select("link[href]"):
        link["href"] = normalize_asset(link.get("href"))

    return str(body)


def fetch_soup(session, path, sleep_seconds, max_retries):
    html = request_page(
        session,
        path,
        max_retries=max_retries,
        sleep_seconds=sleep_seconds,
    )

    source_soup = BeautifulSoup(html, "lxml")
    raw_html = clean_body_html(source_soup)
    soup = BeautifulSoup(raw_html, "lxml")

    return soup, raw_html


def first_text(soup, selectors):
    for selector in selectors:
        node = soup.select_one(selector)

        if node:
            text = clean_text(node.get_text(" ", strip=True))

            if text:
                return text

    return None


def fetch_map_paths(session, sleep_seconds, max_retries):
    paths = []
    seen = set()

    page = 1

    while True:
        if page == 1:
            path = "/maps"
        else:
            path = f"/maps?page={page}"

        print("[LIST]", path)

        try:
            html = request_page(
                session,
                path,
                max_retries=max_retries,
                sleep_seconds=sleep_seconds,
            )
        except Exception as exc:
            print("[STOP LIST]", path, "-", exc)
            break

        soup = BeautifulSoup(html, "lxml")

        page_paths = []

        for link in soup.select('a[href^="/maps/"]'):
            map_path = normalize_path(link.get("href"))

            if not map_path:
                continue

            if map_path == "/maps":
                continue

            if map_path in seen:
                continue

            seen.add(map_path)
            page_paths.append(map_path)
            paths.append(map_path)

        print(
            "[LIST FOUND]",
            path,
            len(page_paths),
            "new maps"
        )

        if not page_paths:
            break

        page += 1

        time.sleep(sleep_seconds)

    return paths

def extract_map_image(soup):
    candidates = soup.select("main img, .docs-content img, img")

    for img in candidates:
        src = normalize_asset(img.get("src") or img.get("data-src"))

        if src:
            return src

    return None


def nearest_monster_block(link):
    current = link

    for _ in range(8):
        if not current:
            break

        text = clean_text(current.get_text(" ", strip=True)) or ""

        if "Level:" in text:
            return current

        current = current.parent

    return link


def parse_monster_traits(text, name, level):
    if not text:
        return None, None, None

    cleaned = text

    if name:
        cleaned = cleaned.replace(name, " ")

    if level:
        cleaned = re.sub(rf"Level:\s*{re.escape(level)}", " ", cleaned)

    cleaned = clean_text(cleaned)

    if not cleaned:
        return None, None, None

    parts = [
        clean_text(part)
        for part in cleaned.split("·")
        if clean_text(part)
    ]

    race = parts[0] if len(parts) > 0 else None
    element = parts[1] if len(parts) > 1 else None
    size = parts[2] if len(parts) > 2 else None

    return race, element, size


def extract_monsters(soup):
    monsters = []
    seen = set()

    for index, link in enumerate(soup.select('a[href^="/monsters/"]')):
        monster_url = normalize_path(link.get("href"))

        if not monster_url:
            continue

        if monster_url in seen:
            continue

        seen.add(monster_url)

        block = nearest_monster_block(link)

        img = block.select_one("img")
        monster_image = normalize_asset(img.get("src")) if img else None

        name = clean_text(link.get_text(" ", strip=True))

        if not name:
            name_node = block.select_one("span.text-sm.font-semibold, span.font-semibold, h3, h4")

            if name_node:
                name = clean_text(name_node.get_text(" ", strip=True))

        block_text = clean_text(block.get_text(" ", strip=True)) or ""

        level = None
        level_match = re.search(r"Level:\s*([0-9]+)", block_text)

        if level_match:
            level = level_match.group(1)

        race, element, size = parse_monster_traits(
            block_text,
            name,
            level,
        )

        monsters.append(
            {
                "monster_id": id_from_monster_url(monster_url),
                "monster_name": name,
                "monster_image": monster_image,
                "monster_url": monster_url,
                "level": level,
                "race": race,
                "element": element,
                "size": size,
                "relation_index": index,
            }
        )

    return monsters


def parse_map(path, soup, raw_html):
    name = first_text(
        soup,
        [
            "main h1",
            ".docs-content h1",
            "h1",
            "h2",
            "h3",
            "span.text.font-semibold",
            "span.font-semibold",
        ],
    )

    if not name:
        name = slug_from_path(path).replace("-", " ").title()

    image = extract_map_image(soup)

    monsters = extract_monsters(soup)

    return {
        "id": slug_from_path(path),
        "detail_url": path,
        "image": image,
        "name": name,
        "raw_html": raw_html,
        "monsters": monsters,
    }


def save_map(conn, data):
    conn.execute(
        """
        INSERT OR REPLACE INTO maps (
            id,
            detail_url,
            image,
            name,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            data["id"],
            data["detail_url"],
            data["image"],
            data["name"],
            data["raw_html"],
        ),
    )

    conn.execute(
        """
        DELETE FROM map_monsters
        WHERE map_id = ?
        """,
        (data["id"],),
    )

    for monster in data["monsters"]:
        conn.execute(
            """
            INSERT INTO map_monsters (
                map_id,
                monster_id,
                monster_name,
                monster_image,
                monster_url,
                level,
                race,
                element,
                size,
                relation_index
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["id"],
                monster["monster_id"],
                monster["monster_name"],
                monster["monster_image"],
                monster["monster_url"],
                monster["level"],
                monster["race"],
                monster["element"],
                monster["size"],
                monster["relation_index"],
            ),
        )


def already_saved(conn, path):
    row = conn.execute(
        """
        SELECT 1
        FROM maps
        WHERE detail_url = ?
           OR id = ?
        LIMIT 1
        """,
        (
            path,
            slug_from_path(path),
        ),
    ).fetchone()

    return row is not None


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--limit",
        type=int,
        default=0,
    )

    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
    )

    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
    )

    parser.add_argument(
        "--force",
        action="store_true",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
    )

    args = parser.parse_args()

    conn = connect_db()
    session = requests.Session()

    paths = fetch_map_paths(
        session,
        args.sleep,
        args.max_retries,
    )

    if args.limit > 0:
        paths = paths[:args.limit]

    print("[INFO] DB:", DB_PATH)
    print("[INFO] Map paths:", len(paths))

    counts = {
        "inserted": 0,
        "skipped": 0,
        "failed": 0,
    }

    for path in paths:
        if not args.force and already_saved(conn, path):
            counts["skipped"] += 1
            print("[SKIP]", path)
            continue

        print("[FETCH]", path)

        try:
            if args.dry_run:
                counts["inserted"] += 1
                print("[DRY RUN]", absolute_url(path))
                continue

            soup, raw_html = fetch_soup(
                session,
                path,
                args.sleep,
                args.max_retries,
            )

            data = parse_map(
                path,
                soup,
                raw_html,
            )

            save_map(
                conn,
                data,
            )

            conn.commit()

            counts["inserted"] += 1

            print(
                "[OK]",
                data["name"],
                "| monsters:",
                len(data["monsters"]),
            )

            time.sleep(args.sleep)

        except Exception as exc:
            counts["failed"] += 1
            conn.rollback()

            print("[FAILED]", path, "-", exc)

            time.sleep(args.sleep)

    conn.close()

    print("[DONE]", counts)


if __name__ == "__main__":
    main()