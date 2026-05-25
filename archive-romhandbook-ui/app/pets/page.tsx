import PaginationSearch from "@/components/common/PaginationSearch"

import PetGrid from "@/components/pets/PetGrid"

import {
    getPets
} from "@/lib/queries/pets"

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
    // DATA
    // =====================

    const {

        pets,

        total,

        hasNext

    } = getPets(
        page,
        query
    )

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

                    <div
                        className="
                inline-flex
                items-center
                gap-2

                rounded-full

                border
                border-violet-500/20

                bg-violet-500/10

                px-3
                py-1

                text-xs
                font-medium

                text-violet-300
            "
                    >
                        ROM Pet Archive
                    </div>

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
                        {total.toLocaleString()} archived pets
                    </p>

                </div>

            </div>

            {/* SEARCH */}
            <form
                action="/pets"
                className="
                    flex
                    flex-col
                    gap-4

                    lg:flex-row
                "
            >

                <input
                    type="text"
                    name="query"
                    defaultValue={query}
                    placeholder="Search pets by name..."
                    className="
                        h-14
                        flex-1

                        rounded-2xl

                        border
                        border-white/10

                        bg-[#0f172a]

                        px-5

                        text-white
                        placeholder:text-zinc-500

                        outline-none

                        transition-all

                        focus:border-violet-500/50
                        focus:ring-4
                        focus:ring-violet-500/10
                    "
                />

                <button
                    type="submit"
                    className="
                        h-14

                        rounded-2xl

                        bg-gradient-to-r
                        from-violet-600
                        to-fuchsia-600

                        px-8

                        font-semibold
                        text-white

                        transition-all

                        hover:scale-[1.02]
                        hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]
                    "
                >
                    Search
                </button>

            </form>

            {/* STATS */}
            <div
                className="
                    flex
                    items-center
                    justify-between

                    text-sm
                    text-zinc-500
                "
            >

                <p>
                    {total.toLocaleString()} pets archived
                </p>

                <p>
                    Page {page}
                </p>

            </div>

            {/* GRID */}
            <PetGrid
                pets={pets}
            />

            {/* EMPTY */}
            {pets.length <= 0 && (

                <div
                    className="
                        rounded-3xl

                        border
                        border-dashed
                        border-white/10

                        bg-black/20

                        py-24
                        text-center
                    "
                >

                    <p
                        className="
                            text-lg
                            font-semibold
                            text-zinc-300
                        "
                    >
                        No pets found
                    </p>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-zinc-500
                        "
                    >
                        Try another keyword.
                    </p>

                </div>

            )}

            {/* PAGINATION */}
            {pets.length > 0 && (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/pets"
                    query={query}
                />

            )}

        </div>

    )

}