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
                bottom-6
                right-6
                z-[9999]

                flex
                items-center
                gap-3

                rounded-2xl

                border
                border-violet-500/30

                bg-gradient-to-r
                from-violet-500
                to-fuchsia-500

                px-5
                py-4

                text-white

                shadow-2xl
                shadow-violet-500/20

                transition-all
                duration-300

                hover:scale-[1.03]
                hover:shadow-violet-500/40
            "
        >

            {/* ICON */}
            <Sparkles size={18} />

            {/* TEXT */}
            <div
                className="
                    flex
                    flex-col
                    items-start
                "
            >

                <span
                    className="
                        text-sm
                        font-semibold
                        leading-none
                    "
                >
                    AI Rune
                </span>

                {/* <span
                    className="
                        mt-1

                        text-[11px]
                        text-white/70
                    "
                >
                    Coming Soon
                </span> */}

            </div>

            {/* STATUS DOT */}
            <div
                className={`
                    h-2
                    w-2
                    rounded-full

                    bg-white/80

                    transition-all

                    ${open
                        ? "scale-125"
                        : "animate-pulse"
                    }
                `}
            />

        </button>

    )

}