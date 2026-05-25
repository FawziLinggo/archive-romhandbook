export default function RuneCircle() {

    return (

        <div
            className="
                pointer-events-none

                absolute
                inset-0

                overflow-hidden
            "
        >

            {/* BIG RUNE */}
            <div
                className="
                    absolute

                    right-[-120px]
                    top-[-120px]

                    h-[420px]
                    w-[420px]

                    rounded-full

                    border
                    border-violet-500/10

                    opacity-30

                    animate-rune-spin
                "
            >

                {/* OUTER */}
                <div
                    className="
                        absolute
                        inset-4

                        rounded-full

                        border
                        border-fuchsia-500/10
                    "
                />

                {/* INNER */}
                <div
                    className="
                        absolute
                        inset-10

                        rounded-full

                        border
                        border-cyan-500/10
                    "
                />

                {/* MAGIC LINES */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-0

                        h-full
                        w-px

                        -translate-x-1/2

                        bg-gradient-to-b
                        from-transparent
                        via-violet-400/30
                        to-transparent
                    "
                />

                <div
                    className="
                        absolute
                        top-1/2
                        left-0

                        h-px
                        w-full

                        -translate-y-1/2

                        bg-gradient-to-r
                        from-transparent
                        via-fuchsia-400/30
                        to-transparent
                    "
                />

                {/* CENTER */}
                <div
                    className="
                        absolute

                        left-1/2
                        top-1/2

                        h-10
                        w-10

                        -translate-x-1/2
                        -translate-y-1/2

                        rounded-full

                        border
                        border-cyan-400/20

                        bg-cyan-400/10

                        blur-[1px]
                    "
                />

            </div>

            {/* SMALL RUNE */}
            <div
                className="
                    absolute

                    bottom-[-80px]
                    left-[-80px]

                    h-[260px]
                    w-[260px]

                    rounded-full

                    border
                    border-cyan-500/10

                    opacity-20

                    animate-rune-spin-reverse
                "
            >

                <div
                    className="
                        absolute
                        inset-5

                        rounded-full

                        border
                        border-violet-500/10
                    "
                />

                <div
                    className="
                        absolute

                        left-1/2
                        top-1/2

                        h-6
                        w-6

                        -translate-x-1/2
                        -translate-y-1/2

                        rounded-full

                        bg-violet-400/20
                    "
                />

            </div>

        </div>

    )

}