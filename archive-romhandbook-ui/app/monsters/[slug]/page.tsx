import { notFound } from "next/navigation"

import MonsterDetail from "@/components/monsters/MonsterDetail"

import type {
    ApiResponse,
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

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/monsters/${slug}`,
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
        await res.json() as ApiResponse<MonsterDetailType>

    const monster =
        response.data

    if (!monster) {

        notFound()
    }

    return (
        <MonsterDetail
            monster={monster}
        />
    )
}