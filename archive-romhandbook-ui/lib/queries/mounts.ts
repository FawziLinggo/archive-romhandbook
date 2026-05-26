import { db } from "@/lib/db"

type GetMountsProps = {

    search?: string
    page?: number
    limit?: number

}

export function getMounts({

    search = "",
    page = 1,
    limit = 24

}: GetMountsProps = {}) {

    const offset =
        (page - 1) * limit

    return db.prepare(`

        SELECT
            id,
            name,
            detail_url,
            image,
            description,
            quality,
            effect_text,
            unlock_text,
            jobs
        FROM mounts

        WHERE
            LOWER(name)
            LIKE LOWER(?)

        ORDER BY
            LOWER(name) ASC

        LIMIT ?
        OFFSET ?

    `).all(

        `%${search}%`,
        limit,
        offset

    )

}


export function getMountsCount(
    search = ""
) {

    const result: any =
        db.prepare(`

            SELECT
                COUNT(*) as total
            FROM mounts

            WHERE
                LOWER(name)
                LIKE LOWER(?)

        `).get(
            `%${search}%`
        )

    return result.total

}


export function getMountById(
    id: string
) {

    return db.prepare(`

        SELECT
            id,
            detail_url,
            image,
            name,
            mount_type,
            description,
            quality,
            effect_text,
            unlock_text,
            jobs,
            raw_html

        FROM mounts

        WHERE id = ?

        LIMIT 1

    `).get(id)

}