import { notFound } from "next/navigation"

import MonsterDetail from "@/components/monsters/MonsterDetail"

import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetch } from "@/lib/server-api"
import type {
    MonsterDetail as MonsterDetailType
} from "@/lib/types/Monster"

type Props = {

    params: Promise<{
        slug: string
    }>
}

export default async function MonsterDetailPage({
    params
}: Props) {

    const { slug } =
        await params

    const result =
        await serverApiFetch<MonsterDetailType>(
            `/api/v1/monsters/${slug}`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/monsters"
            />
        )
    }

    const monster =
        result.data

    if (!monster) {

        notFound()
    }

    return (
        <MonsterDetail
            monster={monster}
        />
    )
}