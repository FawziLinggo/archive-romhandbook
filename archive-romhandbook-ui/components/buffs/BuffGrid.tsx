import type {
    Buff
} from "@/lib/types/Buff"

import BuffCard from "./BuffCard"

type Props = {

    buffs: Buff[]

}

export default function BuffGrid({

    buffs

}: Props) {

    if (!buffs.length) {

        return (

            <div
                className="
                    rounded-3xl
                    border
                    border-white/10
                    bg-zinc-950/40
                    p-16
                    text-center
                "
            >

                <div
                    className="
                        mx-auto
                        mb-5
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-violet-500/20
                        bg-violet-500/10
                        text-4xl
                    "
                >
                    ✦
                </div>

                <h3
                    className="
                        text-2xl
                        font-bold
                        text-white
                    "
                >
                    No Buff Found
                </h3>

                <p
                    className="
                        mt-3
                        text-zinc-400
                    "
                >
                    The magic archive could not find
                    the requested buff.
                </p>

            </div>

        )

    }

    return (

        <div
            className="
                grid
                gap-5

                sm:grid-cols-2
                xl:grid-cols-3
            "
        >

            {buffs.map((buff) => (

                <BuffCard
                    key={buff.id}
                    buff={buff}
                />

            ))}

        </div>

    )

}