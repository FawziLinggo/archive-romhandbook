import { db } from "@/lib/db"

export type Buff = {

    id: string

    name: string

    detail_url: string

    image: string | null

    description: string | null

    raw_json: string | null

}

const PAGE_SIZE = 24

export function getBuffs(

    page: number = 1,
    query: string = ""

) {

    const offset =
        (page - 1) * PAGE_SIZE

    const search =
        `%${query}%`

    const rows = db
        .prepare(`
        SELECT
            id,
            name,
            detail_url,
            image,
            description,
            raw_json

        FROM buffs

        WHERE
            name LIKE ?
            AND name IS NOT NULL
            AND name != ''

        ORDER BY

                CASE
                    WHEN name GLOB '[A-Za-z]*'
                    THEN 0
                    ELSE 1
                END,

                LOWER(name) ASC

        LIMIT ?
        OFFSET ?
    `)
        .all(
            search,
            PAGE_SIZE,
            offset
        ) as Buff[]

    const totalRow = db
        .prepare(`
        SELECT COUNT(*) as total

        FROM buffs

        WHERE
            name LIKE ?
            AND name IS NOT NULL
            AND name != ''
    `)
        .get(search) as {
            total: number
        }

    return {

        buffs: rows,
        total: totalRow.total

    }

}