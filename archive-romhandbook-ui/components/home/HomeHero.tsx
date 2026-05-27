"use client"

import {
    Search
} from "lucide-react"

export default function HomeHero() {

    return (

        <section
            className="
                relative
                overflow-hidden

                rounded-[28px]

                border
                border-zinc-800

                bg-gradient-to-b
                from-zinc-950
                to-black

                px-5
                py-14

                text-center

                md:rounded-[32px]
                md:px-8
                md:py-24
            "
        >

            {/* GLOW */}

            <div
                className="
                    pointer-events-none

                    absolute
                    inset-0

                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute

                        left-1/2
                        top-[-80px]

                        h-[220px]
                        w-[220px]

                        -translate-x-1/2

                        rounded-full

                        bg-violet-600/20

                        blur-3xl

                        animate-pulse

                        md:top-[-120px]

                        md:h-[320px]
                        md:w-[320px]
                    "
                />

                <div
                    className="
                        absolute

                        bottom-[-80px]
                        right-[5%]

                        h-[180px]
                        w-[180px]

                        rounded-full

                        bg-emerald-500/10

                        blur-3xl

                        md:bottom-[-100px]

                        md:h-[240px]
                        md:w-[240px]
                    "
                />

            </div>

            {/* CONTENT */}

            <div
                className="
                    relative
                    z-10

                    mx-auto
                    max-w-4xl
                "
            >

                {/* BADGE */}

                <div
                    className="
                        mb-5

                        inline-flex
                        items-center
                        gap-2

                        rounded-full

                        border
                        border-violet-500/30

                        bg-violet-500/10

                        px-4
                        py-2

                        text-xs
                        text-violet-300

                        md:mb-6
                        md:text-sm
                    "
                >

                    ✦ Archived ROM Database

                </div>

                {/* TITLE */}

                <h1
                    className="
                        text-5xl
                        font-black

                        leading-none
                        tracking-tight

                        text-white

                        md:text-7xl
                    "
                >

                    ROM
                    <br />

                    Handbook
                    <br />

                    <span
                        className="
                            text-violet-400
                        "
                    >
                        Archive
                    </span>

                </h1>

                {/* DESCRIPTION */}

                <p
                    className="
                        mx-auto
                        mt-6

                        max-w-xl

                        text-base
                        leading-9

                        text-zinc-400

                        md:mt-6

                        md:max-w-2xl

                        md:text-xl
                        md:leading-relaxed
                    "
                >

                    Preserving ROMHandbook's:
                    Classic data before shutdown.

                    Browse cards, monsters,
                    formulas, skills, and hidden
                    internal game data.

                </p>

                {/* SEARCH */}

                <div
                    className="
                        mx-auto
                        mt-8

                        max-w-2xl

                        md:mt-10
                    "
                >

                    <form
                        action="/cards"
                        className="
                            relative
                        "
                    >

                        <Search
                            size={18}
                            className="
                                absolute

                                left-4
                                top-1/2

                                -translate-y-1/2

                                text-zinc-500

                                md:left-5
                                md:size-[22px]
                            "
                        />

                        <input
                            type="text"
                            name="q"
                            placeholder="
Search cards, monsters, skills...
                            "
                            className="
                                w-full

                                rounded-2xl

                                border
                                border-zinc-700

                                bg-zinc-900/80

                                px-12
                                py-4

                                text-base
                                text-white

                                outline-none

                                transition-all

                                focus:border-violet-500
                                focus:ring-4
                                focus:ring-violet-500/20

                                md:rounded-3xl

                                md:px-14
                                md:py-5

                                md:text-lg
                            "
                        />

                    </form>

                </div>

                {/* STATS */}

                <div
                    className="
                        mt-8

                        flex
                        flex-col
                        items-center
                        justify-center

                        gap-2

                        text-xs
                        text-zinc-500

                        md:mt-10

                        md:flex-row
                        md:gap-8

                        md:text-sm
                    "
                >

                    <span>
                        18,000+ archived entries
                    </span>

                    <span>
                        Last snapshot:
                        May 2026
                    </span>

                </div>

            </div>

        </section>

    )

}