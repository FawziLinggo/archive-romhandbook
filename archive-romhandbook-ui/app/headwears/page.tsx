import HeadwearSearchClient from "@/components/headwears/HeadwearSearchClient"

import type {
    Headwear,
    PaginatedApiResponse,
} from "@/lib/types/Headwear"

type Props = {
    searchParams: Promise<{
        page?: string
        query?: string
        position?: string
        stat?: string
        unlock?: string
        depo?: string
        sort?: string
    }>
}

function buildQueryString(
    params: Record<string, string | number>
) {
    const searchParams =
        new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === "" || value === 0) {
            return
        }

        searchParams.set(
            key,
            String(value)
        )
    })

    return searchParams.toString()
}

async function getHeadwears({
    page,
    query,
    position,
    stat,
    unlock,
    depo,
    sort,
}: {
    page: number
    query: string
    position: string
    stat: string
    unlock: string
    depo: string
    sort: string
}) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const qs =
        buildQueryString({
            page,
            limit: 24,
            query,
            position,
            stat,
            unlock,
            depo,
            sort,
        })

    const res =
        await fetch(
            `${API_URL}/api/v1/headwears?${qs}`,
            {
                next: {
                    revalidate: 60,
                },
            }
        )

    if (!res.ok) {
        throw new Error("Failed to fetch headwears")
    }

    return await res.json() as PaginatedApiResponse<Headwear>
}

export default async function HeadwearsPage({
    searchParams,
}: Props) {
    const params =
        await searchParams

    const page =
        Math.max(
            1,
            Number(params.page || "1")
        )

    const query =
        params.query || ""

    const position =
        params.position || ""

    const stat =
        params.stat || ""

    const unlock =
        params.unlock || ""

    const depo =
        params.depo || ""

    const sort =
        params.sort || "Name asc"

    const response =
        await getHeadwears({
            page,
            query,
            position,
            stat,
            unlock,
            depo,
            sort,
        })

    return (
        <main
            className="
                mx-auto
                max-w-7xl
                px-4
                py-10
                sm:px-6
                lg:px-8
            "
        >
            <section className="mb-8">
                <h1
                    className="
                        text-4xl
                        font-bold
                        tracking-tight
                        text-white
                    "
                >
                    Headwears
                </h1>

                <p
                    className="
                        mt-3
                        max-w-2xl
                        text-base
                        leading-7
                        text-zinc-400
                    "
                >
                    Browse costumes, face items, mouth items, backs, tails,
                    unlock bonuses, deposits, and archived ROM formulas.
                </p>
            </section>

            <HeadwearSearchClient
                initialHeadwears={response.data}
                total={response.meta.total}
                page={response.meta.page}
                hasNext={response.meta.has_next}
                initialQuery={query}
                initialPosition={position}
                initialStat={stat}
                initialUnlock={unlock}
                initialDepo={depo}
                initialSort={sort}
            />
        </main>
    )
}