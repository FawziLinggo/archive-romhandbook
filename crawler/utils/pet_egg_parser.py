from .text import clean_text
from .assets import normalize_asset_url
from .html import get_clean_body_html


def parse_pet_egg(
    soup,
    egg_url
):

    raw_html = get_clean_body_html(
        soup
    )

    # =========================
    # ID
    # =========================

    egg_id = egg_url.replace(
        "/things/",
        ""
    )

    # =========================
    # NAME
    # =========================

    name = None

    title = soup.select_one(
        "span.text-emerald-200"
    )

    if title:

        name = clean_text(
            title.get_text(
                " ",
                strip=True
            )
        )

    # =========================
    # IMAGE
    # =========================

    image = None

    img = soup.select_one(
        "img.h-12.w-12"
    )

    if img:

        image = normalize_asset_url(
            img.get("src")
        )

    # =========================
    # DESCRIPTION
    # =========================

    description = None

    desc = soup.select_one(
        "div.mt-1.grid.grid-cols-1"
    )

    if desc:

        description = clean_text(
            desc.get_text(
                " ",
                strip=True
            )
        )

    # =========================
    # FORMULAS
    # =========================

    formulas = []

    for code in soup.select(
        "pre code"
    ):

        text = code.get_text(
            "\n",
            strip=True
        )

        if text:

            formulas.append(text)

    return {

        "id": egg_id,

        "detail_url": egg_url,

        "image": image,

        "name": name,

        "description": description,

        "formulas_raw": "\n\n".join(formulas),

        "raw_html": raw_html
    }