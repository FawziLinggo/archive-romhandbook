import { db } from "@/lib/db"

export function getSidebarCounts() {

    return {

        cards:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM cards
            `).get() as any,

        equipments:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM equipments
            `).get() as any,

        headwears:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM headwears
            `).get() as any,

        monsters:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM monsters
            `).get() as any,

        mounts:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM mounts
            `).get() as any,

        pets:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM pets
            `).get() as any,

        skills:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM skills
            `).get() as any,

        buffs:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM buffs
            `).get() as any,

        formulas:
            db.prepare(`
                SELECT COUNT(*) as total
                FROM formulas_code
            `).get() as any

    }

}