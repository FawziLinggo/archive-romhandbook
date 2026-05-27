// import { db } from "@/lib/db"

// export type PetSkill = {

//     name: string

//     url: string

//     image: string
// }

// export type Pet = {

//     id: string

//     detail_url: string

//     image: string

//     name: string

//     race: string

//     element: string

//     size: string

//     description: string

//     unlock_text: string | null

//     egg_id: string | null

//     egg_url: string | null

//     egg_name: string | null

//     egg_image: string | null

//     skills: string
// }

// const PAGE_SIZE = 24

// export function getPets(

//     page: number = 1,

//     query: string = ""

// ): {

//     pets: Pet[]

//     hasNext: boolean

//     total: number

// } {

//     const offset =
//         (page - 1) * PAGE_SIZE

//     const search =
//         `%${query}%`

//     // =====================
//     // TOTAL
//     // =====================

//     const totalRow = db
//         .prepare(`
//             SELECT
//                 COUNT(*) as total
//             FROM pets
//             WHERE
//                 name LIKE ?
//         `)
//         .get(search) as {
//             total: number
//         }

//     // =====================
//     // ROWS
//     // =====================

//     const rows = db
//         .prepare(`
//             SELECT

//                 p.id,
//                 p.detail_url,
//                 p.image,
//                 p.name,

//                 p.race,
//                 p.element,
//                 p.size,

//                 p.description,
//                 p.unlock_text,

//                 p.egg_id,
//                 p.egg_url,

//                 pe.name as egg_name,
//                 pe.image as egg_image,

//                 COALESCE(
//                     p.skills,
//                     '[]'
//                 ) as skills

//             FROM pets p

//             LEFT JOIN pet_eggs pe
//                 ON pe.id = p.egg_id

//             WHERE
//                 p.name LIKE ?

//             ORDER BY

//                 CASE
//                     WHEN p.name GLOB '[A-Za-z]*'
//                     THEN 0
//                     ELSE 1
//                 END,

//                 LOWER(p.name) ASC

//             LIMIT ?
//             OFFSET ?
//         `)
//         .all(
//             search,
//             PAGE_SIZE + 1,
//             offset
//         ) as Pet[]

//     const hasNext =
//         rows.length > PAGE_SIZE

//     return {

//         pets: rows.slice(
//             0,
//             PAGE_SIZE
//         ),

//         hasNext,

//         total: totalRow.total
//     }
// }

// export type PetDetail = {

//     id: string

//     detail_url: string

//     image: string

//     name: string

//     race: string

//     element: string

//     size: string

//     description: string

//     unlock_text: string | null

//     skills: string

//     formulas_raw: string | null

//     raw_html: string | null

//     egg_name: string | null
//     egg_image: string | null
//     egg_url: string | null
// }

// export function getPetBySlug(
//     slug: string
// ): PetDetail | null {

//     return db
//         .prepare(`
//             SELECT

//                 p.*,

//                 pe.name as egg_name,
//                 pe.image as egg_image,
//                 pe.detail_url as egg_url,
//                 pe.formulas_raw

//             FROM pets p

//             LEFT JOIN pet_eggs pe
//                 ON pe.id = p.egg_id

//             WHERE
//                 p.detail_url = ?

//             LIMIT 1
//         `)
//         .get(slug) as PetDetail | null
// }


// export function searchPets(
//     query: string
// ) {

//     if (query.length < 4) {

//         return []

//     }

//     return db.prepare(`

//         SELECT

//             p.id,
//             p.detail_url,
//             p.image,
//             p.name,

//             p.race,
//             p.element,
//             p.size,

//             p.description,
//             p.unlock_text,

//             p.egg_id,
//             p.egg_url,

//             pe.name as egg_name,
//             pe.image as egg_image,

//             COALESCE(
//                 p.skills,
//                 '[]'
//             ) as skills

//         FROM pets p

//         LEFT JOIN pet_eggs pe
//             ON pe.id = p.egg_id

//         WHERE
//             LOWER(p.name)
//             LIKE LOWER(?)

//         ORDER BY
//             LOWER(p.name) ASC

//     `).all(`%${query}%`) as Pet[]

// }