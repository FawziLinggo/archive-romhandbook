import { db } from "@/lib/db"

export type Skill = {

    id: string

    detail_url: string

    image: string

    name: string

    max_level: number

    skill_type: string

    damage_type: string

    cooldown: string

    range_value: string

    cast_time: string

    description: string

}

const PAGE_SIZE = 24

export function getSkills(

    page: number = 1,

    query: string = ""

): {

    skills: Skill[]

    hasNext: boolean

} {

    // =====================
    // OFFSET
    // =====================

    const offset =
        (page - 1) * PAGE_SIZE

    // =====================
    // SEARCH
    // =====================

    const search =
        `%${query}%`

    // =====================
    // QUERY
    // =====================

    const rows = db
        .prepare(`
            SELECT

                s.id,
                s.detail_url,
                s.image,
                s.name,

                MAX(s.max_level) as max_level,

                s.skill_type,
                s.damage_type,

                s.cooldown,
                s.range_value,
                s.cast_time,

                s.description

            FROM skills s

            WHERE
                s.name LIKE ?
                OR
                s.description LIKE ?

            GROUP BY
                s.detail_url

            ORDER BY
                s.name ASC

            LIMIT ?
            OFFSET ?
        `)
        .all(
            search,
            search,
            PAGE_SIZE + 1,
            offset
        ) as Skill[]

    // =====================
    // HAS NEXT
    // =====================

    const hasNext =
        rows.length > PAGE_SIZE

    // =====================
    // REMOVE EXTRA
    // =====================

    const skills =
        rows.slice(0, PAGE_SIZE)

    // =====================
    // RETURN
    // =====================

    return {

        skills,

        hasNext

    }

}