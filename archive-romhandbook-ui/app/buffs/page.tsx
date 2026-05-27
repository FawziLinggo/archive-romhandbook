import BuffSearchClient from "@/components/buffs/BuffSearchClient"

import {
    getBuffs
} from "@/lib/queries/buffs"

export default async function BuffsPage({

    searchParams

}: {

    searchParams: Promise<{
        query?: string
        page?: string
    }>

}) {

    // =====================
    // SEARCH PARAMS
    // =====================

    const params =
        await searchParams

    const query =
        params.query || ""

    const page =
        Number(params.page || "1")

    // =====================
    // DATA
    // =====================

    const {

        buffs,
        total

    } = getBuffs(
        page,
        query
    )

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* HERO */}

            <div
                className="
                    space-y-3
                "
            >

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
                    Explore magical effects,
                    transformations,
                    and archived ROM buff formulas.
                </p>

            </div>

            {/* SEARCH + GRID  + PAGINATION */}

            <BuffSearchClient
                initialBuffs={buffs}
                total={total}
                page={page}
            />

        </div>

    )

}