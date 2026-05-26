import {
    getMounts,
    getMountsCount
} from "@/lib/queries/mounts"

import PaginationSearch from "@/components/common/PaginationSearch"
import MountGrid from "@/components/mounts/MountGrid"

type Props = {

    searchParams: Promise<{
        search?: string
        page?: string
    }>

}

export default async function MountsPage({
    searchParams
}: Props) {
    const limit = 24


    const params =
        await searchParams

    const search =
        params.search || ""

    const page =
        Number(params.page || "1")

    const mounts =
        getMounts({
            search,
            page
        })

    const total =
        getMountsCount(search)



    return (

        <div className="space-y-8">

            {/* HERO */}

            <div>

                <h1
                    className="
                        text-5xl
                        font-black
                        tracking-tight
                        text-white
                    "
                >
                    Mount Archive
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

            <form
                action="/mounts"
                className="
        flex
        flex-col
        gap-4

        md:flex-row
    "
            >

                <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Search mounts..."
                    className="
            h-14
            flex-1
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            px-5
            text-white
            outline-none

            transition-colors

            focus:border-violet-500/50
        "
                />

                <button
                    type="submit"
                    className="
            h-14
            rounded-2xl
            bg-violet-600
            px-8
            font-semibold
            text-white

            transition-all

            hover:bg-violet-500
        "
                >
                    Search
                </button>

            </form>

            {/* STATS */}

            <p
                className="
                    text-sm
                    text-zinc-500
                "
            >
                {total.toLocaleString()} mounts archived
            </p>


            <MountGrid mounts={mounts} />

            <PaginationSearch
                page={page}
                total={total}
                basePath="/mounts"
                query={search}
            />

        </div>



    )

}