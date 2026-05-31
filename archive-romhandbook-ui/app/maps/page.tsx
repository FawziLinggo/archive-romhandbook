import ApiErrorState from "@/components/common/ApiErrorState"
import MapSearchClient from "@/components/maps/MapSearchClient"
import { serverApiFetchEnvelope } from "@/lib/server-api"

import type {
    PaginatedMapResponse
} from "@/lib/types/Map"

export default async function MapsPage({
    searchParams
}: {
    searchParams: Promise<{
        page?: string
    }>
}) {
    const params =
        await searchParams

    const page =
        Number(params.page || "1")

    const result =
        await serverApiFetchEnvelope<PaginatedMapResponse>(
            `/api/v1/maps?page=${page}&limit=24`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/"
            />
        )
    }

    const response =
        result.data

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-5xl font-black tracking-tight text-white">
                    Maps
                </h1>

                <p className="mt-3 max-w-2xl text-zinc-400">
                    Browse archived maps and the monsters found in each area.
                </p>
            </div>

            <MapSearchClient
                initialMaps={response.data}
                page={page}
                hasNext={response.meta.has_next}
                total={response.meta.total}
            />
        </div>
    )
}