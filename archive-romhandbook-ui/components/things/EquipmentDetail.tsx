import Image from "next/image"
import Link from "next/link"

import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/cjs/styles/prism"

import DetailContainer from "../layout/DetailContainer"

import type {
    EquipmentDetail as EquipmentDetailType,
    EquipmentEquipEffect,
    EquipmentEquipEffectItem,
    EquipmentRelation,
    EquipmentTier
} from "@/lib/types/Equipment"

type Props = {

    equipment: EquipmentDetailType

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

function slugify(
    value: string
) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

function relationHref(
    relation: EquipmentRelation | EquipmentEquipEffectItem
) {
    const itemUrl =
        "item_url" in relation
            ? relation.item_url
            : relation.related_url

    const itemId =
        "item_id" in relation
            ? relation.item_id
            : relation.related_id

    const itemName =
        "item_name" in relation
            ? relation.item_name
            : relation.related_name

    if (itemUrl) {
        return itemUrl.replace(
            "https://romhandbook.com",
            ""
        )
    }

    if (!itemId || !itemName) {
        return "#"
    }

    return `/things/${slugify(itemName)}-${itemId}`
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

function parseTextList(
    value: string | null
) {
    if (!value) {
        return []
    }

    try {
        const parsed =
            JSON.parse(value)

        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => String(item).trim())
                .filter(Boolean)
        }
    } catch {
        // Some crawler fields are plain text instead of JSON arrays.
    }

    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
}

function parseFormulaJson(
    value: unknown
) {
    let current =
        value

    for (let i = 0; i < 2; i++) {

        if (typeof current !== "string") {
            return current
        }

        try {
            current =
                JSON.parse(current)
        } catch {
            return current
        }
    }

    return current
}

function formatFormulaJson(
    value: unknown
) {
    const parsed =
        parseFormulaJson(value)

    if (typeof parsed === "string") {
        return parsed
    }

    return JSON.stringify(
        parsed,
        null,
        2
    )
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

function Section({
    title,
    children
}: {
    title: string
    children: React.ReactNode
}) {

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

            <div className="mt-4">
                {children}
            </div>
        </section>

    )
}

