import PaginationSearch from "@/components/common/PaginationSearch"

import BuffGrid from "@/components/buffs/BuffGrid"

import { getBuffs } from "@/lib/queries/buffs"

export default async function BuffsPage({

    searchParams

}: {

    searchParams: Promise<{
        query?: string
        page?: string
    }>

}) {

    const params =
        await searchParams

    const query =
        params.query || ""

    const page =
        Number(params.page || "1")

    const {
        buffs,
        total
    } = getBuffs(
        page,
        query
    )

    return (

        <div className="space-y-8">

            {/* HERO */}

            <div className="space-y-3">

                <h1
                    className="
            text-5xl
            font-black
            tracking-tight
            text-white
        "
                >
                    Buffs
                </h1>

                <p
                    className="
            text-lg
            text-zinc-400
        "
                >
                    Explore magical effects, transformations,
                    and archived ROM buff formulas.
                </p>

            </div>

            {/* SEARCH */}

            <form>

                <div
                    className="
                        flex
                        gap-4
                    "
                >

                    <input
                        type="text"
                        name="query"
                        defaultValue={query}
                        placeholder="Search buffs..."
                        className="
                            h-14
                            flex-1
                            rounded-2xl
                            border
                            border-white/10
                            bg-zinc-950/80
                            px-5
                            text-white
                            outline-none
                        "
                    />

                    <button
                        type="submit"
                        className="
                            rounded-2xl
                            bg-gradient-to-r
                            from-violet-600
                            to-fuchsia-500
                            px-8
                            font-semibold
                            text-white
                        "
                    >
                        Search
                    </button>

                </div>

            </form>

            {/* COUNT */}

            <div className="text-sm text-zinc-500">

                {total.toLocaleString()} buffs archived

            </div>

            {/* GRID */}

            <BuffGrid buffs={buffs} />

            {/* PAGINATION */}

            <PaginationSearch
                page={page}
                total={total}
                basePath="/buffs"
                query={query}
            />

        </div>

    )

}