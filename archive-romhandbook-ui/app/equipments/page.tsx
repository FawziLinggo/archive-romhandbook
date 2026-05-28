import { headers } from "next/headers"

import EquipmentSearchClient from "@/components/equipments/EquipmentSearchClient"

import type {
    Equipment,
    PaginatedApiResponse,
} from "@/lib/types/Equipment"

type Props = {
    searchParams: Promise<{
        page?: string
        query?: string
        type?: string
        quality?: string
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

async function getEquipments({
    page,
    limit,
    query,
    type,
    quality,
    stat,
    unlock,
    depo,
    sort,
}: {
    page: number
    limit: number
    query: string
    type: string
    quality: string
    stat: string
    unlock: string
    depo: string
    sort: string
}) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8080"

    const qs =
        buildQueryString({
            page,
            limit,
            query,
            type,
            quality,
            stat,
            unlock,
            depo,
            sort,
        })

    const res =
        await fetch(
            `${API_URL}/api/v1/equipments?${qs}`,
            {
                next: {
                    revalidate: 60,
                },
            }
        )

    if (!res.ok) {
        throw new Error("Failed to fetch equipments")
    }

    return await res.json() as PaginatedApiResponse<Equipment>
}

export default async function EquipmentsPage({
    searchParams,
}: Props) {
    const params =
        await searchParams

    const requestHeaders =
        await headers()

    const userAgent =
        requestHeaders.get("user-agent") || ""

    const isMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)

    const limit =
        isMobile
            ? 8
            : 24

    const page =
        Math.max(
            1,
            Number(params.page || "1")
        )

    const query =
        params.query || ""

    const type =
        params.type || ""

    const quality =
        params.quality || ""

    const stat =
        params.stat || ""

    const unlock =
        params.unlock || ""

    const depo =
        params.depo || ""

    const sort =
        params.sort || "Name asc"

    const response =
        await getEquipments({
            page,
            limit,
            query,
            type,
            quality,
            stat,
            unlock,
            depo,
            sort,
        })

    return (
        <main
            className="
                mx-auto
                w-full
                max-w-7xl
                space-y-6
            "
        >
            <section className="space-y-2">
                <h1
                    className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white

                        sm:text-4xl
                    "
                >
                    Equipments
                </h1>

                <p
                    className="
                        max-w-2xl
                        text-sm
                        leading-6
                        text-zinc-400

                        sm:text-base
                    "
                >
                    Browse weapons, armor, accessories, costumes, deposits,
                    unlock bonuses, crafting paths, and archived ROM formulas.
                </p>
            </section>

            <EquipmentSearchClient
                initialEquipments={response.data}
                total={response.meta.total}
                page={response.meta.page}
                hasNext={response.meta.has_next}
                initialQuery={query}
                initialType={type}
                initialQuality={quality}
                initialStat={stat}
                initialUnlock={unlock}
                initialDepo={depo}
                initialSort={sort}
            />
        </main>
    )
}