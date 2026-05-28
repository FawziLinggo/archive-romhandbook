import json
import os
import re
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from utils.db import conn, cursor, init_db


BASE_URL = "https://romhandbook.com"
INDEX_URL = f"{BASE_URL}/jobs"

REQUEST_DELAY = 0.35

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0 Safari/537.36"
    )
}


def clean_text(value):
    if not value:
        return ""

    return re.sub(
        r"\s+",
        " ",
        value.get_text(" ", strip=True)
        if hasattr(value, "get_text")
        else str(value),
    ).strip()




def slug_from_job_href(href):
    if not href:
        return ""

    href = href.split("#")[0].split("?")[0].strip("/")

    if not href.startswith("jobs/"):
        return ""

    return href.replace("jobs/", "", 1)


def slug_from_href(href):
    if not href:
        return ""

    href = href.split("#")[0].split("?")[0].strip("/")
    parts = href.split("/")

    if len(parts) < 2:
        return ""

    return parts[-1]


def fetch(url):
    print(f"GET {url}")

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=30,
    )

    response.raise_for_status()

    time.sleep(REQUEST_DELAY)

    return response.text


def upsert_job(job):
        
    cursor.execute(
        """
        INSERT OR REPLACE INTO jobs (
            id,
            slug,
            detail_url,
            image,
            name,
            raw_html
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            job["slug"],
            job["slug"],
            job["detail_url"],
            job["image"],
            job["name"],
            job.get("raw_html", ""),
        ),
    )


def insert_job_relation(
    job_id,
    related_slug,
    related_name,
    relation_type,
    relation_index,
):
    cursor.execute(
        """
        INSERT OR REPLACE INTO job_relations (
            job_id,
            related_job_id,
            related_slug,
            related_name,
            relation_type,
            relation_index
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            job_id,
            related_slug,
            related_slug,
            related_name,
            relation_type,
            relation_index,
        ),
    )


def insert_job_skill(
    job_id,
    skill,
    skill_index,
):
    cursor.execute(
        """
        INSERT OR REPLACE INTO job_skills (
            job_id,
            skill_slug,
            skill_name,
            skill_image,
            skill_url,
            section,
            max_level,
            tags_raw,
            description,
            aesir_raw,
            raw_html,
            skill_index
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            job_id,
            skill["slug"],
            skill["name"],
            skill["image"],
            skill["url"],
            skill["section"],
            skill["max_level"],
            json.dumps(skill["tags"], ensure_ascii=False),
            skill["description"],
            json.dumps(skill["aesir"], ensure_ascii=False),
            skill["raw_html"],
            skill_index,
        ),
    )


def insert_job_rune(
    job_id,
    rune,
    rune_index,
):
    cursor.execute(
        """
        INSERT OR REPLACE INTO job_runes (
            job_id,
            rune_slug,
            rune_name,
            rune_image,
            rune_url,
            tags_raw,
            effects_raw,
            raw_html,
            rune_index
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            job_id,
            rune["slug"],
            rune["name"],
            rune["image"],
            rune["url"],
            json.dumps(rune["tags"], ensure_ascii=False),
            json.dumps(rune["effects"], ensure_ascii=False),
            rune["raw_html"],
            rune_index,
        ),
    )


def parse_job_card(anchor):
    href = anchor.get("href", "")
    slug = slug_from_job_href(href)

    if not slug:
        return None

    img = anchor.select_one("img")
    name_node = anchor.select_one("span")

    return {
        "slug": slug,
        "detail_url": f"/jobs/{slug}",
        "image": img.get("src", "") if img else "",
        "name": clean_text(name_node),
    }


def collect_jobs_from_index(html):
    soup = BeautifulSoup(html, "lxml")
    main = soup.select_one("main.docs-content") or soup

    jobs = []
    seen = set()

    for anchor in main.select('a[href^="/jobs/"]'):
        job = parse_job_card(anchor)

        if not job:
            continue

        if job["slug"] in seen:
            continue

        seen.add(job["slug"])
        jobs.append(job)

    return jobs


def parse_header_job(soup, slug):
    header = soup.select_one(".rounded.border.border-slate-700")
    job_name = ""
    job_image = ""

    if header:
        class_row = None

        for row in header.select(".grid.grid-cols-5"):
            label = clean_text(row.select_one(".col-span-1"))

            if label.lower() == "class":
                class_row = row
                break

        if class_row:
            img = class_row.select_one("img")
            name_node = class_row.select_one(".col-span-4 span")

            job_name = clean_text(name_node)
            job_image = img.get("src", "") if img else ""

    return {
        "slug": slug,
        "detail_url": f"/jobs/{slug}",
        "image": job_image,
        "name": job_name,
    }


def parse_previous_next(job_id, soup):
    header = soup.select_one(".rounded.border.border-slate-700")

    if not header:
        return

    for row in header.select(".grid.grid-cols-5"):
        label = clean_text(row.select_one(".col-span-1")).lower()

        if label not in ["previous", "next"]:
            continue

        for index, anchor in enumerate(row.select('.col-span-4 a[href^="/jobs/"]')):
            related_slug = slug_from_job_href(anchor.get("href", ""))
            related_name = clean_text(anchor)

            if not related_slug:
                continue

            insert_job_relation(
                job_id=job_id,
                related_slug=related_slug,
                related_name=related_name,
                relation_type=label,
                relation_index=index,
            )


