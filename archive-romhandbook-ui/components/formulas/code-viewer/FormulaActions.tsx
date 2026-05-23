import {
    Check,
    Copy,
    Maximize2,
    Minimize2,
    Moon,
    Sparkles,
    Sun,
    WrapText
} from "lucide-react"

type Props = {

    copied: boolean

    wrap: boolean

    collapsed: boolean

    theme: "vsc" | "onedark"

    fullscreen: boolean

    isLight: boolean

    aiOpen: boolean

    onCopy: () => void

    onToggleWrap: () => void

    onToggleTheme: () => void

    onToggleCollapse: () => void

    onToggleFullscreen: () => void

    onToggleAI: () => void

}

export default function FormulaActions({

    copied,

    wrap,

    collapsed,

    theme,

    fullscreen,

    isLight,

    aiOpen,

    onCopy,

    onToggleWrap,

    onToggleTheme,

    onToggleCollapse,

    onToggleFullscreen,

    onToggleAI

}: Props) {

    // =====================
    // BUTTON STYLE
    // =====================

    const buttonStyle = `

        rounded-xl
        border

        p-2

        transition-all

        ${isLight

            ? `
                border-zinc-300
                bg-white

                text-zinc-700

                hover:bg-zinc-100
                hover:text-black
            `

            : `
                border-zinc-800

                text-zinc-400

                hover:bg-zinc-900
                hover:text-white
            `
        }
    `

    return (

        <div
            className="
                flex
                items-center
                gap-2
            "
        >

            {/* WRAP */}
            <button

                onClick={onToggleWrap}

                className={`
                    ${buttonStyle}

                    ${wrap

                        ? `
                            bg-violet-500
                            border-violet-500
                            text-white

                            hover:bg-violet-600
                        `

                        : ""
                    }
                `}
            >

                <WrapText size={16} />

            </button>

            {/* THEME */}
            <button

                onClick={onToggleTheme}

                className={buttonStyle}
            >

                {theme === "vsc"

                    ? <Moon size={16} />

                    : <Sun size={16} />
                }

            </button>

            {/* FULLSCREEN */}
            <button

                onClick={onToggleFullscreen}

                className={buttonStyle}
            >

                {fullscreen

                    ? <Minimize2 size={16} />

                    : <Maximize2 size={16} />
                }

            </button>

            {/* ASK AI */}
            <button

                onClick={onToggleAI}

                className={`
    relative

    flex
    items-center
    gap-2

    overflow-hidden

    rounded-xl

    px-4
    py-2

    text-sm
    font-medium

    transition-all

    ${aiOpen

                        ? `
            bg-gradient-to-r
            from-violet-500
            to-fuchsia-500

            text-white

            shadow-lg
            shadow-violet-500/20
        `

                        : `
            border
            border-violet-500/30

            ${isLight

                            ? `
                    bg-violet-50
                    text-violet-700

                    hover:bg-violet-100
                `

                            : `
                    bg-violet-500/10
                    text-violet-300

                    hover:bg-violet-500/20
                `
                        }
        `
                    }
`}
            >

                <Sparkles size={16} />

                AI RUNE

                {/* <span
                    className="
                        rounded-full

                        bg-white/20

                        px-2
                        py-0.5

                        text-[10px]
                        font-semibold

                        uppercase
                        tracking-wide
                    "
                >

                    Soon

                </span> */}

                {/* GLOW */}
                <div
                    className="
                        absolute
                        inset-0

                        bg-gradient-to-r
                        from-white/0
                        via-white/10
                        to-white/0

                        opacity-0
                        hover:opacity-100

                        transition-opacity
                    "
                />

            </button>

            {/* COPY */}
            <button

                onClick={onCopy}

                className={`
                    flex
                    items-center
                    gap-2

                    px-3
                    py-2

                    text-sm

                    ${buttonStyle}
                `}
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

    )

}