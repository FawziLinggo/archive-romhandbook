import type {
    Headwear
} from "@/lib/types/Headwear"

import HeadwearCard from "./HeadwearCard"

type Props = {

    headwears: Headwear[]

}

export default function HeadwearGrid({
    headwears
}: Props) {

    if (headwears.length === 0) {

        return (

            <div
                className="
                    rounded-2xl
                    border
                    border-dashed
                    border-zinc-800
                    bg-zinc-950/50
                    px-6
                    py-16
                    text-center
                "
            >
                <h3
                    className="
                        text-lg
                        font-bold
                        text-white
                    "
                >
                    No headwears found
                </h3>

                <p
                    className="
                        mt-2
                        text-sm
                        text-zinc-500
                    "
                >
                    Try another search or filter.
                </p>
            </div>

        )
    }

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
            "
        >

            {headwears.map((headwear) => (

                <HeadwearCard
                    key={headwear.id}
                    headwear={headwear}
                />

            ))}

        </div>

    )
}