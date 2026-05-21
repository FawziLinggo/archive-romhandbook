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

                rounded-[32px]

                border
                border-zinc-800

                bg-gradient-to-b
                from-zinc-950
                to-black

                px-8
                py-24

                text-center
            "
        >

            {/* GLOW */}
            <div
                className="
                    absolute
                    inset-0
                    overflow-hidden
                    pointer-events-none
                "
            >

                <div
                    className="
                        absolute
                        top-[-120px]
                        left-1/2
                        -translate-x-1/2

                        h-[320px]
                        w-[320px]

                        rounded-full

                        bg-violet-600/20

                        blur-3xl

                        animate-pulse
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-100px]
                        right-[10%]

                        h-[240px]
                        w-[240px]

                        rounded-full

                        bg-emerald-500/10

                        blur-3xl
                    "
                />

            </div>

            {/* CONTENT */}
            <div
                className="
                    relative
                    z-10
                    max-w-4xl
                    mx-auto
                "
            >

                {/* BADGE */}
                <div
                    className="
                        inline-flex
                        items-center
                        gap-2

                        rounded-full

                        border
                        border-violet-500/30

                        bg-violet-500/10

                        px-4
                        py-2

                        text-sm
                        text-violet-300

                        mb-6
                    "
                >

                    ✦ Archived ROM Database

                </div>

                {/* TITLE */}
                <h1
                    className="
                        text-5xl
                        md:text-7xl

                        font-black

                        tracking-tight

                        text-white
                    "
                >

                    ROM Handbook
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
                        mt-6

                        text-lg
                        md:text-xl

                        text-zinc-400

                        max-w-2xl
                        mx-auto

                        leading-relaxed
                    "
                >

                    Preserving Ragnarok Online M:
                    Classic data before shutdown.

                    Browse cards, monsters,
                    formulas, skills, and hidden
                    internal game data.

                </p>

                {/* SEARCH */}
                <div
                    className="
                        mt-10

                        max-w-2xl
                        mx-auto
                    "
                >

                    <form
                        action="/cards"
                        className="
                            relative
                        "
                    >

                        <Search
                            size={22}
                            className="
                                absolute
                                left-5
                                top-1/2
                                -translate-y-1/2

                                text-zinc-500
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

                                rounded-3xl

                                border
                                border-zinc-700

                                bg-zinc-900/80
                                backdrop-blur

                                px-14
                                py-5

                                text-lg
                                text-white

                                outline-none

                                focus:border-violet-500
                                focus:ring-4
                                focus:ring-violet-500/20

                                transition-all
                            "
                        />

                    </form>

                </div>

                {/* STATS */}
                <div
                    className="
                        mt-10

                        flex
                        items-center
                        justify-center
                        gap-8

                        flex-wrap

                        text-sm
                        text-zinc-500
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