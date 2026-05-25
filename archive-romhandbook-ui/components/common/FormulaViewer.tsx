"use client"

import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/esm/styles/prism"

type Props = {

    title?: string

    code: string

    language?: string
}

export default function FormulaViewer({

    title = "Formula",

    code,

    language = "json"

}: Props) {

    // =====================
    // EMPTY
    // =====================

    if (!code) {

        return null

    }

    // =====================
    // PARSE
    // =====================

    let formulas: any[] = []

    try {

        const parsed =
            JSON.parse(code)

        // ARRAY
        if (
            Array.isArray(parsed)
        ) {

            formulas =
                parsed.map((item) => {

                    // STRING JSON
                    if (
                        typeof item === "string"
                    ) {

                        try {

                            return JSON.parse(
                                item
                            )

                        } catch {

                            return item
                        }
                    }

                    return item

                })

        } else {

            formulas = [parsed]

        }

    } catch {

        formulas = [code]

    }

    // =====================
    // UI
    // =====================

    return (

        <div
            className="
                space-y-5
            "
        >

            {/* TITLE */}
            <h2
                className="
                    text-2xl
                    font-black
                    text-white
                "
            >
                {title}
            </h2>

            {/* FORMULAS */}
            <div
                className="
                    space-y-5
                "
            >

                {formulas.map(
                    (
                        formula,
                        index
                    ) => (

                        <div
                            key={index}
                            className="
                                overflow-hidden

                                rounded-3xl

                                border
                                border-zinc-800

                                bg-gradient-to-b
                                from-zinc-900
                                to-zinc-950

                                shadow-2xl
                                shadow-black/30
                            "
                        >

                            {/* HEADER */}
                            <div
                                className="
                                    border-b
                                    border-zinc-800

                                    bg-zinc-900/80

                                    px-5
                                    py-3

                                    text-sm
                                    text-zinc-400

                                    backdrop-blur
                                "
                            >
                                Formula #{index + 1}
                            </div>

                            {/* CODE */}
                            <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                wrapLongLines={true}
                                PreTag="div"
                                codeTagProps={{

                                    style: {

                                        whiteSpace:
                                            "pre-wrap",

                                        wordBreak:
                                            "break-word"
                                    }
                                }}
                                customStyle={{

                                    margin: 0,

                                    background:
                                        "transparent",

                                    fontSize:
                                        "13px",

                                    padding:
                                        "24px",

                                    overflowX:
                                        "auto",

                                    maxWidth:
                                        "100%"
                                }}
                            >

                                {typeof formula === "string"

                                    ? formula

                                    : JSON.stringify(
                                        formula,
                                        null,
                                        2
                                    )
                                }

                            </SyntaxHighlighter>

                        </div>

                    )
                )}

            </div>

        </div>

    )

}