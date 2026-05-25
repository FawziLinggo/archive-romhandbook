from utils.assets import (
    rewrite_local_assets
)
import re


# =========================
# CLEAN BODY HTML
# =========================

def get_clean_body_html(soup):

    # =========================
    # BODY
    # =========================

    body_tag = soup.select_one(
        "body"
    )

    if not body_tag:
        return ""

    # =========================
    # REMOVE
    # =========================

    for el in body_tag.select(
        """
        header,
        footer,
        script,
        style,
        .sticky-top,
        .docs-sidebar
        """
    ):

        el.decompose()

    # =========================
    # REMOVE SHUTDOWN
    # =========================

    for el in body_tag.find_all(

        string=lambda t:
        t and "will shut down" in t

    ):

        parent = el.find_parent(
            "div"
        )

        if parent:

            parent.decompose()

    # =========================
    # REWRITE ASSETS
    # =========================

    body_tag = rewrite_local_assets(
        body_tag
    )

    return str(body_tag)


def clean_text(text):

    if not text:
        return None

    return re.sub(
        r"\s+",
        " ",
        text
    ).strip()