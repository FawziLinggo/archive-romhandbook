import PetSearchClient from "@/components/pets/PetSearchClient"

import type {
    Pet
} from "@/lib/types/Pets"

type Props = {

    searchParams: Promise<{

        query?: string

        page?: string

    }>
}

export default async function PetsPage({
    searchParams
}: Props) {

    // =====================
    // PARAMS
    // =====================

    const params =
        await searchParams

    const query =
        params.query || ""

    const page =
        Number(
            params.page || "1"
        )

    // =====================
    // API
    // =====================

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    // =====================
    // FETCH
    // =====================

    const res =
        await fetch(

            `${API_URL}/api/v1/pets?page=${page}&limit=24&query=${encodeURIComponent(query)}`,

            {
                next: {

                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        throw new Error(
            "Failed to fetch pets"
        )
    }

    const response =
        await res.json()

    // =====================
    // DATA
    // =====================

    const pets =
        response.data as Pet[]

    const total =
        response.meta.total

    const hasNext =
        response.meta.has_next

    // =====================
    // RENDER
    // =====================

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    flex-col
                    gap-6

                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                "
            >

                {/* TITLE */}

                <div>

                    <h1
                        className="
                            mt-3

                            text-4xl
                            font-black

                            tracking-tight
                            text-white
                        "
                    >
                        Pets
                    </h1>

                    <p
                        className="
                            mt-2
                            text-zinc-400
                        "
                    >
                        Discover adorable companions,
                        magical familiars, and loyal pets
                        from Ragnarok Mobile.
                    </p>

                </div>

            </div>

            <PetSearchClient
                initialPets={pets}
                total={total}
                page={page}
            />

        </div>

    )

}