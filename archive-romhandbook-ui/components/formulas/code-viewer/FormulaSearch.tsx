import { Search } from "lucide-react"

type Props = {

    value: string

    isLight: boolean

    onChange: (
        value: string
    ) => void

}

export default function FormulaSearch({

    value,

    isLight,

    onChange

}: Props) {

    return (

        <div className="px-5 pb-4">

            <div
                className={`
                    flex
                    items-center
                    gap-3

                    rounded-2xl
                    border

                    px-4
                    py-3

                    transition-all

                    ${isLight

                        ? `
                            border-zinc-300
                            bg-white
                        `

                        : `
                            border-zinc-800
                            bg-black
                        `
                    }
                `}
            >

                {/* ICON */}
                <Search

                    size={18}

                    className={`
                        ${isLight

                            ? `
                                text-zinc-400
                            `

                            : `
                                text-zinc-500
                            `
                        }
                    `}
                />

                {/* INPUT */}
                <input

                    type="text"

                    placeholder="
                        Search in code...
                    "

                    value={value}

                    onChange={(e) =>
                        onChange(
                            e.target.value
                        )
                    }

                    className={`
                        w-full

                        bg-transparent

                        text-sm

                        outline-none

                        transition-all

                        ${isLight

                            ? `
                                text-zinc-900
                                placeholder:text-zinc-400
                            `

                            : `
                                text-white
                                placeholder:text-zinc-600
                            `
                        }
                    `}
                />

            </div>

        </div>

    )

}