def parse_summary_links(soup, title):
    result = []

    for panel in soup.select(".px-2.py-2.rounded.border, .px-1.py-2.rounded.border"):
        heading = clean_text(panel.select_one("p"))

        if heading.lower() != title.lower():
            continue

        for anchor in panel.select("a"):
            href = anchor.get("href", "")
            img = anchor.select_one("img")
            name_node = anchor.select_one("span")

            result.append(
                {
                    "anchor": href,
                    "slug": slug_from_href(href),
                    "name": clean_text(name_node),
                    "image": img.get("src", "") if img else "",
                }
            )

    return result


def parse_skill_cards(soup):
    skills = []
    current_section = "Skills"

    detail_area = None

    for section in soup.select(".mt-8.grid.grid-cols-1.gap-y-1"):
        first_title = clean_text(section.select_one("p.font-semibold"))

        if first_title.lower() == "skills":
            detail_area = section
            break

    if not detail_area:
        return skills

    for child in detail_area.children:
        if not getattr(child, "select_one", None):
            continue

        title = clean_text(child)

        if child.name == "p" and title:
            current_section = title
            continue

        skill_anchor = child.select_one('a[href^="/skills/"]')

        if not skill_anchor:
            continue

        href = skill_anchor.get("href", "")
        img = skill_anchor.select_one("img")
        name_node = skill_anchor.select_one("span")

        tags = [
            clean_text(tag)
            for tag in child.select(".inline-flex")
            if clean_text(tag)
        ]

        max_level = ""

        for tag in tags:
            if tag.lower().startswith("lvl:"):
                max_level = tag.replace("Lvl:", "").strip()
                break

        desc_node = child.select_one(".text-sm.text-white.font-medium p")

        aesir = []

        aesir_title = child.find(
            "p",
            string=lambda value: value and "Aesir" in value,
        )

        if aesir_title:
            for sibling in aesir_title.find_next_siblings("div"):
                text = clean_text(sibling)

                if text:
                    aesir.append(text)

        skills.append(
            {
                "slug": slug_from_href(href),
                "name": clean_text(name_node),
                "image": img.get("src", "") if img else "",
                "url": href,
                "section": current_section,
                "max_level": max_level,
                "tags": tags,
                "description": clean_text(desc_node),
                "aesir": aesir,
                "raw_html": str(child),
            }
        )

    return skills


def parse_rune_cards(soup):
    runes = []

    rune_area = None

    for section in soup.select(".mt-8.grid.grid-cols-1.gap-y-1"):
        first_title = clean_text(section.select_one("p.font-semibold"))

        if first_title.lower() == "runes":
            rune_area = section
            break

    if not rune_area:
        return runes

    for anchor in rune_area.select('a[href^="/things/"]'):
        href = anchor.get("href", "")
        root = anchor.select_one(".grid")

        if not root:
            continue

        images = root.select("img")
        name_node = root.select_one("span.text.leading-6.text-emerald-200")

        tags = [
            clean_text(tag)
            for tag in root.select(".inline-flex")
            if clean_text(tag)
        ]

        effects = []

        for effect_node in root.select(".pt-4 .px-2.text-sm"):
            effect = clean_text(effect_node)

            if effect:
                effects.append(effect)

        runes.append(
            {
                "slug": slug_from_href(href),
                "name": clean_text(name_node),
                "image": images[-1].get("src", "") if images else "",
                "url": href,
                "tags": tags,
                "effects": effects,
                "raw_html": str(root),
            }
        )

    return runes


def crawl_job_detail(job):
    slug = job["slug"]
    html = fetch(f"{BASE_URL}/jobs/{slug}")
    soup = BeautifulSoup(html, "lxml")

    detail_job = parse_header_job(soup, slug)

    if not detail_job["name"]:
        detail_job["name"] = job["name"]

    if not detail_job["image"]:
        detail_job["image"] = job["image"]

    detail_job["raw_html"] = html

    upsert_job(detail_job)

    parse_previous_next(slug, soup)

    for index, skill in enumerate(parse_skill_cards(soup)):
        insert_job_skill(
            job_id=slug,
            skill=skill,
            skill_index=index,
        )

    for index, rune in enumerate(parse_rune_cards(soup)):
        insert_job_rune(
            job_id=slug,
            rune=rune,
            rune_index=index,
        )

    conn.commit()

    print(
        f"saved {detail_job['name']} "
        f"skills={len(parse_skill_cards(soup))} "
        f"runes={len(parse_rune_cards(soup))}"
    )


def main():
    load_dotenv(
        dotenv_path="../.env"
    )

    init_db()

    index_html = fetch(INDEX_URL)
    jobs = collect_jobs_from_index(index_html)

    print(f"found jobs: {len(jobs)}")

    for index, job in enumerate(jobs):
        upsert_job(
            {
                **job,
                "raw_html": "",
            }
        )

        insert_job_relation(
            job_id=job["slug"],
            related_slug=job["slug"],
            related_name=job["name"],
            relation_type="index_order",
            relation_index=index,
        )

    conn.commit()

    for job in jobs:
        try:
            crawl_job_detail(job)
        except Exception as err:
            print(f"FAILED {job['slug']}: {err}")

    conn.commit()
    conn.close()

    print("done")


if __name__ == "__main__":
    main()