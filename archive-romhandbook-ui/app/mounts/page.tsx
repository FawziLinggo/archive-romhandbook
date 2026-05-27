import MountSearchClient from "@/components/mounts/MountSearchClient"
import {
    getMounts,
    getMountsCount
} from "@/lib/queries/mounts"

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
            <MountSearchClient
                initialMounts={mounts}
                total={total}
                page={page}
            />

        </div>



    )

}