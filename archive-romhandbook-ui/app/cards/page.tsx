import CardSearchClient from "@/components/cards/CardSearchClient"
import { headers } from "next/headers"

import type {
    Card,
    PaginatedApiResponse
} from "@/lib/types/Card"

type Props = {
    searchParams: Promise<{
        type?: string
        quality?: string
        page?: string
    }>
}

export default async function CardsPage({
    searchParams
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

    const type =
        params.type || ""

    const quality =
        params.quality || ""

    const page =
        Math.max(
            1,
            Number(params.page || "1")
        )

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080"

    const res =
        await fetch(
            `${API_URL}/api/v1/cards?page=${page}&limit=${limit}&type=${encodeURIComponent(type)}&quality=${encodeURIComponent(quality)}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        throw new Error(
            "Failed to fetch cards"
        )
    }

    const response =
        await res.json() as PaginatedApiResponse<Card>

    return (

        <main
            className="
                mx-auto
                w-full
                max-w-7xl

                space-y-6
            "
        >

            <section
                className="
                    space-y-2
                "
            >

                <h1
                    className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white

                        sm:text-4xl
                    "
                >
                    Cards
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
                    Browse monster cards, equipment cards, deposit bonuses,
                    unlock stats, and archived ROM formulas.
                </p>

            </section>

            <CardSearchClient
                initialCards={response.data}
                page={response.meta.page}
                hasNext={response.meta.has_next}
                initialType={type}
                initialQuality={quality}
                limit={limit}
            />

        </main>
    )
}