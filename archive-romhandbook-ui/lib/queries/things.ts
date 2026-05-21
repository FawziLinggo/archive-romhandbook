import { db } from "@/lib/db"

export function getThingTypeById(
    id: string
) {

    return db
        .prepare(`
            SELECT id, type
            FROM things
            WHERE id = ?

            LIMIT 1
        `)
        .get(
            id
        )

}

export function getRandomSnapshotCard() {

    const row: any = db
        .prepare(`
            SELECT

                c.id,
                c.name,
                c.image,
                c.detail_url,
                c.raw_html,
                c.card_type,
                c.quality,
                c.effect_text,

                -- =====================
                -- DROPPED BY
                -- =====================

                (
                    SELECT json_group_array(

                        json_object(

                            'id', d.id,
                            'monster_name', d.monster_name,
                            'monster_image', d.monster_image,
                            'monster_url', d.monster_url

                        )

                    )
                    FROM card_dropped_by d
                    WHERE d.card_id = c.id
                ) as dropped_by

            FROM cards c

            WHERE c.raw_html IS NOT NULL

            ORDER BY RANDOM()

            LIMIT 1
        `)
        .get()

    // =====================
    // NOT FOUND
    // =====================

    if (!row) {
        return null
    }

    // =====================
    // RETURN
    // =====================

    return {

        ...row,

        effect_texts: JSON.parse(
            row.effect_text || "[]"
        ),

        dropped_by: JSON.parse(
            row.dropped_by || "[]"
        )

    }

}