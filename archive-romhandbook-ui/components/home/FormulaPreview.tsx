import Link from "next/link"

import {
    ArrowRight,
    Code2
} from "lucide-react"

type Props = {
    formula: any
}

export default function FormulaPreview({
    formula
}: Props) {

    if (!formula) {
        return null
    }

    // =====================
    // SHORT PREVIEW
    // =====================

    const preview =
        formula.formula_code
            ?.split("\n")
            ?.slice(0, 8)
            ?.join("\n")

    return (

        <section
            className="
                relative
                overflow-hidden

                rounded-[32px]

                border
                border-zinc-800

                bg-gradient-to-b
                from-zinc-950
                to-black

                p-8
            "
        >

            {/* GLOW */}
            <div
                className="
                    absolute
                    top-0
                    right-0

                    h-[300px]
                    w-[300px]

                    rounded-full

                    bg-violet-600/10

                    blur-3xl
                "
            />

            <div
                className="
                    relative
                    z-10
                "
            >

                {/* HEADER */}
                <div
                    className="
                        flex
                        items-center
                        justify-between

                        gap-5
                        flex-wrap
                    "
                >

                    <div>

                        <div
                            className="
                                inline-flex
                                items-center
                                gap-2

                                rounded-full

                                border
                                border-violet-500/30

                                bg-violet-500/10

                                px-4
                                py-2

                                text-sm
                                text-violet-300

                                mb-5
                            "
                        >

                            <Code2 size={16} />

                            Internal Formula Archive

                        </div>

                        <h2
                            className="
                                text-4xl
                                font-black
                                text-white
                            "
                        >
                            Formula Preview
                        </h2>

                        <p
                            className="
                                mt-3
                                max-w-2xl

                                text-zinc-400
                                leading-relaxed
                            "
                        >

                            Explore preserved ROMHandbook's
                            internal formulas, dmg calculations, and
                            hidden game mechanics.

                        </p>

                    </div>

                    {/* BUTTON */}
                    <Link
                        href="/formulas"
                        className="
                            inline-flex
                            items-center
                            gap-2

                            rounded-2xl

                            border
                            border-violet-500/30

                            bg-violet-500/10

                            px-5
                            py-3

                            text-violet-300

                            hover:bg-violet-500/20

                            transition-all
                        "
                    >

                        Explore Database

                        <ArrowRight size={18} />

                    </Link>

                </div>

                {/* CODE PREVIEW */}
                <div
                    className="
                        mt-8

                        overflow-hidden

                        rounded-3xl

                        border
                        border-zinc-800

                        bg-zinc-950
                    "
                >

                    {/* TERMINAL HEADER */}
                    <div
                        className="
                            flex
                            items-center
                            justify-between

                            border-b
                            border-zinc-800

                            px-5
                            py-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <div className="h-3 w-3 rounded-full bg-green-500" />

                        </div>

                        <span
                            className="
                                text-sm
                                text-zinc-500
                            "
                        >
                            {formula.name}
                        </span>

                    </div>

                    {/* CODE */}
                    <pre
                        className="
                             max-h-[320px]
                            overflow-hidden

                            p-6

                            text-sm
                            leading-7

                            text-emerald-300
                        "
                    >

                        {preview}

                    </pre>

                    <div
                        className="
        absolute
        bottom-0
        left-0
        right-0

        h-24

        bg-gradient-to-t
        from-zinc-950
        to-transparent

        pointer-events-none
    "
                    />

                </div>

            </div>

        </section>

    )

}