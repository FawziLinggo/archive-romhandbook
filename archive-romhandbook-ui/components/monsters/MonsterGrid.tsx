import type {
    Monster
} from "@/lib/types/Monster"

import MonsterCard from "./MonsterCard"

type Props = {

    monsters: Monster[]
}

export default function MonsterGrid({
    monsters
}: Props) {

    if (monsters.length === 0) {

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
                <h3 className="text-2xl font-bold text-white">
                    No Monster Found
                </h3>

                <p className="mt-3 text-zinc-400">
                    Try another name, race, element, or size.
                </p>
            </div>
        )
    }

    return (

        <div
            className="
                grid
                gap-4
                xl:grid-cols-2
            "
        >

            {monsters.map((monster) => (

                <MonsterCard
                    key={monster.id}
                    monster={monster}
                />
            ))}

        </div>
    )
}