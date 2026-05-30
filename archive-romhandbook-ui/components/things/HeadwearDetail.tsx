import Image from "next/image"


import DetailContainer from "../layout/DetailContainer"

import type {
    HeadwearDetail as HeadwearDetailType
} from "@/lib/types/Headwear"
import { assetUrl } from "@/lib/utils"
import RelatedFormulaWidget from "../formulas/RelatedFormulaWidget"


type Props = {

    headwear: HeadwearDetailType

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


function Chip({
    children,
    className = ""
}: {
    children: React.ReactNode
    className?: string
}) {

    return (

        <span
            className={`
                rounded-full
                border
                px-3
                py-1
                text-xs
                font-semibold
                ${className}
            `}
        >
            {children}
        </span>

    )
}

function InfoBox({
    label,
    value
}: {
    label: string
    value: string | null
}) {

    if (!value) {
        return null
    }

    return (

        <div
            className="
                rounded-2xl
                border
                border-zinc-800
                bg-black/30
                p-4
            "
        >
            <div
                className="
                    text-[11px]
                    uppercase
                    tracking-wider
                    text-zinc-500
                "
            >
                {label}
            </div>

            <div
                className="
                    mt-2
                    text-sm
                    leading-6
                    text-zinc-200
                "
            >
                {value}
            </div>
        </div>

    )
}

function TextSection({
    title,
    items,
    tone = "violet"
}: {
    title: string
    items: string[]
    tone?: "violet" | "emerald" | "cyan"
}) {

    if (items.length === 0) {
        return null
    }

    const dotClass =
        tone === "emerald"
            ? "bg-emerald-400"
            : tone === "cyan"
                ? "bg-cyan-400"
                : "bg-violet-400"

    return (

        <section
            className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-5
            "
        >
            <h2
                className="
                    text-sm
                    font-bold
                    uppercase
                    tracking-wider
                    text-zinc-400
                "
            >
                {title}
            </h2>

            <div
                className="
                    mt-4
                    space-y-2
                "
            >
                {items.map((item, index) => (

                    <div
                        key={index}
                        className="
                            flex
                            gap-3
                            rounded-xl
                            border
                            border-zinc-800
                            bg-black/30
                            px-4
                            py-3
                            text-sm
                            leading-6
                            text-zinc-200
                        "
                    >
                        <span
                            className={`
                                mt-2
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                ${dotClass}
                            `}
                        />

                        <span>
                            {item}
                        </span>
                    </div>

                ))}
            </div>
        </section>

    )
}

export default function HeadwearDetail({
    headwear
}: Props) {

    const effects =
        parseJsonArray(
            headwear.effect_text
        )

    const deposits =
        parseJsonArray(
            headwear.deposit_stats
        )

    const unlocks =
        parseJsonArray(
            headwear.unlock_text
        )

    const jobs =
        parseJsonArray(
            headwear.jobs
        )

    return (

        <DetailContainer>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-8
                    lg:grid-cols-[340px_1fr]
                    lg:items-start
                "
            >

                <aside
                    className="
                        lg:sticky
                        lg:top-24
                        lg:self-start
                    "
                >
                    <div
                        className="
                            overflow-hidden
                            rounded-3xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            shadow-xl
                            shadow-black/20
                        "
                    >
                        <div
                            className="
                                p-6
                            "
                        >
                            <div
                                className="
                                    relative
                                    mx-auto
                                    h-40
                                    w-40
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-zinc-800
                                    bg-black
                                "
                            >
                                <Image
                                    src={assetUrl(headwear.image)}
                                    alt={headwear.name}
                                    fill
                                    sizes="160px"
                                    className="
                                        object-cover
                                    "
                                />
                            </div>

                            <div
                                className="
                                    mt-6
                                    flex
                                    flex-wrap
                                    justify-center
                                    gap-2
                                "
                            >
                                <Chip
                                    className="
                                        border-cyan-500/20
                                        bg-cyan-500/10
                                        text-cyan-200
                                    "
                                >
                                    {headwear.type || "Headwear"}
                                </Chip>

                                {headwear.quality && (

                                    <Chip
                                        className={qualityClass(
                                            headwear.quality
                                        )}
                                    >
                                        {headwear.quality}
                                    </Chip>

                                )}
                            </div>

                            <h1
                                className="
                                    mt-5
                                    text-center
                                    text-3xl
                                    font-black
                                    leading-tight
                                    text-white
                                "
                            >
                                {headwear.name}
                            </h1>

                            {headwear.description && (

                                <p
                                    className="
                                        mt-4
                                        text-center
                                        text-sm
                                        leading-6
                                        text-zinc-400
                                    "
                                >
                                    {headwear.description}
                                </p>

                            )}

                            <div
                                className="
                                    mt-6
                                    grid
                                    gap-3
                                "
                            >
                                <InfoBox
                                    label="Availability"
                                    value={headwear.availability_date}
                                />
                                {jobs.length > 0 && (

                                    <section
                                    >

                                        <div
                                            className="
                                    mt-4
                                    flex
                                    flex-wrap
                                    gap-2
                                    centered
                                "
                                        >
                                            {jobs.map((job, index) => (

                                                <Chip
                                                    key={index}
                                                    className="
                                            border-red-500/30
                                            bg-red-500/10
                                            text-red-200
                                        "
                                                >
                                                    {job}
                                                </Chip>

                                            ))}
                                        </div>
                                    </section>

                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                <main
                    className="
                        min-w-0
                        space-y-6
                    "
                >

                    <TextSection
                        title="Effect"
                        items={effects}
                        tone="violet"
                    />

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-6
                            xl:grid-cols-2
                        "
                    >
                        <TextSection
                            title="Deposit"
                            items={deposits}
                            tone="emerald"
                        />

                        <TextSection
                            title="Unlock"
                            items={unlocks}
                            tone="cyan"
                        />
                    </div>



                    <RelatedFormulaWidget
                        nodeType="headwear"
                        refId={headwear.id}
                    />

                </main>

            </div>

        </DetailContainer>

    )
}