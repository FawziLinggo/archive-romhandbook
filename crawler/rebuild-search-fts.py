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
            'Furniture',
            name,
            CASE
                WHEN detail_url LIKE '/things/%'
                THEN detail_url
                ELSE '/things/' || detail_url
            END,
            image,
            TRIM(
                COALESCE(furniture_type, '') || ' ' ||
                COALESCE(furniture_subtype, '') || ' ' ||
                COALESCE(quality, '') || ' ' ||
                COALESCE(description, '') || ' ' ||
                COALESCE(effect_text, '') || ' ' ||
                COALESCE(unlock_text, '') || ' ' ||
                COALESCE(deposit_stats, '') || ' ' ||
                COALESCE(raw_tags, '')
            )
        FROM furnitures
        WHERE name IS NOT NULL AND TRIM(name) != ''

        UNION ALL

        SELECT
            'Cooking Ingredient',
            name,
            CASE
                WHEN detail_url LIKE '/things/%'
                THEN detail_url
                ELSE '/things/' || detail_url
            END,
            image,
            TRIM(
                COALESCE(ingredient_type, '') || ' ' ||
                COALESCE(quality, '') || ' ' ||
                COALESCE(description, '') || ' ' ||
                COALESCE(raw_tags, '')
            )
        FROM cooking_ingredients
        WHERE name IS NOT NULL AND TRIM(name) != ''

        UNION ALL

        SELECT
            'Pet Headwear Unlock Item',
            name,
            CASE
                WHEN detail_url LIKE '/things/%'
                THEN detail_url
                ELSE '/things/' || detail_url
            END,
            image,
            TRIM(
                COALESCE(item_type, '') || ' ' ||
                COALESCE(pet_headwear_name, '') || ' ' ||
                COALESCE(pet_name, '') || ' ' ||
                COALESCE(quality, '') || ' ' ||
                COALESCE(description, '') || ' ' ||
                COALESCE(unlock_effect_type, '') || ' ' ||
                COALESCE(unlock_body_ids, '') || ' ' ||
                COALESCE(raw_tags, '') || ' ' ||
                COALESCE(raw_formula, '')
            )
        FROM pet_headwear_unlock_items
        WHERE name IS NOT NULL AND TRIM(name) != ''
        
        UNION ALL

        SELECT
            'Artifact',
            name,
            CASE
                WHEN detail_url LIKE '/things/%'
                THEN detail_url
                ELSE '/things/' || detail_url
            END,
            image,
            TRIM(
                COALESCE(artifact_type, '') || ' ' ||
                COALESCE(artifact_subtype, '') || ' ' ||
                COALESCE(quality, '') || ' ' ||
                COALESCE(description, '') || ' ' ||
                COALESCE(effect_text, '') || ' ' ||
                COALESCE(unlock_text, '') || ' ' ||
                COALESCE(raw_tags, '')
            )
        FROM artifacts
        WHERE name IS NOT NULL AND TRIM(name) != ''
;
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