import { db } from "@/lib/db"

export type PetSkill = {

    name: string

    url: string

    image: string
}

export type Pet = {

    id: string

    detail_url: string

    image: string

    name: string

    race: string

    element: string

    size: string

    description: string

    unlock_text: string | null

    egg_id: string | null

    egg_url: string | null

    egg_name: string | null

    egg_image: string | null

    skills: string
}

const PAGE_SIZE = 24

export function getPets(

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

                p.id,
                p.detail_url,
                p.image,
                p.name,

                p.race,
                p.element,
                p.size,

                p.description,
                p.unlock_text,

                p.egg_id,
                p.egg_url,

                pe.name as egg_name,
                pe.image as egg_image,

                COALESCE(
                    p.skills,
                    '[]'
                ) as skills

            FROM pets p

            LEFT JOIN pet_eggs pe
                ON pe.id = p.egg_id

            WHERE
                p.name LIKE ?

            ORDER BY

                CASE
                    WHEN p.name GLOB '[A-Za-z]*'
                    THEN 0
                    ELSE 1
                END,

                LOWER(p.name) ASC

            LIMIT ?
            OFFSET ?
        `)
        .all(
            search,
            PAGE_SIZE + 1,
            offset
        ) as Pet[]

    const hasNext =
        rows.length > PAGE_SIZE

    return {

        pets: rows.slice(
            0,
            PAGE_SIZE
        ),

        hasNext
    }
}