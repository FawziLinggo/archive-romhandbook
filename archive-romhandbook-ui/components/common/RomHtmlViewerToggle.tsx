"use client"

import { useState } from "react"

import RomHtmlViewer from "./RomHtmlViewer"

type Props = {
    html: string
}

export default function RomHtmlViewerToggle({
    html
}: Props) {

    const [open, setOpen] =
        useState(false)

    return (

        <div className="mt-12">

            {/* CONTAINER */}
            <div
                className="
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-gradient-to-b
                    from-zinc-900
                    to-zinc-950
                    overflow-hidden
                    shadow-2xl
                    shadow-black/30
                "
            >

                {/* HEADER */}
                <div
                    className="
                        px-8
                        py-7
                        border-b
                        border-zinc-800
                    "
                >

                    {/* TITLE */}
                    <h2
                        className="
                            text-2xl
                            font-bold
                            text-white
                        "
                    >
                        ROM Handbook Snapshot
                    </h2>

                    {/* SUBTITLE */}
                    <p
                        className="
                            text-zinc-400
                            mt-2
                        "
                    >
                        Archived Original Page
                    </p>

                </div>

                {/* ACTION */}
                <div
                    className="
                        px-8
                        py-6
                        flex
                        items-center
                        justify-between
                        gap-4
                        flex-wrap
                    "
                >

                    <div
                        className="
                            text-sm
                            text-zinc-500
                        "
                    >
                        Preserved HTML snapshot from ROM Handbook
                    </div>

                    <button
                        onClick={() =>
                            setOpen(!open)
                        }
                        className="
                            px-5
                            py-3
                            rounded-2xl
                            bg-violet-600
                            hover:bg-violet-500
                            text-white
                            font-medium
                            transition-all
                            shadow-lg
                            shadow-violet-500/20
                        "
                    >

                        {open
                            ? "Close Snapshot"
                            : "Open Snapshot"}

                    </button>

                </div>

                {/* VIEWER */}
                {open && (

                    <div
                        className="
                            border-t
                            border-zinc-800
                        "
                    >

                        <RomHtmlViewer
                            html={html}
                        />

                    </div>

                )}

            </div>

        </div>

    )

}