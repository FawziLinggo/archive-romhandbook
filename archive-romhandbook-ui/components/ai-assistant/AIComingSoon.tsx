type Props = {

    isLight?: boolean

}

export default function AIComingSoon({

    isLight = false

}: Props) {

    return (

        <div className="mt-6">

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

                    Future AI assistant features:

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
                        • Build recommendations
                    </li>

                    <li>
                        • Hidden mechanic analysis
                    </li>

                    <li>
                        • Skill combo suggestions
                    </li>

                    <li>
                        • Monster weakness detection
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

                    Ask anything about ROM...

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

                AI assistant is currently in development.

            </div>

        </div>

    )

}