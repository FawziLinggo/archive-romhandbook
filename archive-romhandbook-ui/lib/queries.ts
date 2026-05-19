import { db } from "./db";

export function getCards(
    search?: string,
    type?: string,
    quality?: string
) {

    let sql = `
        SELECT *
        FROM cards
        WHERE 1=1
    `

    const params: any[] = []

    // =====================
    // SEARCH
    // =====================

    if (search) {

        sql += `
            AND name LIKE ?
        `

        params.push(
            `%${search}%`
        )

    }

    // =====================
    // TYPE
    // =====================

    if (type) {

        sql += `
            AND card_type = ?
        `

        params.push(type)

    }

    // =====================
    // QUALITY
    // =====================

    if (quality) {

        sql += `
            AND quality = ?
        `

        params.push(quality)

    }

    // =====================
    // ORDER + LIMIT
    // =====================

    sql += `
        ORDER BY name ASC
        LIMIT 30
    `

    return db
        .prepare(sql)
        .all(...params)

}