import html


def extract_formulas(soup):

    formulas = []

    for pre in soup.select("pre"):

        code = pre.select_one(
            "code"
        )

        if not code:
            continue

        text = code.get_text(

            "\n",

            strip=True

        )

        if not text:
            continue

        text = html.unescape(
            text
        )

        formulas.append(text)

    return formulas