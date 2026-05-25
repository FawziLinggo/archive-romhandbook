import requests

from dotenv import load_dotenv
from bs4 import BeautifulSoup


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
# HEADERS
# =========================

HEADERS = {

    "User-Agent": (

        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64; rv:150.0) "
        "Gecko/20100101 Firefox/150.0"

    )

}


# =========================
# SESSION
# =========================

session = requests.Session()


# =========================
# SAFE GET
# =========================

def safe_get(url):

    try:

        response = session.get(

            url,

            headers=HEADERS,

            timeout=30

        )

        response.raise_for_status()

        return response.text

    except Exception as e:

        print(f"[ERROR] {url}")
        print(e)

        return None
    

# =========================
# GET SOUP
# =========================

def get_soup(url):

    html = safe_get(url)

    if not html:
        return None

    return BeautifulSoup(
        html,
        "lxml"
    )