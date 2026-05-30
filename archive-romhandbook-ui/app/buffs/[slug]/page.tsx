import { notFound } from "next/navigation"

import BuffDetail from "@/components/buffs/BuffDetail"

import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetch } from "@/lib/server-api"
import type {
    BuffDetail as BuffDetailType
} from "@/lib/types/Buff"

type Props = {

    params: Promise<{
        slug: string
    }>
}

export default async function BuffPage({
    params
}: Props) {

    const { slug } =
        await params


    const result =
        await serverApiFetch<BuffDetailType>(
            `/api/v1/buffs/${slug}`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/buffs"
            />
        )
    }

    const buff =
        result.data

    if (!buff) {

        notFound()
    }

    return (

        <BuffDetail
            buff={buff}
        />

    )
}