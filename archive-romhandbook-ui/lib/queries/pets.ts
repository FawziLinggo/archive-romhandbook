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
    unlock_text: string

    egg_name: string
    egg_url: string
    egg_image: string

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
                *
            FROM pets
            WHERE
                name LIKE ?
            ORDER BY
                name ASC
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
        pets: rows.slice(0, PAGE_SIZE),
        hasNext
    }
}