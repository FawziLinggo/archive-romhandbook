"use client"

import { useMemo, useState } from "react"

import Link from "next/link"

import { Formula } from "@/lib/types/Formula"

type Props = {
    formulas: Formula[]
}

function getPreview(
    code: string
) {

    return code
        .split("\n")
        .slice(0, 5)
        .join("\n")

}

function getLineCount(
    code: string
) {

    return code
        .split("\n")
        .length

}

export default function FormulaExplorer({
    formulas
}: Props) {

    const [search, setSearch] =
        useState("")

    // =====================
    // FILTER
    // =====================

    const filtered =
        useMemo(() => {

            if (!search)
                return formulas

            return formulas.filter(
                (formula) => {

                    const q =
                        search.toLowerCase()

                    return (

                        formula.name
                            .toLowerCase()
                            .includes(q)

                        ||

                        formula.formula_code
                            .toLowerCase()
                            .includes(q)

                    )

                }
            )

        }, [

            formulas,
            search

        ])

    return (

        <div>

            {/* SEARCH */}
            <div
                className="
                    sticky
                    top-0
                    z-20
                    bg-black/80
                    backdrop-blur-xl
                    pb-6
                "
            >

                <div
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        overflow-hidden
                    "
                >


                </div>


            </div>

            {/* GRID */}
            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-6
                    mt-6
                "
            >

                {filtered.map(
                    (formula) => (

                        <Link
                            key={formula.id}
                            href={`/formulas/${formula.id}`}
                        >

                            <div
                                className="
                                    rounded-3xl
                                    border
                                    border-zinc-800
                                    bg-gradient-to-br
                                    from-zinc-950
                                    to-zinc-900
                                    overflow-hidden

                                    hover:border-violet-500/40
                                    hover:-translate-y-1
                                    hover:shadow-2xl
                                    hover:shadow-violet-500/10

                                    transition-all
                                    duration-300
                                "
                            >

                                {/* HEADER */}
                                <div
                                    className="
                                        p-5
                                        border-b
                                        border-zinc-800
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        "
                                    >

                                        <div>

                                            <h2
                                                className="
                                                    text-xl
                                                    font-bold
                                                    text-emerald-300
                                                    break-all
                                                "
                                            >
                                                {formula.name}
                                            </h2>

                                        </div>

                                        {/* BADGE */}
                                        <div
                                            className="
                                                shrink-0
                                                px-3
                                                py-1
                                                rounded-full
                                                bg-violet-500/20
                                                text-violet-300
                                                text-xs
                                            "
                                        >
                                            Lua
                                        </div>

                                    </div>

                                </div>

                                {/* PREVIEW */}
                                <div className="p-5">

                                    <pre
                                        className="
                                            text-sm
                                            leading-7
                                            text-zinc-300
                                            font-mono
                                            whitespace-pre-wrap
                                            break-words
                                            overflow-hidden
                                        "
                                    >
                                        {getPreview(
                                            formula.formula_code
                                        )}
                                    </pre>

                                </div>

                                {/* FOOTER */}
                                <div
                                    className="
                                        px-5
                                        py-4
                                        border-t
                                        border-zinc-800

                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <span
                                            className="
                                                text-xs
                                                text-zinc-500
                                            "
                                        >
                                            {
                                                getLineCount(
                                                    formula.formula_code
                                                )
                                            }
                                            {" "}
                                            lines
                                        </span>

                                    </div>

                                    <span
                                        className="
                                            text-violet-400
                                            text-sm
                                        "
                                    >
                                        View Formula →
                                    </span>

                                </div>

                            </div>

                        </Link>

                    )
                )}

            </div>

        </div>

    )

}