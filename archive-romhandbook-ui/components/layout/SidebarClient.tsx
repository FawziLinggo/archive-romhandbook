"use client"

import Link from "next/link"

import { usePathname } from "next/navigation"

import {
    useState
} from "react"

import {
    ChevronLeft,
    ChevronRight,
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

    const [collapsed, setCollapsed] =
        useState(false)

    return (

        <aside
            className={`
        sticky
        top-16

        h-[calc(100vh-4rem)]

        border-r
        border-zinc-800

        bg-zinc-950

        flex
        flex-col

        transition-all
        duration-300

        ${collapsed
                    ? "w-24"
                    : "w-64"
                }
    `}
        >



            {/* CENTER TOGGLE */}

            <button
                onClick={() =>

                    setCollapsed(
                        !collapsed
                    )

                }
                className="
        absolute

        left-full
        top-1/2

        z-50

        flex
        h-12
        w-6

        -translate-x-1/2
        -translate-y-1/2

        items-center
        justify-center

        rounded-full

        border
        border-zinc-800

        bg-zinc-900

        text-zinc-400

        shadow-xl
        shadow-black/40

        transition-all

        hover:border-violet-500
        hover:text-white
    "
            >

                {collapsed

                    ? (
                        <ChevronRight
                            size={16}
                        />
                    )

                    : (
                        <ChevronLeft
                            size={16}
                        />
                    )

                }

            </button>

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
                                    ${collapsed
                                        ? "justify-center"
                                        : "justify-between"
                                    }

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

                                    {!collapsed && (

                                        <span
                                            className="
            font-medium
        "
                                        >
                                            {menu.label}
                                        </span>

                                    )}

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
                                    {!collapsed && (

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

                                    )}

                                    {/* ARROW */}

                                    {!collapsed && (

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

                                    )}

                                </div>

                            </Link>

                        )

                    })}

                </div>

            </div>


            {/* ACCOUNT CARD */}


            {collapsed ? (

                <div
                    className="
            px-3
            pb-4
        "
                >

                    <button
                        className="
                flex
                h-14
                w-14

                items-center
                justify-center

                rounded-2xl

                border
                border-white/5

                bg-zinc-900/80

                text-xl

                transition-all

                hover:border-violet-500/30
                hover:bg-violet-500/10
            "
                    >
                        👤
                    </button>

                </div>

            ) : (
                <div
                    className="
        px-3
        pb-3
    "
                >

                    <div
                        className="
            relative

            overflow-hidden

            rounded-2xl

            border
            border-white/5

            bg-zinc-900/80

            backdrop-blur-xl

            p-3

            shadow-xl
            shadow-black/20
        "
                    >

                        {/* SUBTLE GLOW */}

                        <div
                            className="
                pointer-events-none

                absolute
                inset-0

                bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06),transparent_45%)]

                opacity-70
            "
                        />

                        {/* CONTENT */}

                        <div
                            className="
                relative
                z-10
            "
                        >

                            {/* TOP */}

                            <div
                                className="
                    flex
                    items-center
                    gap-2.5
                "
                            >

                                {/* AVATAR */}

                                <div
                                    className="
                        flex
                        h-10
                        w-10
                        shrink-0

                        items-center
                        justify-center

                        rounded-xl

                        border
                        border-white/5

                        bg-black/30

                        text-sm
                    "
                                >
                                    👤
                                </div>

                                {/* INFO */}

                                <div
                                    className="
                        min-w-0
                        flex-1
                    "
                                >

                                    <div
                                        className="
                            flex
                            items-center
                            gap-2
                        "
                                    >

                                        <div
                                            className="
                                h-1.5
                                w-1.5

                                rounded-full

                                bg-emerald-400

                                animate-pulse
                            "
                                        />

                                        <p
                                            className="
                                truncate

                                text-sm
                                font-medium

                                text-white
                            "
                                        >
                                            Guest Adventurer
                                        </p>

                                    </div>

                                    <p
                                        className="
                            mt-0.5

                            text-[11px]

                            text-zinc-500
                        "
                                    >
                                        Login system coming soon
                                    </p>

                                </div>

                            </div>

                            {/* BUTTONS */}

                            <div
                                className="
                    mt-3

                    grid
                    grid-cols-2

                    gap-2
                "
                            >

                                <button
                                    disabled
                                    className="
                        h-9

                        rounded-xl

                        border
                        border-white/5

                        bg-zinc-800/70

                        text-xs
                        font-medium

                        text-zinc-300

                        opacity-60
                        cursor-not-allowed
                    "
                                >
                                    Login
                                </button>

                                <button
                                    disabled
                                    className="
                        h-9

                        rounded-xl

                        border
                        border-cyan-500/10

                        bg-cyan-500/5

                        text-xs
                        font-medium

                        text-cyan-200

                        opacity-60
                        cursor-not-allowed
                    "
                                >
                                    Register
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* FOOTER */}
            {/* <div
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

            </div> */}

        </aside>

    )

}