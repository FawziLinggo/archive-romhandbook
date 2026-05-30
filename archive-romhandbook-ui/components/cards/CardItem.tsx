import { assetUrl, slugify } from "@/lib/utils"
import Link from "next/link"

import type {
    Card
} from "@/lib/types/Card"

type CardItemProps = {
    card: Card
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

export default function CardItem({ card }: CardItemProps) {

    const qualityColor = getQualityColor(card.quality || undefined)



    let effectTexts: string[] = []
    try {

        effectTexts =
            JSON.parse(
                card.effect_text || "[]"
            )

    } catch {

        effectTexts = []
    }


    return (

        <Link
            href={`/things/${slugify(card.name)}-${card.id}`}
        >

            <div
                className={`
  bg-zinc-900
  border
  ${qualityColor.border}
  rounded-2xl
  overflow-hidden
  hover:-translate-y-1
  transition-all
  duration-200
  shadow-lg
  cursor-pointer
`}
            >

                {/* IMAGE */}
                <div className="p-3">

                    <div
                        className="
                        rounded-xl
                        overflow-hidden
                        bg-zinc-800
                    "
                    >

                        <img
                            src={assetUrl(card.image)}
                            alt={card.name}
                            className="
                            w-full
                            aspect-square
                            object-cover
                        "
                        />

                    </div>

                </div>

                {/* CONTENT */}
                <div className="px-4 pb-4">

                    {/* NAME */}
                    <h2
                        className="
                        text-sm
                        font-bold
                        text-white
                        line-clamp-2
                        min-h-[40px]
                    "
                    >
                        {card.name}
                    </h2>

                    {/* TYPE */}
                    <div className="mt-2">

                        <span
                            className={`
    inline-block
    px-2
    py-1
    text-xs
    rounded-full
    ${qualityColor.badge}
`}
                        >
                            {card.card_type || "Card"}

                        </span>

                    </div>

                    {/* EFFECT */}
                    {/* <div className="mt-3">

                        <p
                            className="
                            text-xs
                            text-zinc-400
                            line-clamp-2
                        "
                        >
                            {effectTexts[0] || "No effect available"}
                        </p>

                    </div> */}

                </div>

            </div>
        </Link>
    )
}