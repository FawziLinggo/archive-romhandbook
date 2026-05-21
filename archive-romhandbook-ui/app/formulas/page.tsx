import FormulaExplorer from "@/components/formulas/FormulaExplorer"


import {
    getFormulaCount,
    getFormulas
} from "@/lib/queries/formulas"

import PaginationSearch from "@/components/common/PaginationSearch"
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

    // =====================
    // DATA
    // =====================

    const formulas =
        getFormulas(
            query,
            page
        )

    // =====================
    // TOTAL
    // =====================

    const total =
        getFormulaCount(
            query
        )

    return (

        <div>

            {/* HEADER */}
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

            {/* SEARCH */}
            <form
                action="/formulas"
                className="mb-8"
            >

                <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="
                        Search formulas...
                    "
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        px-5
                        py-4
                        outline-none
                    "
                />

            </form>

            {/* TOTAL */}
            <div
                className="
                    mb-6
                    text-sm
                    text-zinc-500
                "
            >

                {total}
                {" "}
                formulas found

            </div>

            {/* GRID */}
            <FormulaExplorer
                formulas={formulas}
            />

            {/* PAGINATION */}
            <PaginationSearch
                page={page}
                total={total}
                basePath="/formulas"
                query={query}
            />

        </div>

    )

}