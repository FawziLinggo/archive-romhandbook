"use client"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import FormulaCode from "./FormulaCode"
import FormulaSearch from "./FormulaSearch"
import FormulaToolbar from "./FormulaToolbar"

type Props = {

    code: string

    filename?: string

}

export default function FormulaCodeViewer({

    code,
    filename = "formula.lua"

}: Props) {

    // =====================
    // STATES
    // =====================

    const [copied, setCopied] =
        useState(false)

    const [wrap, setWrap] =
        useState(true)

    const [collapsed, setCollapsed] =
        useState(false)

    const [search, setSearch] =
        useState("")

    const [theme, setTheme] =
        useState<"vsc" | "onedark">(
            "onedark"
        )

    const [fullscreen, setFullscreen] =
        useState(false)

    const [aiOpen, setAiOpen] =
        useState(false)

    // =====================
    // THEME
    // =====================

    const isLight =
        theme === "vsc"

    // =====================
    // FULLSCREEN BODY LOCK
    // =====================

    useEffect(() => {

        if (fullscreen) {

            document.body.style.overflow =
                "hidden"

        } else {

            document.body.style.overflow =
                "auto"

        }

        return () => {

            document.body.style.overflow =
                "auto"

        }

    }, [fullscreen])

    // =====================
    // COPY
    // =====================

    async function handleCopy() {

        await navigator.clipboard.writeText(
            code
        )

        setCopied(true)

        setTimeout(() => {

            setCopied(false)

        }, 1500)

    }

    // =====================
    // FILTERED CODE
    // =====================

    const filteredCode =
        useMemo(() => {

            if (!search.trim()) {
                return code
            }

            return code
                .split("\n")
                .filter((line) =>
                    line
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
                )
                .join("\n")

        }, [code, search])

    return (

        <div
            className={`

                overflow-hidden

                rounded-2xl
                border

                transition-all

                ${isLight

                    ? `
                        border-zinc-200
                        bg-white
                    `

                    : `
                        border-zinc-800
                        bg-[#050505]
                    `
                }

                ${fullscreen

                    ? `
                        fixed
                        inset-0
                        z-[9999]

                        rounded-none

                        overflow-y-auto
                    `

                    : ""
                }
            `}
        >

            {/* HEADER */}
            <div
                className={`
                    border-b

                    ${isLight

                        ? `
                            border-zinc-200
                            bg-zinc-50
                        `

                        : `
                            border-zinc-800
                            bg-zinc-950
                        `
                    }
                `}
            >

                <FormulaToolbar

                    aiOpen={aiOpen}

                    onToggleAI={() =>
                        setAiOpen(!aiOpen)
                    }
                    filename={filename}

                    copied={copied}

                    wrap={wrap}

                    collapsed={collapsed}

                    theme={theme}

                    fullscreen={fullscreen}

                    isLight={isLight}

                    onCopy={handleCopy}

                    onToggleWrap={() =>
                        setWrap(!wrap)
                    }

                    onToggleTheme={() =>
                        setTheme(
                            theme === "vsc"
                                ? "onedark"
                                : "vsc"
                        )
                    }

                    onToggleCollapse={() =>
                        setCollapsed(
                            !collapsed
                        )
                    }

                    onToggleFullscreen={() =>
                        setFullscreen(
                            !fullscreen
                        )
                    }
                />

                <FormulaSearch

                    value={search}

                    isLight={isLight}

                    onChange={setSearch}

                />

            </div>

            {/* CONTENT */}
            <div
                className={`
        flex

        ${fullscreen
                        ? "min-h-screen"
                        : ""
                    }
    `}
            >

                {/* CODE */}
                <div
                    className={`
            transition-all
            duration-300

            ${aiOpen

                            ? "w-[70%]"

                            : "w-full"
                        }
        `}
                >

                    <FormulaCode

                        code={filteredCode}

                        wrap={wrap}

                        theme={theme}

                    />

                </div>

                {/* AI PANEL */}
                {aiOpen && (

                    <div
                        className={`
            w-[30%]

            border-l

            p-6

            transition-all

            ${isLight

                                ? `
                    border-zinc-200
                    bg-zinc-50
                `

                                : `
                    border-zinc-800
                    bg-[#050505]
                `
                            }
        `}
                    >

                        {/* HEADER */}
                        <div
                            className="
                flex
                items-center
                gap-3
            "
                        >

                            {/* ICON */}
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

                                ✨

                            </div>

                            {/* TITLE */}
                            <div>

                                <h3
                                    className={`
                        font-bold

                        ${isLight
                                            ? "text-zinc-900"
                                            : "text-white"
                                        }
                    `}
                                >

                                    AI RUNE

                                </h3>

                                <p
                                    className={`
                        text-sm

                        ${isLight
                                            ? "text-zinc-500"
                                            : "text-zinc-400"
                                        }
                    `}
                                >

                                    AI assistant preview

                                </p>

                            </div>

                        </div>

                        {/* CONTENT */}
                        <div className="mt-8">

                            {/* FEATURE BOX */}
                            <div
                                className={`
                    rounded-2xl
                    border
                    p-5

                    ${isLight

                                        ? `
                            border-violet-200
                            bg-violet-50
                        `

                                        : `
                            border-violet-500/20
                            bg-violet-500/5
                        `
                                    }
                `}
                            >

                                <p
                                    className={`
                        text-sm
                        leading-7

                        ${isLight
                                            ? "text-zinc-700"
                                            : "text-zinc-300"
                                        }
                    `}
                                >

                                    Future AI assistant for:

                                </p>

                                <ul
                                    className={`
                        mt-4
                        space-y-3

                        text-sm

                        ${isLight
                                            ? "text-zinc-600"
                                            : "text-zinc-400"
                                        }
                    `}
                                >

                                    <li>
                                        • Formula explanation
                                    </li>

                                    <li>
                                        • Damage breakdown
                                    </li>

                                    <li>
                                        • Buff interaction analysis
                                    </li>

                                    <li>
                                        • Hidden mechanic discovery
                                    </li>

                                    <li>
                                        • Lua code interpretation
                                    </li>

                                </ul>

                            </div>

                            {/* INPUT */}
                            <div className="mt-6">

                                <div
                                    className={`
                        rounded-2xl
                        border

                        px-4
                        py-4

                        text-sm

                        ${isLight

                                            ? `
                                bg-white
                                border-zinc-200
                                text-zinc-500
                            `

                                            : `
                                bg-black
                                border-zinc-800
                                text-zinc-600
                            `
                                        }
                    `}
                                >

                                    Rune, explain this code to me! or ... ask anything about the formula!

                                </div>

                            </div>

                            {/* STATUS */}
                            <div
                                className={`
                    mt-4
                    text-xs

                    ${isLight
                                        ? "text-zinc-500"
                                        : "text-zinc-600"
                                    }
                `}
                            >

                                AI features are currently in development.

                            </div>

                        </div>

                    </div>

                )}
            </div>

        </div >

    )

}