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


export function getCardById(
    id: string
) {

    const row: any = db
        .prepare(`
            SELECT

                c.*,

                -- =====================
                -- FORMULAS
                -- =====================

                (
                    SELECT json_group_array(
                        json_object(

                            'id', f.id,
                            'formula_index', f.formula_index,
                            'formula_json', f.formula_json

                        )
                    )
                    FROM card_formulas f
                    WHERE f.card_id = c.id
                ) as formulas,

                -- =====================
                -- DEPOSIT
                -- =====================

                (
                    SELECT json_group_array(
                        bonus_text
                    )
                    FROM card_account_bonuses b
                    WHERE
                        b.card_id = c.id
                        AND
                        b.bonus_type = 'deposit'
                ) as deposit_texts,

                -- =====================
                -- UNLOCK
                -- =====================

                (
                    SELECT json_group_array(
                        bonus_text
                    )
                    FROM card_account_bonuses b
                    WHERE
                        b.card_id = c.id
                        AND
                        b.bonus_type = 'unlock'
                ) as unlock_texts,

                -- =====================
                -- MATERIALS
                -- =====================

                (
                    SELECT json_group_array(

                        json_object(

                            'id', m.id,
                            'material_name', m.material_name,
                            'material_image', m.material_image,
                            'material_url', m.material_url,
                            'material_type', m.material_type

                        )

                    )
                    FROM card_craft_materials m
                    WHERE m.card_id = c.id
                ) as craft_materials,

                -- =====================
                -- SKILLS
                -- =====================

                (
                    SELECT json_group_array(

                        json_object(

                            'id', s.id,
                            'skill_name', s.skill_name,
                            'skill_image', s.skill_image,
                            'skill_url', s.skill_url

                        )

                    )
                    FROM card_skills s
                    WHERE s.card_id = c.id
                ) as skills,

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
                ) as dropped_by,

                -- =====================
                -- CRAFTABLE
                -- =====================

                (
                    SELECT json_group_array(

                        json_object(

                            'id', cr.id,
                            'item_name', cr.item_name,
                            'item_image', cr.item_image,
                            'item_url', cr.item_url

                        )

                    )
                    FROM card_craftable cr
                    WHERE cr.card_id = c.id
                ) as craftable

            FROM cards c

            WHERE c.id = ?
        `)
        .get(id)

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

        formulas: JSON.parse(
            row.formulas || "[]"
        ),

        deposit_texts: JSON.parse(
            row.deposit_texts || "[]"
        ),

        unlock_texts: JSON.parse(
            row.unlock_texts || "[]"
        ),

        craft_materials: JSON.parse(
            row.craft_materials || "[]"
        ),

        skills: JSON.parse(
            row.skills || "[]"
        ),

        dropped_by: JSON.parse(
            row.dropped_by || "[]"
        ),

        craftable: JSON.parse(
            row.craftable || "[]"
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


export function getEquipmentById(
    id: string
) {

    const equipment: any = db
        .prepare(`
            SELECT *
            FROM equipments
            WHERE id = ?
        `)
        .get(id)

    // not found
    if (!equipment) {
        return null
    }

    return {

        ...equipment,

        effects: JSON.parse(
            equipment.effects || "[]"
        ),

        formulas: JSON.parse(
            equipment.formulas || "[]"
        ),

        craft_materials: JSON.parse(
            equipment.craft_materials || "[]"
        )

    }

}