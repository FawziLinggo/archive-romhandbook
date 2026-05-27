// import { db } from "@/lib/db"

// export type Skill = {

//     id: string

//     detail_url: string

//     image: string

//     name: string

//     max_level: number

//     skill_type: string

//     damage_type: string

//     cooldown: string

//     range_value: string

//     cast_time: string

//     description: string

// }

// const PAGE_SIZE = 24

// export function getSkills(

//     page: number = 1,

//     query: string = ""

// ): {

//     skills: Skill[]

//     hasNext: boolean

// } {

//     // =====================
//     // OFFSET
//     // =====================

//     const offset =
//         (page - 1) * PAGE_SIZE

//     // =====================
//     // SEARCH
//     // =====================

//     const search =
//         `%${query}%`

//     // =====================
//     // QUERY
//     // =====================

//     const rows = db
//         .prepare(`
//             SELECT

//                 s.id,
//                 s.detail_url,
//                 s.image,
//                 s.name,

//                 MAX(s.max_level) as max_level,

//                 s.skill_type,
//                 s.damage_type,

//                 s.cooldown,
//                 s.range_value,
//                 s.cast_time,

//                 s.description

//             FROM skills s

//             WHERE
//                 s.name LIKE ?
//                 OR
//                 s.description LIKE ?

//             GROUP BY
//                 s.detail_url

//             ORDER BY

//             CASE
//                 WHEN s.name GLOB '[A-Za-z]*'
//                 THEN 0
//                 ELSE 1
//             END,

//             s.name COLLATE NOCASE ASC

//             LIMIT ?
//             OFFSET ?
//         `)
//         .all(
//             search,
//             search,
//             PAGE_SIZE + 1,
//             offset
//         ) as Skill[]

//     // =====================
//     // HAS NEXT
//     // =====================

//     const hasNext =
//         rows.length > PAGE_SIZE

//     // =====================
//     // REMOVE EXTRA
//     // =====================

//     const skills =
//         rows.slice(0, PAGE_SIZE)

//     // =====================
//     // RETURN
//     // =====================

//     return {

//         skills,

//         hasNext

//     }

// }





// export type SkillLevel = {

//     level: number

//     description: string

//     raw_tags: string | null


// }

// export type SkillDetail = {

//     id: string

//     detail_url: string

//     image: string

//     name: string

//     max_level: number

//     skill_type: string

//     damage_type: string

//     cooldown: string

//     range_value: string

//     cast_time: string

//     fixed_cast_time: string

//     description: string

//     formula_raw: string | null

//     aesir_raw: string | null

//     levels: SkillLevel[]
//     raw_html: string | null

// }

// export function getSkillBySlug(
//     slug: string
// ): SkillDetail | null {

//     // =====================
//     // SKILL
//     // =====================

//     const skill = db
//         .prepare(`
//             SELECT
//                 id,
//                 detail_url,
//                 image,
//                 name,
//                 max_level,
//                 skill_type,
//                 damage_type,
//                 cooldown,
//                 range_value,
//                 cast_time,
//                 fixed_cast_time,
//                 description,
//                 formula_raw,
//                 aesir_raw,
//                 raw_html
//             FROM skills
//             WHERE detail_url = ?
//             LIMIT 1
//         `)
//         .get(slug) as SkillDetail | undefined

//     // =====================
//     // NOT FOUND
//     // =====================

//     if (!skill) {

//         return null

//     }

//     // =====================
//     // LEVELS
//     // =====================

//     const levels = db
//         .prepare(`
//             SELECT
//                 level,
//                 description,
//                 raw_tags
//             FROM skill_levels
//             WHERE skill_id = ?
//             ORDER BY level DESC
//         `)
//         .all(skill.id) as SkillLevel[]

//     // =====================
//     // RETURN
//     // =====================

//     return {

//         ...skill,

//         levels

//     }

// }


// export function searchSkills(
//     query: string
// ) {

//     if (query.length < 4) {

//         return []

//     }

//     return db.prepare(`

//         SELECT

//             s.id,
//             s.detail_url,
//             s.image,
//             s.name,

//             MAX(s.max_level) as max_level,

//             s.skill_type,
//             s.damage_type,

//             s.cooldown,
//             s.range_value,
//             s.cast_time,

//             s.description

//         FROM skills s

//         WHERE
//             LOWER(s.name)
//             LIKE LOWER(?)

//             OR

//             LOWER(s.description)
//             LIKE LOWER(?)

//         GROUP BY
//             s.detail_url

//         ORDER BY

//             CASE
//                 WHEN s.name GLOB '[A-Za-z]*'
//                 THEN 0
//                 ELSE 1
//             END,

//             s.name COLLATE NOCASE ASC

//     `).all(

//         `%${query}%`,
//         `%${query}%`

//     ) as Skill[]

// }