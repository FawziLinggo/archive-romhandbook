"use client"

import Link from "next/link"

import { usePathname } from "next/navigation"

import {
    Archive,
    Code2,
    Crown,
    Layers,
    Motorbike,
    PawPrint,
    Shield,
    Skull,
    Sparkles,
    WandSparkles
} from "lucide-react"

type Props = {
    counts: any
}

const menus = [

    {
        label: "Cards",
        href: "/cards",
        icon: Layers,
        countKey: "cards"
    },

    {
        label: "Equipments",
        href: "/equipments",
        icon: Shield,
        countKey: "equipments"
    },

    {
        label: "Headwears",
        href: "/headwears",
        icon: Crown,
        countKey: "headwears"
    },

    {
        label: "Monsters",
        href: "/monsters",
        icon: Skull,
        countKey: "monsters"
    },

    {
        label: "Mounts",
        href: "/mounts",
        icon: Motorbike,
        countKey: "mounts"
    },

    {
        label: "Pets",
        href: "/pets",
        icon: PawPrint,
        countKey: "pets"
    },

    {
        label: "Skills",
        href: "/skills",
        icon: Sparkles,
        countKey: "skills"
    },

    {
        label: "Buffs",
        href: "/buffs",
        icon: WandSparkles,
        countKey: "buffs"
    },

    {
        label: "Formulas",
        href: "/formulas",
        icon: Code2,
        countKey: "formulas"
    }

]

export default function SidebarClient({
    counts
}: Props) {

    // =====================
    // CURRENT PATH
    // =====================

    const pathname =
        usePathname()

    return (

        <aside
            className="
                sticky
                top-16

                h-[calc(100vh-4rem)]

                w-64

                border-r
                border-zinc-800

                bg-zinc-950

                flex
                flex-col
            "
        >

            {/* MENU */}
            <div
                className="
                    flex-1
                    overflow-y-auto
                    p-4
                "
            >

                <div className="space-y-2">

                    {menus.map((menu) => {

                        // =====================
                        // ACTIVE MENU
                        // =====================

                        const isActive =
                            pathname.startsWith(
                                menu.href
                            )

                        const Icon =
                            menu.icon

                        // =====================
                        // COUNT
                        // =====================

                        const count =
                            counts?.[
                                menu.countKey
                            ]?.total || 0

                        return (

                            <Link
                                key={menu.label}
                                href={menu.href}
                                className={`
                                    group

                                    flex
                                    items-center
                                    justify-between

                                    w-full

                                    px-4
                                    py-3

                                    rounded-2xl

                                    border

                                    transition-all
                                    duration-200

                                    ${isActive

                                        ? `
                                            bg-violet-600/20
                                            border-violet-500/50
                                            text-white

                                            shadow-lg
                                            shadow-violet-500/10
                                        `

                                        : `
                                            text-zinc-300

                                            hover:text-white
                                            hover:bg-zinc-900

                                            border-transparent

                                            hover:border-zinc-800
                                        `
                                    }
                                `}
                            >

                                {/* LEFT */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icon
                                        size={18}
                                    />

                                    <span
                                        className="
                                            font-medium
                                        "
                                    >

                                        {menu.label}

                                    </span>

                                </div>

                                {/* RIGHT */}
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    {/* COUNT */}
                                    <span
                                        className="
                                            text-xs

                                            px-2
                                            py-1

                                            rounded-full

                                            bg-zinc-800
                                            text-zinc-400
                                        "
                                    >

                                        {count.toLocaleString()}

                                    </span>

                                    {/* ARROW */}
                                    <span
                                        className={`
                                            transition-all
                                            duration-200

                                            text-violet-400

                                            ${isActive

                                                ? `
                                                    opacity-100
                                                    translate-x-0
                                                `

                                                : `
                                                    opacity-0
                                                    -translate-x-1

                                                    group-hover:opacity-100
                                                    group-hover:translate-x-0
                                                `
                                            }
                                        `}
                                    >
                                        →
                                    </span>

                                </div>

                            </Link>

                        )

                    })}

                </div>

            </div>

            {/* FOOTER */}
            <div
                className="
                    border-t
                    border-zinc-800
                    p-4
                "
            >

                <a
                    href="
https://github.com/FawziLinggo/archive-romhandbook
                    "
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2

                        rounded-2xl

                        border
                        border-zinc-800

                        bg-zinc-900

                        px-4
                        py-3

                        text-zinc-400
                        hover:text-white

                        hover:border-violet-500
                        hover:bg-zinc-800

                        transition-all
                    "
                >

                    <Archive
                        size={18}
                    />

                    <span
                        className="
                            text-sm
                            font-medium
                        "
                    >
                        Source Archive
                    </span>

                </a>

            </div>

        </aside>

    )

}