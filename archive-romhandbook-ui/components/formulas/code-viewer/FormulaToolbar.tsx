import FormulaActions from "./FormulaActions"

type Props = {

    filename: string

    copied: boolean

    wrap: boolean

    collapsed: boolean

    theme: "vsc" | "onedark"

    fullscreen: boolean

    isLight: boolean

    onCopy: () => void

    onToggleWrap: () => void

    onToggleTheme: () => void

    onToggleCollapse: () => void

    onToggleFullscreen: () => void

    aiOpen: boolean

    onToggleAI: () => void

}

export default function FormulaToolbar({

    filename,

    copied,

    wrap,

    collapsed,

    theme,

    fullscreen,

    isLight,

    onCopy,

    onToggleWrap,

    onToggleTheme,

    onToggleCollapse,

    onToggleFullscreen,
    aiOpen,

    onToggleAI

}: Props) {

    return (

        <div
            className="
        flex
        min-w-0
        flex-col
        gap-3
        px-4
        py-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-5
    "
        >

            {/* LEFT */}
            <div
                className="
        flex
        min-w-0
        items-center
        gap-4
    "
            >

                {/* WINDOW DOTS */}
                <div className="flex gap-2">

                    <div
                        className="
                            h-3
                            w-3
                            rounded-full
                            bg-red-500
                        "
                    />

                    <div
                        className="
                            h-3
                            w-3
                            rounded-full
                            bg-yellow-500
                        "
                    />

                    <div
                        className="
                            h-3
                            w-3
                            rounded-full
                            bg-green-500
                        "
                    />

                </div>

                {/* FILE NAME */}
                <span
                    className={`
                        min-w-0
                        truncate
                        text-sm

                        ${isLight

                            ? `
                                text-zinc-600
                            `

                            : `
                                text-zinc-500
                            `
                        }
                    `}
                >

                    {filename}

                </span>

            </div>

            {/* ACTIONS */}
            <FormulaActions



                copied={copied}

                wrap={wrap}

                collapsed={collapsed}

                theme={theme}

                fullscreen={fullscreen}

                isLight={isLight}

                aiOpen={aiOpen}

                onToggleAI={onToggleAI}

                onCopy={onCopy}

                onToggleWrap={
                    onToggleWrap
                }

                onToggleTheme={
                    onToggleTheme
                }

                onToggleCollapse={
                    onToggleCollapse
                }

                onToggleFullscreen={
                    onToggleFullscreen
                }

            />

        </div>

    )

}