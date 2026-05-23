import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark,
    oneLight
} from "react-syntax-highlighter/dist/esm/styles/prism"

type Props = {

    code: string

    wrap: boolean

    theme: "vsc" | "onedark"

}

export default function FormulaCode({

    code,
    wrap,
    theme

}: Props) {

    // =====================
    // THEME
    // =====================

    const isLight =
        theme === "vsc"

    const selectedTheme =
        isLight
            ? oneLight
            : oneDark

    return (

        <div
            className={`
                relative

                ${wrap

                    ? `
                        overflow-x-hidden
                    `

                    : `
                        ${isLight ? "bg-white" : "bg-[#050505]"}
                    `
                }
            `}
        >

            <SyntaxHighlighter

                language="lua"

                style={selectedTheme}

                showLineNumbers

                wrapLongLines={wrap}

                lineNumberStyle={{
                    color: isLight
                        ? "#a1a1aa"
                        : "#52525b",

                    minWidth: "3em",

                    paddingRight: "1.5rem",

                    userSelect: "none",
                }}

                customStyle={{

                    margin: 0,

                    padding: "2rem",

                    background: isLight
                        ? "#ffffff"
                        : "#050505",

                    color: isLight
                        ? "#18181b"
                        : "#ffffff",

                    fontSize: "14px",

                    lineHeight: "1.9",

                    minHeight: "700px",

                    width: "100%",

                    maxWidth: "100%",

                    overflowX: wrap
                        ? "hidden"
                        : "auto",

                    whiteSpace: wrap
                        ? "pre-wrap"
                        : "pre",

                    wordBreak: "normal",

                    overflowWrap: "normal",

                    borderTop: isLight
                        ? "1px solid #e4e4e7"
                        : "1px solid #27272a",
                }}

                codeTagProps={{

                    style: {

                        whiteSpace: wrap
                            ? "pre-wrap"
                            : "pre",

                        wordBreak: "normal",

                        overflowWrap: "normal",

                        fontFamily: `
                            JetBrains Mono,
                            Fira Code,
                            monospace
                        `,
                    }

                }}
            >

                {code}

            </SyntaxHighlighter>

        </div>

    )

}