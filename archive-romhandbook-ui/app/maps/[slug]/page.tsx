import { notFound } from "next/navigation"

import ApiErrorState from "@/components/common/ApiErrorState"
import MapDetail from "@/components/maps/MapDetail"
import { serverApiFetch } from "@/lib/server-api"

import type {
    ROMMapDetail
} from "@/lib/types/Map"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export default async function MapDetailPage({
    params
}: Props) {
    const { slug } =
        await params

    const result =
        await serverApiFetch<ROMMapDetail>(
            `/api/v1/maps/${slug}`
        )

    if (result.error === "not_found") {
        notFound()
    }

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/maps"
            />
        )
    }

    return (
        <MapDetail
            map={result.data}
        />
    )
}