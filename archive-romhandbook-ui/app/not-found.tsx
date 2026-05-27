import FloatingPorings from "@/components/effects/FloatingPorings"
import RuneCircle from "@/components/effects/RuneCircle"
import WarpTransition from "@/components/effects/WarpTransition"

export default function NotFound() {

    return (

        <div
            className="
                fixed
                inset-0
                z-[9999]

                flex
                items-center
                justify-center

                overflow-hidden

                bg-black
            "
        >

            <FloatingPorings />

            {/* BG */}

            <div
                className="
                    absolute
                    inset-0

                    bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_40%)]

                    opacity-80
                "
            />

            {/* GLOW */}

            <div
                className="
                    absolute

                    left-1/2
                    top-1/2

                    h-[280px]
                    w-[280px]

                    -translate-x-1/2
                    -translate-y-1/2

                    rounded-full

                    bg-violet-500/10

                    blur-3xl

                    md:h-[500px]
                    md:w-[500px]
                "
            />

            {/* CONTENT */}

            <div
                className="
                    relative
                    z-10

                    mx-4
                    w-full
                    max-w-2xl

                    rounded-[28px]

                    border
                    border-violet-500/20

                    bg-gradient-to-b
                    from-zinc-900
                    to-black

                    px-6
                    py-10

                    text-center

                    shadow-2xl
                    shadow-violet-950/30

                    md:px-10
                    md:py-16
                "
            >

                {/* ICON */}

                <div
                    className="
                        mb-6

                        text-5xl

                        md:text-7xl
                    "
                >
                    ✦
                </div>

                {/* 404 */}

                <h1
                    className="
                        text-5xl
                        font-black
                        tracking-tight
                        text-white

                        md:text-6xl
                    "
                >
                    404
                </h1>

                {/* TITLE */}

                <h2
                    className="
                        mt-4

                        text-2xl
                        font-bold

                        text-violet-300

                        md:text-3xl
                    "
                >
                    Lost in Midgard
                </h2>

                {/* DESC */}

                <p
                    className="
                        mx-auto
                        mt-6
                        max-w-xl

                        text-base
                        leading-7

                        text-zinc-400

                        md:text-lg
                        md:leading-8
                    "
                >
                    The portal you entered does not exist anymore.
                    Maybe the Kafra sent you to the wrong map.
                </p>

                {/* BUTTON */}

                <div
                    className="
                        mt-8

                        md:mt-10
                    "
                >

                    <WarpTransition
                        href="/"
                        className="
                            group
                            relative

                            inline-flex
                            w-full
                            max-w-[280px]

                            items-center
                            justify-center

                            overflow-hidden

                            rounded-[28px]

                            px-6
                            py-4

                            text-sm
                            font-bold

                            text-white

                            transition-all
                            duration-500

                            hover:scale-105

                            md:min-w-[260px]

                            md:px-10
                            md:py-5

                            md:text-base
                        "
                    >

                        {/* PORTAL BG */}

                        <div
                            className="
                                absolute
                                inset-0

                                rounded-2xl

                                bg-gradient-to-r
                                from-violet-600
                                via-fuchsia-500
                                to-cyan-500

                                opacity-90
                            "
                        />

                        {/* SWIRL */}

                        <div
                            className="
                                absolute

                                inset-[-120%]

                                animate-portal-spin

                                bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.35),transparent)]

                                opacity-70

                                group-hover:opacity-100
                            "
                        />

                        {/* INNER DARK */}

                        <div
                            className="
                                absolute
                                inset-[2px]

                                rounded-2xl

                                bg-black/70
                                backdrop-blur-xl
                            "
                        />

                        {/* GLOW */}

                        <div
                            className="
                                absolute
                                inset-0

                                rounded-2xl

                                bg-violet-500/20

                                blur-xl

                                transition-all
                                duration-500

                                group-hover:bg-cyan-500/30
                            "
                        />

                        {/* TEXT */}

                        <span
                            className="
                                relative
                                z-10

                                tracking-wide
                            "
                        >
                            Return to Home
                        </span>

                    </WarpTransition>

                    <RuneCircle />

                </div>

            </div>

        </div>

    )

}