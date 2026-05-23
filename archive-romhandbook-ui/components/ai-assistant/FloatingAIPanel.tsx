import { Sparkles, X } from "lucide-react"

import AIComingSoon from "./AIComingSoon"

type Props = {

    open: boolean

    onClose: () => void

}

export default function FloatingAIPanel({

    open,
    onClose

}: Props) {

    if (!open) {
        return null
    }

    return (

        <div
            className="
                fixed
                bottom-24
                right-6
                z-[9998]

                w-[380px]
                max-w-[calc(100vw-32px)]

                overflow-hidden

                rounded-3xl

                border
                border-zinc-800

                bg-black/95

                shadow-2xl
                shadow-violet-500/10

                backdrop-blur-xl
            "
        >

            {/* HEADER */}
            <div
                className="
                    flex
                    items-center
                    justify-between

                    border-b
                    border-zinc-800

                    px-5
                    py-4
                "
            >

                {/* LEFT */}
                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10

                            items-center
                            justify-center

                            rounded-2xl

                            bg-gradient-to-br
                            from-violet-500
                            to-fuchsia-500

                            text-white
                        "
                    >

                        <Sparkles size={18} />

                    </div>

                    <div>

                        <h2
                            className="
                                text-sm
                                font-semibold
                                text-white
                            "
                        >
                            AI Rune
                        </h2>

                        <p
                            className="
                                text-xs
                                text-zinc-500
                            "
                        >
                            ROM archive assistant
                        </p>

                    </div>

                </div>

                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="
                        rounded-xl

                        border
                        border-zinc-800

                        p-2

                        text-zinc-500

                        transition-all

                        hover:bg-zinc-900
                        hover:text-white
                    "
                >

                    <X size={16} />

                </button>

            </div>

            {/* BODY */}
            <div
                className="
                    max-h-[70vh]
                    overflow-y-auto

                    px-5
                    py-5
                "
            >

                <AIComingSoon />

            </div>

        </div>

    )

}