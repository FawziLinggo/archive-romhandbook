import { db } from "@/lib/db"

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