import { db } from "../db";

import {
    Formula
} from "../types/Formula";

const PAGE_SIZE = 20

// =====================
// GET FORMULAS
// =====================

export function getFormulas(
    search = "",
    page = 1
): Formula[] {

    let sql = `
        SELECT *
        FROM formulas_code
        WHERE 1=1
    `

    const params: any[] = []

    // SEARCH
    if (search) {

        sql += `
            AND (
                name LIKE ?
                OR
                formula_code LIKE ?
            )
        `

        params.push(
            `%${search}%`
        )

        params.push(
            `%${search}%`
        )

    }

    // PAGINATION
    sql += `
        ORDER BY name ASC
        LIMIT ?
        OFFSET ?
    `

    params.push(PAGE_SIZE)

    params.push(
        (page - 1)
        * PAGE_SIZE
    )

    return (

        db
            .prepare(sql)
            .all(...params)

    ) as Formula[]

}

// =====================
// TOTAL COUNT
// =====================

export function getFormulaCount(
    search = ""
): number {

    let sql = `
        SELECT COUNT(*) as total
        FROM formulas_code
        WHERE 1=1
    `

    const params: any[] = []

    if (search) {

        sql += `
            AND (
                name LIKE ?
                OR
                formula_code LIKE ?
            )
        `

        params.push(
            `%${search}%`
        )

        params.push(
            `%${search}%`
        )

    }

    const result: any = db
        .prepare(sql)
        .get(...params)

    return result.total || 0

}


export function getFeaturedFormula() {

    return db
        .prepare(`
            SELECT
                id,
                name,
                formula_code
            FROM formulas_code
            ORDER BY RANDOM()
            LIMIT 1
        `)
        .get() as any

}