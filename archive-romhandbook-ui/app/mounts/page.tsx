import MountSearchClient from "@/components/mounts/MountSearchClient"

import type {
    Mount,
    PaginatedApiResponse
} from "@/lib/types/Mount"

type Props = {

    searchParams: Promise<{
        search?: string
        page?: string
    }>
}

export default async function MountsPage({
    searchParams
}: Props) {

    const params =
        await searchParams

    const search =
        params.search || ""

    const page =
        Number(params.page || "1")

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/mounts?page=${page}&limit=24&query=${encodeURIComponent(search)}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {
        throw new Error("Failed to fetch mounts")
    }

    const response =
        await res.json() as PaginatedApiResponse<Mount>

    const mounts =
        response.data

    const total =
        response.meta.total

    return (
        <div className="space-y-8">

            <div>
                <h1
                    className="
                        text-5xl
                        font-black
                        tracking-tight
                        text-white
                    "
                >
                    Mount
                </h1>

                <p
                    className="
                        mt-3
                        max-w-2xl
                        text-zinc-400
                    "
                >
                    Explore magical creatures,
                    rare mounts, and legendary rides
                    from Ragnarok Mobile.
                </p>
            </div>

            <MountSearchClient
                initialMounts={mounts}
                total={total}
                page={page}
            />

        </div>
    )
}