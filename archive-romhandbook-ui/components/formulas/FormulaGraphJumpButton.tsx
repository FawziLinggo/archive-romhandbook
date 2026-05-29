"use client"

import {
    Network
} from "lucide-react"

type Props = {
    targetId?: string
}

export default function FormulaGraphJumpButton({
    targetId = "formula-graph"
}: Props) {
    function handleClick() {
        const target =
            document.getElementById(targetId)

        if (!target) {
            return
        }

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        })

        window.history.replaceState(
            null,
            "",
            `#${targetId}`
        )
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-violet-500/40
                bg-violet-500/10
                px-4
                py-3
                text-sm
                font-bold
                text-violet-100
                transition-colors
                hover:border-violet-400
                hover:bg-violet-500/20
                sm:w-fit
            "
        >
            <Network size={18} />
            View Graph
        </button>
    )
}