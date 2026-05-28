import CardSearchClient from "@/components/cards/CardSearchClient"

import type {
    Card,
    PaginatedApiResponse
} from "@/lib/types/Card"

export default async function CardsPage({
    searchParams
}: {
    searchParams: Promise<{
        type?: string
        quality?: string
        page?: string
    }>
}) {

    const params =
        await searchParams

    const type =
        params.type || ""

    const quality =
        params.quality || ""

    const page =
        Number(
            params.page || "1"
        )

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/cards?page=${page}&limit=24&type=${encodeURIComponent(type)}&quality=${encodeURIComponent(quality)}`,
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

    const cards =
        response.data

    const hasNext =
        response.meta.has_next

    return (

        <div>

            <div className="mb-6">

                <h1
                    className="
                        text-3xl
                        font-bold
                    "
                >
                    Cards
                </h1>

                <p className="text-zinc-400 mt-1">
                    Browse all ROM cards
                </p>

            </div>

            <CardSearchClient
                initialCards={cards}
                page={page}
                hasNext={hasNext}
                initialType={type}
                initialQuality={quality}
            />

        </div>
    )
}