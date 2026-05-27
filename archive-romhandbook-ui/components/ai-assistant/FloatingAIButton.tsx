import { Sparkles } from "lucide-react"

type Props = {

    open: boolean

    onClick: () => void

}

export default function FloatingAIButton({

    open,
    onClick

}: Props) {

    return (

        <button
            onClick={onClick}
            className="
                fixed

                bottom-4
                right-4

                z-[9999]

                flex
                items-center
                justify-center
                gap-3

                overflow-hidden

                rounded-2xl

                border
                border-violet-500/30

                bg-gradient-to-r
                from-violet-500
                to-fuchsia-500

                text-white

                shadow-2xl
                shadow-violet-500/20

                transition-all
                duration-300

                hover:scale-[1.03]
                hover:shadow-violet-500/40

                h-14
                w-14

                md:h-16
                md:w-auto

                md:px-6
                md:py-4

                md:bottom-6
                md:right-6

                before:absolute
                before:inset-0

                before:rounded-2xl

                before:bg-white/10

                before:opacity-0

                before:transition-opacity

                hover:before:opacity-100
            "
        >

            {/* CONTENT */}

            <div
                className="
                    relative
                    z-10

                    flex
                    items-center
                    gap-3
                "
            >

                {/* ICON */}

                <Sparkles
                    size={20}
                    className="
                        md:size-6
                    "
                />

                {/* DESKTOP TEXT */}

                <div
                    className="
                        hidden

                        md:flex
                        md:flex-col
                        md:items-start
                    "
                >

                    <span
                        className="
                            text-base
                            font-semibold
                            leading-none
                        "
                    >
                        AI Rune
                    </span>

                </div>

                {/* STATUS DOT */}

                <div
                    className={`
                        hidden

                        md:block

                        h-2.5
                        w-2.5

                        rounded-full

                        bg-white/80

                        transition-all

                        ${open
                            ? "scale-125"
                            : "animate-pulse"
                        }
                    `}
                />

            </div>

        </button>

    )

}