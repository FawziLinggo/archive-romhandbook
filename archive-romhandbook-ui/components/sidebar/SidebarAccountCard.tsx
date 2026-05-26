type Props = {

    collapsed: boolean

}

export default function SidebarAccountCard({

    collapsed

}: Props) {

    // =====================
    // COLLAPSED
    // =====================

    if (collapsed) {

        return (

            <div
                className="
                    px-3
                    pb-3

                    flex
                    justify-center
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
                    title="
Authentication system coming soon
                    "
                >
                    👤
                </button>

            </div>

        )

    }

    // =====================
    // EXPANDED
    // =====================

    return (

        <div
            className="
                px-3
                pb-3
            "
        >

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

        </div>

    )

}