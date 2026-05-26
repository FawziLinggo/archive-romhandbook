
export default function Navbar() {

    return (

        <header
            className="
                h-16
                border-b
                border-zinc-800
                bg-zinc-950/80
                backdrop-blur
                sticky
                top-0
                z-50
            "
        >

            <div
                className="
                    h-full
                    px-6
                    flex
                    items-center
                    justify-between
                "
            >

                {/* LOGO */}
                <div
                    className="
                        text-xl
                        font-bold
                        text-white
                    "
                >
                    <a href="/">ROM Handbook Archive</a>
                </div>

                {/* GITHUB */}
                <div
                    className="
        relative
        group
    "
                >

                    {/* TOOLTIP */}

                    <div
                        className="
            pointer-events-none

            absolute

            top-full
            right-0

            mb-3

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
            text-sm
            text-zinc-400

            hover:text-white

            transition-colors
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
                                src="/assets/items/item_100-80252528704f2cc2b9aac6d5a2c57ed219277038faab8648dbb7d73bd33894ec.png"
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