import Image from "next/image"
import Link from "next/link"

import type {
    Equipment
} from "@/lib/types/Equipment"

import {
    slugify
} from "@/lib/utils"

type Props = {

    equipment: Equipment

}

function parseJsonArray(
    value: string | null
) {
    if (!value) {
        return []
    }

    try {
        const parsed =
            JSON.parse(value)

        if (Array.isArray(parsed)) {
            return parsed.filter(Boolean)
        }

        return []
    } catch {
        return []
    }
}

function normalizeImage(
    image: string | null
) {
    if (!image) {
        return "/placeholder.png"
    }

    return image
        .replace("https://romhandbook.com", "")
        .replace("http://romhandbook.com", "")
}

function qualityClass(
    quality: string | null
) {
    switch (quality) {
        case "Purple":
            return "border-violet-500/40 bg-violet-500/10 text-violet-200"

        case "Blue":
            return "border-sky-500/40 bg-sky-500/10 text-sky-200"

        case "Green":
            return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"

        case "White":
            return "border-zinc-400/40 bg-zinc-400/10 text-zinc-200"

        default:
            return "border-zinc-700 bg-zinc-900 text-zinc-300"
    }
}

function MiniInfo({
    label,
    value
}: {
    label: string
    value: string
}) {

    return (

        <div
            className="
                min-w-0
                rounded-xl
                border
                border-zinc-800
                bg-black/30
                px-3
                py-2
            "
        >
            <div
                className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-zinc-500
                "
            >
                {label}
            </div>

            <div
                className="
                    mt-1
                    line-clamp-1
                    text-xs
                    font-semibold
                    text-zinc-200
                "
            >
                {value || "-"}
            </div>
        </div>

    )
}

export default function EquipmentCard({
    equipment
}: Props) {

    const effects =
        parseJsonArray(
            equipment.effect_text
        )

    const deposits =
        parseJsonArray(
            equipment.deposit_stats
        )

    const unlocks =
        parseJsonArray(
            equipment.unlock_text
        )

    const href =
        `/things/${slugify(equipment.name)}-${equipment.id}`

    return (

        <Link
            href={href}
            className="
                group
                block
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-4
                transition-all
                hover:-translate-y-0.5
                hover:border-violet-500/40
                hover:bg-zinc-900/80
            "
        >
            <div
                className="
                    flex
                    gap-4
                "
            >
                <div
                    className="
                        relative
                        h-16
                        w-16
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        border
                        border-zinc-800
                        bg-black
                    "
                >
                    <Image
                        src={normalizeImage(equipment.image)}
                        alt={equipment.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                </div>

                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                    "
                >
                    <h2
                        className="
                            line-clamp-1
                            text-base
                            font-black
                            text-white
                            group-hover:text-violet-100
                        "
                    >
                        {equipment.name}
                    </h2>

                    <div
                        className="
                            mt-2
                            flex
                            flex-wrap
                            gap-2
                        "
                    >
                        <span
                            className="
                                rounded-full
                                border
                                border-cyan-500/20
                                bg-cyan-500/10
                                px-2.5
                                py-0.5
                                text-xs
                                text-cyan-200
                            "
                        >
                            {equipment.type || "Equipment"}
                        </span>

                        {equipment.quality && (

                            <span
                                className={`
                                    rounded-full
                                    border
                                    px-2.5
                                    py-0.5
                                    text-xs
                                    ${qualityClass(equipment.quality)}
                                `}
                            >
                                {equipment.quality}
                            </span>

                        )}
                    </div>

                    <div
                        className="
                            mt-4
                            min-h-[72px]
                            space-y-1.5
                        "
                    >
                        {effects.length > 0 ? (

                            effects.slice(0, 3).map((effect, index) => (

                                <div
                                    key={index}
                                    className="
                                        flex
                                        gap-2
                                        text-sm
                                        leading-5
                                        text-zinc-300
                                    "
                                >
                                    <span
                                        className="
                                            mt-2
                                            h-1.5
                                            w-1.5
                                            shrink-0
                                            rounded-full
                                            bg-violet-400
                                        "
                                    />

                                    <span className="line-clamp-1">
                                        {effect}
                                    </span>
                                </div>

                            ))

                        ) : (

                            <div
                                className="
                                    text-sm
                                    text-zinc-600
                                "
                            >
                                No effect available
                            </div>

                        )}
                    </div>

                </div>
            </div>
        </Link>

    )
}