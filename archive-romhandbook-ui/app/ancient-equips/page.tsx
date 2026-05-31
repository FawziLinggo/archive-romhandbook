import AncientEquipSearchClient from "@/components/ancient-equips/AncientEquipSearchClient"
import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetchEnvelope } from "@/lib/server-api"

import type {
    PaginatedAncientEquipResponse
} from "@/lib/types/AncientEquip"

export default async function AncientEquipsPage({
    searchParams
}: {
    searchParams: Promise<{
        page?: string
        query?: string
    }>
}) {
    const params =
        await searchParams

    const page =
        Number(params.page || "1")

    const query =
        params.query || ""

    const result =
        await serverApiFetchEnvelope<PaginatedAncientEquipResponse>(
            `/api/v1/ancient-equips?page=${page}&limit=24&query=${encodeURIComponent(query)}`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/"
            />
        )
    }

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6">
            <section>
                <h1 className="text-4xl font-black text-white sm:text-5xl">
                    Ancient Equips
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                    Browse ancient equipment, effects, materials, jobs, and archived formulas.
                </p>
            </section>

            <AncientEquipSearchClient
                initialItems={result.data.data}
                total={result.data.meta.total}
                page={result.data.meta.page}
                hasNext={result.data.meta.has_next}
                initialQuery={query}
            />
        </main>
    )
}