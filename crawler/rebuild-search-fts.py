from utils.db import conn, cursor, init_db


def rebuild_search_fts():

    init_db()

    cursor.execute(
        "DELETE FROM archive_search_fts"
    )

    cursor.executescript(
        """
        INSERT INTO archive_search_fts (
            type,
            label,
            href,
            image,
            description
        )
        SELECT
            'Card',
            name,
            detail_url,
            image,
            effect_text
        FROM cards
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Monster',
            name,
            detail_url,
            image,
            location
        FROM monsters
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Skill',
            name,
            CASE
                WHEN detail_url LIKE '/skills/%'
                THEN detail_url
                ELSE '/skills/' || detail_url
            END,
            image,
            description
        FROM skills
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Equipment',
            name,
            detail_url,
            image,
            description
        FROM equipments
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Headwear',
            name,
            detail_url,
            image,
            description
        FROM headwears
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Mount',
            name,
            detail_url,
            image,
            description
        FROM mounts
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Pet',
            name,
            CASE
                WHEN detail_url LIKE '/pets/%'
                THEN detail_url
                ELSE '/pets/' || detail_url
            END,
            image,
            description
        FROM pets
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Buff',
            name,
            detail_url,
            image,
            description
        FROM buffs
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Formula',
            name,
            detail_url,
            NULL,
            formula_code
        FROM formulas_code
        WHERE name IS NOT NULL AND name != ''

        UNION ALL

        SELECT
            'Job',
            name,
            detail_url,
            image,
            NULL
        FROM jobs


        UNION ALL

    SELECT
        'Furniture' AS type,
        name AS label,
        detail_url AS href,
        image AS image,
        COALESCE(description, '') AS description
    FROM furnitures

        WHERE name IS NOT NULL AND name != '';
        """
    )

    conn.commit()

    cursor.execute(
        "SELECT COUNT(*) FROM archive_search_fts"
    )

    total = cursor.fetchone()[0]

    print(
        f"archive_search_fts rebuilt: {total} rows"
    )


if __name__ == "__main__":

    rebuild_search_fts()

    conn.close()