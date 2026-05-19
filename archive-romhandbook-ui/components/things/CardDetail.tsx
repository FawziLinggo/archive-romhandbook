
import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/cjs/styles/prism"

type Props = {
    card: any
    formulas: any[]
}

function getQualityColor(
    quality?: string
) {

    switch (quality) {

        case "Green":
            return {
                border: "border-green-500",
                badge: "bg-green-500/20 text-green-300"
            }

        case "Blue":
            return {
                border: "border-blue-500",
                badge: "bg-blue-500/20 text-blue-300"
            }

        case "Purple":
            return {
                border: "border-violet-500",
                badge: "bg-violet-500/20 text-violet-300"
            }

        case "White":
            return {
                border: "border-zinc-400",
                badge: "bg-zinc-500/20 text-zinc-300"
            }

        default:
            return {
                border: "border-zinc-700",
                badge: "bg-zinc-700 text-zinc-300"
            }

    }

}

export default function CardDetail({
    card,
    formulas
}: Props) {

    const qualityColor =
        getQualityColor(card.quality)

    return (

        <div className="max-w-7xl mx-auto">

            {/* TOP */}
            <div
                className="
         grid
        grid-cols-1
        lg:grid-cols-[320px_1fr]
        gap-8
        items-start
    "
            >

                {/* LEFT */}
                <div
                    className="
        sticky
        top-24
        self-start
    "
                >

                    {/* CARD */}
                    <div
                        className="
            rounded-3xl
            overflow-hidden
            border
            border-zinc-800
            bg-zinc-900
            shadow-2xl
        "
                    >

                        {/* IMAGE */}
                        <img
                            src={card.image}
                            alt={card.name}
                            className="
                w-full
                aspect-square
                object-cover
            "
                        />

                        {/* CONTENT */}
                        <div className="p-5">

                            {/* TITLE */}
                            <h1
                                className="
                    text-2xl
                    font-bold
                    text-white
                    leading-tight
                "
                            >
                                {card.name}
                            </h1>

                            {/* TYPE */}
                            <div className="mt-3">

                                <span
                                    className="
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        bg-violet-500/20
                        text-violet-300
                        border
                        border-violet-500/30
                        space-y-6
                    "
                                >
                                    {card.card_type}
                                </span>

                            </div>

                            <div className="mt-3 space-y-3">

                                {/* DEPOSIT */}
                                {card.deposit_texts?.length > 0 && (

                                    <div
                                        className="
                    flex
                    items-start
                    gap-4
                    rounded-xl
                    bg-zinc-800/50
                    p-4
                "
                                    >

                                        <div
                                            className="
                        shrink-0
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-emerald-500/20
                        text-emerald-300
                    "
                                        >
                                            Deposit
                                        </div>

                                        <div className="space-y-2">

                                            {card.deposit_texts.map(
                                                (
                                                    item: string,
                                                    index: number
                                                ) => (

                                                    <div
                                                        key={index}
                                                        className="
                                    text-zinc-300
                                    text-sm
                                    leading-6
                                "
                                                    >
                                                        • {item}
                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                                {/* UNLOCK */}
                                {card.unlock_texts?.length > 0 && (

                                    <div
                                        className="
                    flex
                    items-start
                    gap-4
                    rounded-xl
                    bg-zinc-800/50
                    p-4
                "
                                    >

                                        <div
                                            className="
                        shrink-0
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        bg-violet-500/20
                        text-violet-300
                    "
                                        >
                                            Unlock
                                        </div>

                                        <div className="space-y-2">

                                            {card.unlock_texts.map(
                                                (
                                                    item: string,
                                                    index: number
                                                ) => (

                                                    <div
                                                        key={index}
                                                        className="
                                    text-zinc-300
                                    text-sm
                                    leading-6
                                "
                                                    >
                                                        • {item}
                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>



                        </div>

                    </div>

                </div>

                {/* RIGHT */}
                <div>

                    <div
                        className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
    "
                    >

                        <div className="grid md:grid-cols-1 gap-8">

                            {/* EFFECT */}
                            <div>

                                <h3
                                    className="
                    text-violet-300
                    font-semibold
                    mb-3
                "
                                >
                                    Effect
                                </h3>

                                <div className="space-y-2">

                                    {card.effect_texts?.map(
                                        (
                                            item: string,
                                            index: number
                                        ) => (

                                            <div
                                                key={index}
                                                className="
                                flex
                                gap-2
                                text-zinc-300
                            "
                                            >

                                                <span className="text-violet-400">
                                                    •
                                                </span>

                                                <span>
                                                    {item}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                        </div>

                    </div>


                    {/* FORMULAS */}
                    {formulas.length > 0 && (

                        <div className="mt-10">

                            <h2
                                className="
                        text-2xl
                        font-bold
                        mb-5
                    "
                            >
                                Formulas
                            </h2>

                            <div className="space-y-5">

                                {formulas.map(
                                    (
                                        formula: any,
                                        index: number
                                    ) => (

                                        <div
                                            key={index}
                                            className="
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                    overflow-hidden
                                "
                                        >

                                            <div
                                                className="
                                        px-5
                                        py-3
                                        border-b
                                        border-zinc-800
                                        bg-zinc-950
                                        text-sm
                                        text-zinc-400
                                    "
                                            >
                                                Formula #{index + 1}
                                            </div>

                                            <SyntaxHighlighter
                                                language="json"
                                                style={oneDark}
                                                customStyle={{
                                                    margin: 0,
                                                    background: "transparent",
                                                    fontSize: "14px",
                                                    padding: "20px"
                                                }}
                                            >

                                                {JSON.stringify(
                                                    formula.formula_json,
                                                    null,
                                                    2
                                                )}

                                            </SyntaxHighlighter>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    )

}