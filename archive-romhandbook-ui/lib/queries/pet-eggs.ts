import { db } from "@/lib/db"

export type PetEgg = {

    id: string

    detail_url: string

    image: string

    name: string

    description: string

    effect_text: string | null

    unlock_text: string | null

    jobs_raw: string | null

    pet_url: string | null

    pet_name: string | null

    pet_image: string | null

    formulas_raw: string | null
}

export function getEggById(
    id: string
) {

    return db
        .prepare(`
            SELECT

                pe.*,

                p.name as pet_name,
                p.image as pet_image

            FROM pet_eggs pe

            LEFT JOIN pets p
                ON p.egg_id = pe.id

            WHERE pe.id = ?
        `)
        .get(id) as PetEgg | undefined

}