import { notFound } from "next/navigation"

import BuffDetail from "@/components/buffs/BuffDetail"

import type {
    ApiResponse,
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

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/buffs/${slug}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        notFound()
    }

    const response =
        await res.json() as ApiResponse<BuffDetailType>

    const buff =
        response.data

    if (!buff) {

        notFound()
    }

    return (

        <BuffDetail
            buff={buff}
        />

    )
}