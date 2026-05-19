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


export function getCardById(id: string) {

    const card: any = db
        .prepare(`
            SELECT *
            FROM cards
            WHERE id = ?
        `)
        .get(id)

    // kalau tidak ada
    if (!card) {
        return null
    }

    // parse JSON text
    return {

        ...card,

        effect_texts: JSON.parse(
            card.effect_text || "[]"
        ),

        deposit_texts: JSON.parse(
            card.deposit_text || "[]"
        ),

        unlock_texts: JSON.parse(
            card.unlock_text || "[]"
        ),

        craft_materials: JSON.parse(
            card.craft_materials || "[]"
        )

    }

}

export function getCardFormulas(
    cardId: string
) {

    const formulas = db
        .prepare(`
            SELECT *
            FROM card_formulas
            WHERE card_id = ?
            ORDER BY formula_index ASC
        `)
        .all(cardId)

    return formulas.map((formula: any) => ({
        ...formula,
        formula_json: JSON.parse(
            formula.formula_json || "{}"
        )
    }))

}