import type {
    ApiResponse,
    ArchiveCounts
} from "@/lib/types/Archive"

import SidebarClient from "../sidebar/SidebarClient"

export default async function Sidebar() {

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8080"

    const res =
        await fetch(
            `${API_URL}/api/v1/archive/counts`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    const counts =
        res.ok
            ? (
                await res.json() as ApiResponse<ArchiveCounts>
            ).data
            : {
                cards: { total: 0 },
                equipments: { total: 0 },
                headwears: { total: 0 },
                monsters: { total: 0 },
                mounts: { total: 0 },
                pets: { total: 0 },
                skills: { total: 0 },
                buffs: { total: 0 },
                formulas: { total: 0 },
                jobs: { total: 0 }
            }

    return (

        <SidebarClient
            counts={counts}
        />

    )
}