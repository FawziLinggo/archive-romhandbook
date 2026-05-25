"use client"

import { useRouter } from "next/navigation"
import {
    useState
} from "react"

type Props = {

    href: string

    children: React.ReactNode

    className?: string
}

export default function WarpTransition({

    href,
    children,
    className

}: Props) {

    const router =
        useRouter()

    const [
        active,
        setActive
    ] = useState(false)

    // =========================
    // HANDLE CLICK
    // =========================

    function handleWarp() {

        setActive(true)

        setTimeout(() => {

            router.push(href)

        }, 1400)

    }

    // =========================
    // RENDER
    // =========================

    return (

        <>

            <button
                onClick={handleWarp}
                className={`
        relative
        overflow-hidden

        rounded-[24px]

        ${className || ""}
    `}
            >
                {children}
            </button>

            {/* WARP OVERLAY */}
            {active && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[9999]

                        flex
                        items-center
                        justify-center

                        bg-black

                        animate-warp-fade
                    "
                >

                    {/* BLACK HOLE */}
                    <div
                        className="
                            absolute

                            h-24
                            w-24

                            rounded-full

                            bg-black

                            shadow-[0_0_120px_rgba(139,92,246,0.9)]

                            animate-black-hole
                        "
                    />

                    {/* PORTAL */}
                    <div
                        className="
                            absolute

                            h-40
                            w-40

                            rounded-full

                            border-[10px]
                            border-violet-500/50

                            animate-portal-expand
                        "
                    />

                    {/* RUNE */}
                    <div
                        className="
                            absolute

                            h-60
                            w-60

                            rounded-full

                            border
                            border-cyan-400/20

                            animate-rune-spin
                        "
                    />

                </div>

            )}

        </>

    )

}