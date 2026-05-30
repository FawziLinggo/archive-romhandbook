"use client"

import {
    useSidebar
} from "@/contexts/SidebarContext"
import { assetUrl } from "@/lib/utils"

import Link from "next/link"

export default function Navbar() {

    const {

        mobileOpen,
        setMobileOpen

    } = useSidebar()

    return (

        <header
            className="
                sticky
                top-0
                z-50

                h-16

                border-b
                border-zinc-800

                bg-zinc-950/80

                backdrop-blur
            "
        >

            <div
                className="
                    flex
                    h-full
                    items-center
                    justify-between

                    gap-3

                    px-4
                    md:px-6
                "
            >

                {/* LEFT SIDE */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    {/* MOBILE SIDEBAR TOGGLE */}

                    <button
                        onClick={() =>

                            setMobileOpen(
                                !mobileOpen
                            )

                        }
                        className="
                            flex
                            h-10
                            w-10

                            items-center
                            justify-center

                            rounded-xl

                            border
                            border-white/5

                            bg-zinc-900/80

                            text-lg
                            text-white

                            transition-all

                            hover:border-violet-500/30
                            hover:bg-violet-500/10

                            md:hidden
                        "
                    ><div
                        className="
        relative

        flex
        h-5
        w-5

        flex-col
        items-center
        justify-center

        gap-1
    "
                    >

                            <span
                                className={`
            h-[2px]
            w-5

            rounded-full

            bg-white

            transition-all
            duration-300

            ${mobileOpen

                                        ? `
                    translate-y-[6px]
                    rotate-45
                `

                                        : ""
                                    }
        `}
                            />

                            <span
                                className={`
            h-[2px]
            w-4

            rounded-full

            bg-zinc-300

            transition-all
            duration-300

            ${mobileOpen

                                        ? `
                    opacity-0
                `

                                        : ""
                                    }
        `}
                            />

                            <span
                                className={`
            h-[2px]
            w-5

            rounded-full

            bg-white

            transition-all
            duration-300

            ${mobileOpen

                                        ? `
                    -translate-y-[6px]
                    -rotate-45
                `

                                        : ""
                                    }
        `}
                            />

                        </div>
                    </button>

                    {/* LOGO */}

                    <div
                        className="
        min-w-0
        text-base
        font-bold
        leading-tight
        text-white

        sm:text-lg
        md:text-xl
    "
                    >
                        <Link
                            href="/"
                            className="
            block
            truncate
        "
                        >
                            ROM Handbook Archive
                        </Link>
                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div
                    className="
        relative
        hidden

        md:block

        group
    "
                >

                    {/* TOOLTIP */}

                    <div
                        className="
                            pointer-events-none

                            absolute
                            right-0
                            top-full

                            z-50

                            mt-3

                            w-max

                            translate-y-1
                            opacity-0

                            transition-all
                            duration-300

                            group-hover:translate-y-0
                            group-hover:opacity-100

                            before:absolute
                            before:-top-1
                            before:right-6
                            before:h-2
                            before:w-2
                            before:rotate-45
                            before:bg-zinc-900
                        "
                    >

                        <div
                            className="
                                relative

                                rounded-2xl

                                border
                                border-amber-400/20

                                bg-zinc-900/95

                                px-4
                                py-3

                                shadow-2xl
                                shadow-black/50

                                backdrop-blur-xl
                            "
                        >

                            {/* GLOW */}

                            <div
                                className="
                                    pointer-events-none

                                    absolute
                                    inset-0

                                    rounded-2xl

                                    bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.08),transparent_60%)]
                                "
                            />

                            <div
                                className="
                                    relative
                                    z-10
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-medium

                                        text-amber-100
                                    "
                                >
                                    Support With Zeny
                                </p>

                                <p
                                    className="
                                        mt-1

                                        text-xs

                                        text-zinc-400
                                    "
                                >
                                    ROMC SEA : 5310144193
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* LINK */}

                    <a
                        href="https://galauit.com"
                        target="_blank"
                        className="
                            text-xs
                            text-zinc-400

                            transition-colors

                            hover:text-white

                            md:text-sm
                        "
                    >

                        <span
                            className="
                                flex
                                items-center
                                gap-1.5
                            "
                        >

                            <span>
                                Made with
                            </span>

                            <img
                                src={assetUrl("/assets/items/item_100-80252528704f2cc2b9aac6d5a2c57ed219277038faab8648dbb7d73bd33894ec.png")}
                                alt="Zeny"
                                className="
                                    h-4
                                    w-4

                                    object-contain

                                    opacity-80

                                    transition-all

                                    hover:opacity-100

                                    drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]
                                "
                            />

                            <span>
                                by galauit.com
                            </span>

                        </span>

                    </a>

                </div>

            </div>

        </header>

    )

}