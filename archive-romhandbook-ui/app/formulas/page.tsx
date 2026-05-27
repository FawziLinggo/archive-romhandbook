import FormulaExplorer from "@/components/formulas/FormulaExplorer"


import type {
    Formula,
    PaginatedApiResponse
} from "@/lib/types/Formula"

export default async function FormulasPage({
    searchParams
}: {
    searchParams: Promise<{
        q?: string
        page?: string
    }>
}) {

    const params =
        await searchParams

    const query =
        params.q || ""

    const page =
        Number(
            params.page || 1
        )

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/formulas?page=${page}&limit=20&query=${encodeURIComponent(query)}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        throw new Error(
            "Failed to fetch formulas"
        )
    }

    const response =
        await res.json() as PaginatedApiResponse<Formula>

    const formulas =
        response.data

    const total =
        response.meta.total

    return (

        <div>

            <div className="mb-10">

                <h1
                    className="
                        text-5xl
                        font-black
                        text-white
                    "
                >
                    Formulas
                </h1>

                <p
                    className="
                        text-zinc-400
                        mt-3
                        text-lg
                    "
                >
                    Explore ROM internal Lua formulas
                </p>

            </div>

            <FormulaExplorer
                initialFormulas={formulas}
                total={total}
                page={page}
            />

        </div>
    )
}