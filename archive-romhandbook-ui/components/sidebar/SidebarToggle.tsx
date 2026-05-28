"use client"

import {
    ChevronLeft,
    ChevronRight
} from "lucide-react"

type Props = {

    collapsed: boolean

    onToggle: () => void

}

export default function SidebarToggle({

    collapsed,
    onToggle

}: Props) {

    return (

        <button
            onClick={onToggle}
            className="
        absolute

        left-full
        top-1/2

        z-50

        hidden
        h-12
        w-6

        md:flex

        -translate-x-1/2
        -translate-y-1/2

        items-center
        justify-center

        rounded-full

        border
        border-zinc-800

        bg-zinc-900

        text-zinc-400

        shadow-xl
        shadow-black/40

        transition-all

        hover:border-violet-500
        hover:text-white
    "
        >

            {collapsed

                ? (
                    <ChevronRight
                        size={16}
                    />
                )

                : (
                    <ChevronLeft
                        size={16}
                    />
                )

            }

        </button>

    )

}