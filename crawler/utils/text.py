import re


def clean_text(text):

    if not text:
        return None

    return re.sub(
        r"\s+",
        " ",
        text
    ).strip()