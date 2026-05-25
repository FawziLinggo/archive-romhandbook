from dotenv import load_dotenv

import os


# =========================
# ENV
# =========================

load_dotenv(
    dotenv_path="../.env"
)

BASE_URL = os.getenv(
    "BASE_URL",
    "https://romhandbook.com"
)


# =========================
# NORMALIZE LOCAL URL
# =========================

def normalize_local_url(url):

    if not url:

        return None

    return (

        url

        .replace(
            BASE_URL,
            ""
        )

        .strip()

    )


# =========================
# REWRITE HTML ASSETS
# =========================

def rewrite_local_assets(body_tag):

    # =========================
    # IMG
    # =========================

    for img in body_tag.find_all("img"):

        src = img.get("src")

        if not src:
            continue

        if (
            "https://romhandbook.com/assets/"
            in src
        ):

            img["src"] = src.replace(
                "https://romhandbook.com",
                ""
            )

    # =========================
    # LINK
    # =========================

    for link in body_tag.find_all("link"):

        href = link.get("href")

        if not href:
            continue

        if (
            "https://romhandbook.com/assets/"
            in href
        ):

            link["href"] = href.replace(
                "https://romhandbook.com",
                ""
            )

    return body_tag


def normalize_asset_url(url):

    return normalize_local_url(url)