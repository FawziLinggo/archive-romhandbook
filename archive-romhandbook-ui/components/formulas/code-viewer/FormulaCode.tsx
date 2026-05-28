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
                min-w-0
                max-w-full

                ${wrap

                    ? `
                        overflow-x-hidden
                    `

                    : `
                        overflow-x-auto
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
                    paddingRight: "1.25rem",
                    userSelect: "none",
                    textAlign: "right",
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
                    lineHeight: "1.85",
                    minHeight: "700px",

                    width: "100%",
                    maxWidth: "100%",

                    overflowX: wrap
                        ? "hidden"
                        : "auto",

                    whiteSpace: wrap
                        ? "pre-wrap"
                        : "pre",

                    wordBreak: wrap
                        ? "break-word"
                        : "normal",

                    overflowWrap: wrap
                        ? "anywhere"
                        : "normal",

                    borderTop: isLight
                        ? "1px solid #e4e4e7"
                        : "1px solid #27272a",
                }}
                codeTagProps={{
                    style: {
                        display: "block",
                        maxWidth: "100%",

                        whiteSpace: wrap
                            ? "pre-wrap"
                            : "pre",

                        wordBreak: wrap
                            ? "break-word"
                            : "normal",

                        overflowWrap: wrap
                            ? "anywhere"
                            : "normal",

                        fontFamily: `
                            JetBrains Mono,
                            Fira Code,
                            Consolas,
                            monospace
                        `,
                    }
                }}
                lineProps={{
                    style: {
                        display: "block",
                        maxWidth: "100%",

                        whiteSpace: wrap
                            ? "pre-wrap"
                            : "pre",

                        wordBreak: wrap
                            ? "break-word"
                            : "normal",

                        overflowWrap: wrap
                            ? "anywhere"
                            : "normal",
                    }
                }}
            >

                {code}

            </SyntaxHighlighter>

        </div>

    )

}