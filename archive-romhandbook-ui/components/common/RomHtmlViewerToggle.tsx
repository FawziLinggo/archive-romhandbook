"use client"

import { useState } from "react"

import RomHtmlViewer from "./RomHtmlViewer"

type Props = {
    html: string | null
}

export default function RomHtmlViewerToggle({
    html
}: Props) {

    const [open, setOpen] =
        useState(false)

    const hasHtml =
        Boolean(html)

    return (

        <div
            className="
                mt-8

                sm:mt-12
            "
        >

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-gradient-to-b
                    from-zinc-900
                    to-zinc-950
                    shadow-2xl
                    shadow-black/30

                    sm:rounded-3xl
                "
            >

                <div
                    className="
                        border-b
                        border-zinc-800
                        px-4
                        py-5

                        sm:px-8
                        sm:py-7
                    "
                >
                    <h2
                        className="
                            text-xl
                            font-bold
                            leading-tight
                            text-white

                            sm:text-2xl
                        "
                    >
                        ROM Handbook Snapshot
                    </h2>

                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-zinc-400

                            sm:text-base
                        "
                    >
                        Archived Original Page
                    </p>
                </div>

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        px-4
                        py-5

                        sm:px-8
                        sm:py-6

                        md:flex-row
                        md:items-center
                        md:justify-between
                    "
                >
                    <div
                        className="
                            text-sm
                            leading-6
                            text-zinc-500
                        "
                    >
                        {hasHtml
                            ? "Preserved HTML snapshot from ROM Handbook"
                            : "No original HTML snapshot archived for this entry"}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(!open)
                        }
                        disabled={!hasHtml}
                        className="
                            h-12
                            w-full
                            rounded-2xl
                            bg-violet-600
                            px-5
                            text-sm
                            font-semibold
                            text-white
                            shadow-lg
                            shadow-violet-500/20
                            transition-all

                            hover:bg-violet-500

                            disabled:cursor-not-allowed
                            disabled:bg-zinc-800
                            disabled:text-zinc-500
                            disabled:shadow-none

                            md:w-auto
                        "
                    >

                        {open
                            ? "Close Snapshot"
                            : "Open Snapshot"}

                    </button>
                </div>

                {open && hasHtml && (

                    <div
                        className="
                            min-w-0
                            overflow-hidden
                            border-t
                            border-zinc-800
                        "
                    >

                        {open && html && (

                            <div
                                className="
            min-w-0
            overflow-hidden
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

                )}

            </div>

        </div>

    )

}