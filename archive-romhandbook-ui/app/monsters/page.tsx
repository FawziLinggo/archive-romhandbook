import MonsterSearchClient from "@/components/monsters/MonsterSearchClient"

import type {
    Monster,
    PaginatedApiResponse
} from "@/lib/types/Monster"

export default async function MonstersPage({
    searchParams
}: {
    searchParams: Promise<{
        page?: string
        size?: string
        element?: string
        race?: string
        sort?: string
    }>
}) {

    const params =
        await searchParams

    const page =
        Number(params.page || "1")

    const size =
        params.size || ""

    const element =
        params.element || ""

    const race =
        params.race || ""

    const sort =
        params.sort || "Name asc"

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/monsters?page=${page}&limit=24&size=${encodeURIComponent(size)}&element=${encodeURIComponent(element)}&race=${encodeURIComponent(race)}&sort=${encodeURIComponent(sort)}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        throw new Error(
            "Failed to fetch monsters"
        )
    }

    const response =
        await res.json() as PaginatedApiResponse<Monster>

    return (

        <div className="space-y-8">

            <div>
                <h1
                    className="
                        text-5xl
                        font-black
                        tracking-tight
                        text-white
                    "
                >
                    Monsters
                </h1>

                <p
                    className="
                        mt-3
                        max-w-2xl
                        text-zinc-400
                    "
                >
                    Browse monsters, bosses, locations, stats, races, and elements from the archived ROM Handbook.
                </p>
            </div>

            <MonsterSearchClient
                initialMonsters={response.data}
                page={page}
                hasNext={response.meta.has_next}
                total={response.meta.total}
                initialSize={size}
                initialElement={element}
                initialRace={race}
                initialSort={sort}
            />

        </div>
    )
}