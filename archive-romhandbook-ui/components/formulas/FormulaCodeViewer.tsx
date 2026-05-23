"use client"

import { useMemo, useState } from "react"

import {
    Check,
    Copy,
    Maximize2,
    Minimize2,
    Moon,
    Search,
    Sun,
    WrapText
} from "lucide-react"

import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark,
    vscDarkPlus
} from "react-syntax-highlighter/dist/esm/styles/prism"

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
        useState(false)

    const [collapsed, setCollapsed] =
        useState(false)

    const [search, setSearch] =
        useState("")

    const [theme, setTheme] =
        useState<"vsc" | "onedark">(
            "vsc"
        )

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

    // =====================
    // THEME
    // =====================

    const selectedTheme =
        theme === "vsc"
            ? vscDarkPlus
            : oneDark

    return (

        <div
            className="
                overflow-hidden
                rounded-3xl

                border
                border-zinc-800

                bg-zinc-950
            "
        >

            {/* HEADER */}
            <div
                className="
                    border-b
                    border-zinc-800
                    bg-zinc-950
                "
            >

                {/* TOP BAR */}
                <div
                    className="
                        flex
                        items-center
                        justify-between

                        px-5
                        py-4
                    "
                >

                    {/* LEFT */}
                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        {/* MAC DOTS */}
                        <div className="flex gap-2">

                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <div className="h-3 w-3 rounded-full bg-green-500" />

                        </div>

                        {/* FILE */}
                        <span
                            className="
                                text-sm
                                text-zinc-500
                            "
                        >
                            {filename}
                        </span>

                    </div>

                    {/* ACTIONS */}
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        {/* WRAP */}
                        <button
                            onClick={() =>
                                setWrap(!wrap)
                            }
                            className="
                                rounded-xl
                                border
                                border-zinc-800

                                p-2

                                text-zinc-400
                                hover:text-white
                                hover:bg-zinc-900

                                transition-all
                            "
                        >

                            <WrapText size={16} />

                        </button>

                        {/* THEME */}
                        <button
                            onClick={() =>
                                setTheme(
                                    theme === "vsc"
                                        ? "onedark"
                                        : "vsc"
                                )
                            }
                            className="
                                rounded-xl
                                border
                                border-zinc-800

                                p-2

                                text-zinc-400
                                hover:text-white
                                hover:bg-zinc-900

                                transition-all
                            "
                        >

                            {theme === "vsc"

                                ? <Moon size={16} />

                                : <Sun size={16} />
                            }

                        </button>

                        {/* COLLAPSE */}
                        <button
                            onClick={() =>
                                setCollapsed(
                                    !collapsed
                                )
                            }
                            className="
                                rounded-xl
                                border
                                border-zinc-800

                                p-2

                                text-zinc-400
                                hover:text-white
                                hover:bg-zinc-900

                                transition-all
                            "
                        >

                            {collapsed

                                ? <Maximize2 size={16} />

                                : <Minimize2 size={16} />
                            }

                        </button>

                        {/* COPY */}
                        <button
                            onClick={handleCopy}
                            className="
                                flex
                                items-center
                                gap-2

                                rounded-xl
                                border
                                border-zinc-800

                                px-3
                                py-2

                                text-sm
                                text-zinc-300

                                hover:bg-zinc-900
                                hover:text-white

                                transition-all
                            "
                        >

                            {copied

                                ? (
                                    <>
                                        <Check size={16} />
                                        Copied
                                    </>
                                )

                                : (
                                    <>
                                        <Copy size={16} />
                                        Copy
                                    </>
                                )
                            }

                        </button>

                    </div>

                </div>

                {/* SEARCH */}
                <div className="px-5 pb-4">

                    <div
                        className="
                            flex
                            items-center
                            gap-3

                            rounded-2xl

                            border
                            border-zinc-800

                            bg-black

                            px-4
                            py-3
                        "
                    >

                        <Search
                            size={18}
                            className="
                                text-zinc-500
                            "
                        />

                        <input
                            type="text"
                            placeholder="Search in code..."

                            value={search}

                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }

                            className="
                                w-full
                                bg-transparent

                                text-sm
                                text-white

                                outline-none

                                placeholder:text-zinc-600
                            "
                        />

                    </div>

                </div>

            </div>

            {/* CODE */}
            {!collapsed && (

                <div
                    className="
                        overflow-auto
                    "
                >

                    <SyntaxHighlighter
                        language="lua"
                        style={selectedTheme}

                        showLineNumbers

                        wrapLongLines={wrap}

                        customStyle={{
                            margin: 0,
                            padding: "2rem",
                            background: "#050505",
                            fontSize: "14px",
                            lineHeight: "1.9",
                            minHeight: "700px",
                        }}
                    >

                        {filteredCode}

                    </SyntaxHighlighter>

                </div>

            )}

        </div>

    )

}