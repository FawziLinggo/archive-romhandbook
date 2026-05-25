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

                    h-[500px]
                    w-[500px]

                    -translate-x-1/2
                    -translate-y-1/2

                    rounded-full

                    bg-violet-500/10

                    blur-3xl
                "
            />

            {/* CONTENT */}
            <div
                className="
                    relative
                    z-10

                    mx-auto
                    max-w-2xl

                    rounded-[32px]

                    border
                    border-violet-500/20

                    bg-gradient-to-b
                    from-zinc-900
                    to-black

                    px-10
                    py-16

                    text-center

                    shadow-2xl
                    shadow-violet-950/30
                "
            >

                {/* ICON */}
                <div
                    className="
                        mb-6

                        text-7xl
                    "
                >
                    ✦
                </div>

                {/* 404 */}
                <h1
                    className="
                        text-6xl
                        font-black
                        tracking-tight
                        text-white
                    "
                >
                    404
                </h1>

                {/* TITLE */}
                <h2
                    className="
                        mt-4

                        text-3xl
                        font-bold

                        text-violet-300
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

                        text-lg
                        leading-8

                        text-zinc-400
                    "
                >
                    The portal you entered does not exist anymore.
                    Maybe the Kafra sent you to the wrong map.
                </p>

                {/* BUTTON */}
                <div
                    className="
                        mt-10
                    "
                >

                    <WarpTransition href="/"
                        className="
        group
        relative

        inline-flex
        items-center
        justify-center

        overflow-hidden

        rounded-[28px]

        px-10
        py-5

        min-w-[260px]

        font-bold
        text-white

        transition-all
        duration-500

        hover:scale-105
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