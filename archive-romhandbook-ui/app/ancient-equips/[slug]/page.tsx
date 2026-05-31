import { notFound } from "next/navigation"

import AncientEquipDetail from "@/components/ancient-equips/AncientEquipDetail"
import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetch } from "@/lib/server-api"

import type {
    AncientEquipDetail as AncientEquipDetailType
} from "@/lib/types/AncientEquip"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export default async function AncientEquipDetailPage({
    params
}: Props) {
    const { slug } =
        await params

    const result =
        await serverApiFetch<AncientEquipDetailType>(
            `/api/v1/ancient-equips/${slug}`
        )

    if (result.error === "not_found") {
        notFound()
    }

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/ancient-equips"
            />
        )
    }

    return (
        <AncientEquipDetail
            item={result.data}
        />
    )
}