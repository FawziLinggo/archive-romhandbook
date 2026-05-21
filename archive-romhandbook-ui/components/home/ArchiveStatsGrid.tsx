import Link from "next/link"

import {
    Code2,
    Crown,
    Layers,
    Motorbike,
    PawPrint,
    Shield,
    Skull,
    Sparkles
} from "lucide-react"

type Props = {
    counts: any
}

const items = [

    {
        title: "Cards",
        href: "/cards",
        icon: Layers,
        key: "cards",
        description: "Rare equipment cards"
    },

    {
        title: "Monsters",
        href: "/monsters",
        icon: Skull,
        key: "monsters",
        description: "MVP & field mobs"
    },

    {
        title: "Skills",
        href: "/skills",
        icon: Sparkles,
        key: "skills",
        description: "Class abilities"
    },

    {
        title: "Formulas",
        href: "/formulas",
        icon: Code2,
        key: "formulas",
        description: "Internal Lua formulas"
    },

    {
        title: "Equipments",
        href: "/equipments",
        icon: Shield,
        key: "equipments",
        description: "Weapons & armors"
    },

    {
        title: "Headwears",
        href: "/headwears",
        icon: Crown,
        key: "headwears",
        description: "Cosmetics archive"
    },

    {
        title: "Mounts",
        href: "/mounts",
        icon: Motorbike,
        key: "mounts",
        description: "Ride collection"
    },

    {
        title: "Pets",
        href: "/pets",
        icon: PawPrint,
        key: "pets",
        description: "Adventure companions"
    }

]

export default function ArchiveStatsGrid({
    counts
}: Props) {

    return (

        <section>

            {/* TITLE */}
            <div
                className="
                    mb-6
                "
            >

                <h2
                    className="
                        text-3xl
                        font-black
                        text-white
                    "
                >
                    Archive Database
                </h2>

                <p
                    className="
                        mt-2
                        text-zinc-400
                    "
                >
                    Explore preserved Ragnarok data
                </p>

            </div>

            {/* GRID */}
            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-4

                    gap-5
                "
            >

                {items.map((item) => {

                    const Icon =
                        item.icon

                    const total =
                        counts?.[
                            item.key
                        ]?.total || 0

                    return (

                        <Link
                            key={item.title}
                            href={item.href}
                            className="
                                group

                                relative
                                overflow-hidden

                                rounded-3xl

                                border
                                border-zinc-800

                                bg-gradient-to-b
                                from-zinc-900
                                to-zinc-950

                                p-6

                                hover:border-violet-500/50

                                transition-all
                                duration-300

                                hover:-translate-y-1
                            "
                        >

                            {/* GLOW */}
                            <div
                                className="
                                    absolute
                                    inset-0

                                    opacity-0
                                    group-hover:opacity-100

                                    transition-opacity

                                    bg-violet-500/5
                                "
                            />

                            {/* CONTENT */}
                            <div
                                className="
                                    relative
                                    z-10
                                "
                            >

                                {/* ICON */}
                                <div
                                    className="
                                        mb-5

                                        inline-flex

                                        rounded-2xl

                                        border
                                        border-zinc-700

                                        bg-zinc-800/50

                                        p-3

                                        text-violet-400
                                    "
                                >

                                    <Icon
                                        size={28}
                                    />

                                </div>

                                {/* TITLE */}
                                <h3
                                    className="
                                        text-xl
                                        font-bold
                                        text-white
                                    "
                                >
                                    {item.title}
                                </h3>

                                {/* TOTAL */}
                                <div
                                    className="
                                        mt-4

                                        text-3xl
                                        font-black

                                        text-violet-400
                                    "
                                >

                                    {total.toLocaleString()}

                                </div>

                                {/* DESC */}
                                <p
                                    className="
                                        mt-2

                                        text-sm
                                        text-zinc-500
                                    "
                                >
                                    {item.description}
                                </p>

                            </div>

                        </Link>

                    )

                })}

            </div>

        </section>

    )

}