function TextList({
    items,
    tone = "violet"
}: {
    items: string[]
    tone?: "violet" | "emerald" | "cyan" | "amber"
}) {

    if (items.length === 0) {
        return (
            <p className="text-sm text-zinc-600">
                No data archived.
            </p>
        )
    }

    const dotClass =
        tone === "emerald"
            ? "bg-emerald-400"
            : tone === "cyan"
                ? "bg-cyan-400"
                : tone === "amber"
                    ? "bg-amber-400"
                    : "bg-violet-400"

    return (

        <div className="space-y-2">
            {items.map((item, index) => (

                <div
                    key={`${item}-${index}`}
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

    )
}

function RelationCard({
    relation
}: {
    relation: EquipmentRelation
}) {

    return (

        <Link
            href={relationHref(relation)}
            className="
                group
                flex
                min-w-0
                items-center
                gap-3
                rounded-xl
                border
                border-zinc-800
                bg-black/30
                p-3
                transition-colors
                hover:border-violet-500/40
                hover:bg-violet-500/5
            "
        >
            <div
                className="
                    relative
                    h-10
                    w-10
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border
                    border-zinc-800
                    bg-black
                "
            >
                <Image
                    src={normalizeImage(relation.related_image)}
                    alt={relation.related_name || "Related item"}
                    fill
                    sizes="40px"
                    className="object-cover"
                />
            </div>

            <div className="min-w-0">
                <div
                    className="
                        truncate
                        text-sm
                        font-bold
                        text-zinc-100
                        group-hover:text-violet-100
                    "
                >
                    {relation.related_name || relation.related_id}
                </div>
            </div>
        </Link>

    )
}


function CompactRelationGroup({
    title,
    relations
}: {
    title: string
    relations: EquipmentRelation[]
}) {

    if (relations.length === 0) {
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
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-zinc-400
                "
            >
                {title}
            </div>

            <div
                className="
                    mt-3
                    grid
                    gap-2
                "
            >
                {relations.map((relation) => (

                    <Link
                        key={`${relation.relation_type}-${relation.id}`}
                        href={relationHref(relation)}
                        className="
                            group
                            flex
                            min-w-0
                            items-center
                            gap-3
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            p-2
                            transition-colors
                            hover:border-violet-500/40
                            hover:bg-violet-500/5
                        "
                    >
                        <span
                            className="
                                relative
                                h-7
                                w-7
                                shrink-0
                                overflow-hidden
                                rounded-lg
                                border
                                border-zinc-800
                                bg-black
                            "
                        >
                            <Image
                                src={normalizeImage(relation.related_image)}
                                alt={relation.related_name || "Related item"}
                                fill
                                sizes="32px"
                                className="object-cover"
                            />
                        </span>

                        <span
                            className="
                                min-w-0
                                truncate
                                text-xs
                                font-bold
                                text-zinc-200
                                group-hover:text-violet-100
                            "
                        >
                            {relation.related_name || relation.related_id || "Unknown"}
                        </span>
                    </Link>

                ))}
            </div>
        </div>

    )
}

function RelationSection({
    title,
    relations
}: {
    title: string
    relations: EquipmentRelation[]
}) {

    if (relations.length === 0) {
        return null
    }

    return (

        <Section title={title}>
            <div
                className="
                    grid
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                    xl:grid-cols-3
                "
            >
                {relations.map((relation) => (

                    <RelationCard
                        key={`${relation.relation_type}-${relation.id}`}
                        relation={relation}
                    />

                ))}
            </div>
        </Section>

    )
}

function TierSection({
    tiers
}: {
    tiers: EquipmentTier[]
}) {

    if (tiers.length === 0) {
        return null
    }

    return (

        <Section title="Tiers">
            <div className="space-y-3">
                {tiers.map((tier, index) => (

                    <div
                        key={tier.id}
                        className="
                            flex
                            gap-4
                            rounded-xl
                            border
                            border-zinc-800
                            bg-black/30
                            p-4
                        "
                    >
                        <div
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-amber-500/30
                                bg-amber-500/10
                                text-xs
                                font-black
                                text-amber-200
                            "
                        >
                            {index + 1}
                        </div>

                        <p
                            className="
                                text-sm
                                leading-6
                                text-zinc-200
                            "
                        >
                            {tier.tier_text}
                        </p>
                    </div>

                ))}
            </div>
        </Section>

    )
}

function EquipEffectItem({
    item
}: {
    item: EquipmentEquipEffectItem
}) {

    return (

        <Link
            href={relationHref(item)}
            className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-zinc-800
                bg-zinc-950
                py-1
                pl-1
                pr-3
                text-sm
                font-semibold
                text-zinc-200
                transition-colors
                hover:border-cyan-500/40
                hover:text-cyan-100
            "
        >
            <span
                className="
                    relative
                    h-7
                    w-7
                    overflow-hidden
                    rounded-full
                    bg-black
                "
            >
                <Image
                    src={normalizeImage(item.item_image)}
                    alt={item.item_name || "Equip effect item"}
                    fill
                    sizes="28px"
                    className="object-cover"
                />
            </span>

            <span>
                {item.item_name || item.item_id}
            </span>
        </Link>

    )
}

function EquipEffectsSection({
    effects
}: {
    effects: EquipmentEquipEffect[]
}) {

    if (effects.length === 0) {
        return null
    }

    return (

        <Section title="Equip Effects">
            <div className="space-y-4">
                {effects.map((effect) => (

                    <div
                        key={effect.id}
                        className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-black/30
                            p-4
                        "
                    >
                        {effect.items.length > 0 && (

                            <div
                                className="
                                    mb-3
                                    flex
                                    flex-wrap
                                    gap-2
                                "
                            >
                                {effect.items.map((item) => (

                                    <EquipEffectItem
                                        key={item.id}
                                        item={item}
                                    />

                                ))}
                            </div>

                        )}

                        {effect.effect_text && (

                            <p
                                className="
                                    text-sm
                                    leading-6
                                    text-zinc-200
                                "
                            >
                                {effect.effect_text}
                            </p>

                        )}
                    </div>

                ))}
            </div>
        </Section>

    )
}

function FormulaBlock({
    formula,
    index
}: {
    formula: {
        id: number
        formula_id: string | null
        formula_json: string | null
    }
    index: number
}) {

    return (

        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
            "
        >
            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-2
                    border-b
                    border-zinc-800
                    bg-zinc-900/70
                    px-5
                    py-3
                    text-sm
                    text-zinc-400
                "
            >
                <span>
                    Formula #{index + 1}
                </span>

                {formula.formula_id && (
                    <span className="text-xs text-zinc-500">
                        ID {formula.formula_id}
                    </span>
                )}
            </div>

            <SyntaxHighlighter
                language="json"
                style={oneDark}
                wrapLongLines={true}
                PreTag="div"
                codeTagProps={{
                    style: {
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                    }
                }}
                customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: "13px",
                    lineHeight: "1.8",
                    padding: "24px",
                    overflowX: "hidden",
                    maxWidth: "100%",
                }}
            >
                {formatFormulaJson(
                    formula.formula_json
                )}
            </SyntaxHighlighter>
        </div>

    )
}

export default function EquipmentDetail({
    equipment
}: Props) {

    const effects =
        parseTextList(
            equipment.effect_text
        )

    const deposits =
        parseTextList(
            equipment.deposit_stats
        )

    const unlocks =
        parseTextList(
            equipment.unlock_text
        )

    const jobs =
        parseTextList(
            equipment.jobs
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
                        <div className="p-6">
                            <div
                                className="
                                    relative
                                    mx-auto
                                    h-44
                                    w-44
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-zinc-800
                                    bg-black
                                "
                            >
                                <Image
                                    src={normalizeImage(equipment.image)}
                                    alt={equipment.name}
                                    fill
                                    sizes="176px"
                                    className="object-cover"
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
                                    {equipment.type || "Equipment"}
                                </Chip>

                                {equipment.quality && (

                                    <Chip
                                        className={qualityClass(
                                            equipment.quality
                                        )}
                                    >
                                        {equipment.quality}
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
                                {equipment.name}
                            </h1>

                            {equipment.description && (

                                <p
                                    className="
                                        mt-4
                                        text-center
                                        text-sm
                                        leading-6
                                        text-zinc-400
                                    "
                                >
                                    {equipment.description}
                                </p>

                            )}


                            <div className="mt-6 grid gap-3">
                                <CompactRelationGroup
                                    title="Synth From"
                                    relations={equipment.synth_from}
                                />

                                <CompactRelationGroup
                                    title="Synth To"
                                    relations={equipment.synth_to}
                                />

                                <CompactRelationGroup
                                    title="Skills"
                                    relations={equipment.skills}
                                />
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
                    <Section title="Effect">
                        <TextList
                            items={effects}
                            tone="violet"
                        />
                    </Section>


                    <Section title="Unlock">
                        <TextList
                            items={unlocks}
                            tone="cyan"
                        />
                    </Section>


                    <Section title="Deposit">
                        <TextList
                            items={deposits}
                            tone="emerald"
                        />
                    </Section>

                    {jobs.length > 0 && (

                        <Section title="Jobs">
                            <div className="flex flex-wrap gap-2">
                                {jobs.map((job, index) => (

                                    <Chip
                                        key={`${job}-${index}`}
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
                        </Section>

                    )}


                    <TierSection
                        tiers={equipment.tiers}
                    />

                    <RelationSection
                        title="Craft Materials"
                        relations={equipment.craft_materials}
                    />

                    <RelationSection
                        title="Craftable"
                        relations={equipment.craftable}
                    />

                    <RelationSection
                        title="Dropped By"
                        relations={equipment.dropped_by}
                    />


                    <EquipEffectsSection
                        effects={equipment.equip_effects}
                    />

                    {equipment.formulas.length > 0 && (

                        <section className="space-y-4">
                            <h2
                                className="
                                    text-2xl
                                    font-black
                                    text-white
                                "
                            >
                                Formulas
                            </h2>

                            {equipment.formulas.map((formula, index) => (

                                <FormulaBlock
                                    key={formula.id}
                                    formula={formula}
                                    index={index}
                                />

                            ))}
                        </section>

                    )}
                </main>

            </div>

        </DetailContainer>

    )
}
