import FormulaExplorer from "@/components/formulas/FormulaExplorer"

import Link from "next/link"

import {
    GitBranch
} from "lucide-react"

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

                <div
                    className="
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
        "
                >
                    <h1
                        className="
                text-4xl
                font-black
                text-white

                sm:text-5xl
            "
                    >
                        Formulas
                    </h1>

                    <Link
                        href="/graph-explorer"
                        className="
                inline-flex
                h-10
                w-fit
                items-center
                justify-center
                gap-2

                rounded-2xl

                border
                border-violet-500/40

                bg-violet-500/10

                px-4

                text-xs
                font-black
                text-violet-200

                transition-colors

                hover:border-violet-400
                hover:bg-violet-500/20
                hover:text-white

                sm:mt-2
            "
                    >
                        <GitBranch size={15} />
                        Open Graph Explorer
                    </Link>
                </div>

                <p
                    className="
            mt-3
            max-w-2xl
            text-base
            leading-7
            text-zinc-400

            sm:text-lg
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