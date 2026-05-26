"use client"

import Link from "next/link"

import {
    usePathname
} from "next/navigation"

type Props = {

    item: any

    collapsed: boolean

    count?: number

}

export default function SidebarMenuItem({

    item,
    collapsed,
    count

}: Props) {

    const pathname =
        usePathname()

    const isActive =
        pathname.startsWith(
            item.href
        )

    const Icon =
        item.icon

    return (

        <Link
            href={item.href}
            className={`
                group
                relative

                flex
                items-center

                rounded-2xl

                border

                px-4
                py-3

                transition-all
                duration-300

                ${collapsed

                    ? `
                        justify-center
                    `

                    : `
                        gap-3
                    `
                }

                ${isActive

                    ? `
                        border-violet-500/40

                        bg-gradient-to-r
                        from-violet-500/20
                        to-fuchsia-500/10

                        text-white

                        shadow-lg
                        shadow-violet-500/10
                    `

                    : `
                        border-transparent

                        text-zinc-400

                        hover:border-zinc-800
                        hover:bg-zinc-900/80
                        hover:text-white
                    `
                }
            `}
        >

            {/* GLOW */}

            {isActive && (

                <div
                    className="
                        absolute
                        inset-0

                        rounded-2xl

                        bg-[radial-gradient(circle_at_left,rgba(139,92,246,0.15),transparent_70%)]

                        pointer-events-none
                    "
                />

            )}

            {/* ICON */}

            <div
                className="
                    relative
                    z-10

                    shrink-0
                "
            >

                <Icon
                    size={20}
                    strokeWidth={2}
                />

            </div>

            {/* CONTENT */}

            {!collapsed && (

                <>

                    <div
                        className="
                            relative
                            z-10

                            flex-1

                            text-sm
                            font-medium
                        "
                    >
                        {item.label}
                    </div>

                    {/* COUNT */}

                    {count !== undefined && (

                        <div
                            className={`
                                relative
                                z-10

                                rounded-full

                                px-2
                                py-1

                                text-xs
                                font-semibold

                                transition-colors

                                ${isActive

                                    ? `
                                        bg-white/10
                                        text-violet-100
                                    `

                                    : `
                                        bg-zinc-800
                                        text-zinc-400

                                        group-hover:bg-zinc-700
                                    `
                                }
                            `}
                        >
                            {count.toLocaleString()}
                        </div>

                    )}

                    {/* ARROW */}

                    <span
                        className={`
                            text-violet-400

                            transition-all
                            duration-200

                            ${isActive

                                ? `
                                    translate-x-0
                                    opacity-100
                                `

                                : `
                                    -translate-x-1
                                    opacity-0

                                    group-hover:translate-x-0
                                    group-hover:opacity-100
                                `
                            }
                        `}
                    >
                        →
                    </span>

                </>

            )}

        </Link>

    )

}