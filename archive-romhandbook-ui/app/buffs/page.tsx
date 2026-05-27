import BuffSearchClient from "@/components/buffs/BuffSearchClient"

import type {
    Buff,
    PaginatedApiResponse
} from "@/lib/types/Buff"

export default async function BuffsPage({

    searchParams

}: {

    searchParams: Promise<{
        query?: string
        page?: string
    }>
}) {
    // =====================
    // SEARCH PARAMS
    // =====================

    const params =
        await searchParams

    const query =
        params.query || ""

    const page =
        Number(params.page || "1")

    // =====================
    // API
    // =====================

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/buffs?page=${page}&limit=24&query=${encodeURIComponent(query)}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        throw new Error(
            "Failed to fetch buffs"
        )
    }

    const response =
        await res.json() as PaginatedApiResponse<Buff>

    const buffs =
        response.data

    const total =
        response.meta.total

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* HERO */}

            <div
                className="
                    space-y-3
                "
            >

                <h1
                    className="
                        text-5xl
                        font-black
                        tracking-tight
                        text-white
                    "
                >
                    Buffs
                </h1>

                <p
                    className="
                        text-lg
                        text-zinc-400
                    "
                >
                    Explore magical effects,
                    transformations,
                    and archived ROM buff formulas.
                </p>

            </div>

            {/* SEARCH + GRID  + PAGINATION */}

            <BuffSearchClient
                initialBuffs={buffs}
                total={total}
                page={page}
            />

        </div>
    )
}