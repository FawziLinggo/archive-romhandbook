import Link from "next/link"

import FormulaViewer from "@/components/common/FormulaViewer"
import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"
import DetailContainer from "@/components/layout/DetailContainer"

import type {
    CookingIngredientDetail,
    CraftingMaterialDetail,
    FurnitureDetail,
    PetHeadwearUnlockItemDetail,
    ThingRelation
} from "@/lib/types/Thing"
import { assetUrl } from "@/lib/utils"

type ArchiveThingType =
    | "furniture"
    | "cooking_ingredient"
    | "pet_headwear_unlock_item"
    | "crafting_material"

type ArchiveThingDetail =
    | FurnitureDetail
    | CookingIngredientDetail
    | PetHeadwearUnlockItemDetail
    | CraftingMaterialDetail

type Props = {
    type: ArchiveThingType
    detail: ArchiveThingDetail
}

function normalizeHref(href: string | null) {
    if (!href) {
        return "#"
    }

    return href
        .replace("https://romhandbook.com", "")
        .replace("http://romhandbook.com", "")
}

function qualityClass(quality: string | null) {
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
                font-bold
                ${className}
            `}
        >
            {children}
        </span>
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
                p-4
                sm:p-5
            "
        >
            <h2
                className="
                    text-xs
                    font-black
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

function TextBlock({
    value
}: {
    value: string | null
}) {
    if (!value) {
        return null
    }

    return (
        <p
            className="
                whitespace-pre-wrap
                break-words
                text-sm
                leading-7
                text-zinc-200
            "
        >
            {value}
        </p>
    )
}

function RelationCard({
    relation
}: {
    relation: ThingRelation
}) {
    return (
        <Link
            href={normalizeHref(relation.related_url)}
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
            <span
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
                <img
                    src={assetUrl(relation.related_image)}
                    alt={relation.related_name || "Related item"}
                    className="
                        h-full
                        w-full
                        object-cover
                    "
                />
            </span>

            <span className="min-w-0">
                <span
                    className="
                        block
                        truncate
                        text-sm
                        font-bold
                        text-zinc-100
                        group-hover:text-violet-100
                    "
                >
                    {relation.related_name || relation.related_id || "Unknown"}
                </span>

                {relation.quantity && (
                    <span className="mt-1 block text-xs text-zinc-500">
                        Qty: {relation.quantity}
                    </span>
                )}
            </span>
        </Link>
    )
}

function RelationSection({
    title,
    relations
}: {
    title: string
    relations: ThingRelation[]
}) {
    if (!relations?.length) {
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
function materialCraftableToRelations(
    detail: CraftingMaterialDetail
): ThingRelation[] {
    return detail.craftable.map((item) => ({
        id: item.id,
        relation_type: "craftable",
        related_id: null,
        related_name: item.item_name,
        related_image: item.item_image,
        related_url: item.item_url,
        quantity: null,
        relation_index: null
    }))
}

function materialDroppedByToRelations(
    detail: CraftingMaterialDetail
): ThingRelation[] {
    return detail.dropped_by.map((item) => ({
        id: item.id,
        relation_type: "dropped_by",
        related_id: null,
        related_name: item.monster_name,
        related_image: item.monster_image,
        related_url: item.monster_url,
        quantity: null,
        relation_index: null
    }))
}
function getTitle(type: ArchiveThingType) {
    if (type === "furniture") {
        return "Furniture"
    }

    if (type === "cooking_ingredient") {
        return "Cooking Ingredient"
    }


    return "Pet Headwear Unlock Item"
}

function getBadges(type: ArchiveThingType, detail: ArchiveThingDetail) {
    const badges: string[] = [
        getTitle(type)
    ]

    if (type === "furniture") {
        const item = detail as FurnitureDetail

        if (item.furniture_type) {
            badges.push(item.furniture_type)
        }

        if (item.furniture_subtype) {
            badges.push(item.furniture_subtype)
        }

        if (item.is_blueprint) {
            badges.push("Blueprint")
        }
    }

    if (type === "cooking_ingredient") {
        const item = detail as CookingIngredientDetail

        if (item.ingredient_type) {
            badges.push(item.ingredient_type)
        }
    }

    if (type === "pet_headwear_unlock_item") {
        const item = detail as PetHeadwearUnlockItemDetail

        if (item.item_type) {
            badges.push(item.item_type)
        }

        if (item.pet_name) {
            badges.push(item.pet_name)
        }
    }

    if (type === "crafting_material") {
        const item = detail as CraftingMaterialDetail

        if (item.material_type) {
            badges.push(item.material_type)
        }
    }

    return badges
}

function getFormulaCode(detail: ArchiveThingDetail) {
    if ("raw_formula" in detail && detail.raw_formula) {
        return detail.raw_formula
    }

    if ("formulas" in detail && detail.formulas?.length) {
        return JSON.stringify(
            detail.formulas.map((formula) => formula.formula_json || ""),
            null,
            2
        )
    }

    return ""
}

export default function ArchiveThingDetail({
    type,
    detail
}: Props) {
    const badges =
        getBadges(type, detail)

    const formulaCode =
        getFormulaCode(detail)

    const furniture =
        type === "furniture"
            ? detail as FurnitureDetail
            : null

    const cookingIngredient =
        type === "cooking_ingredient"
            ? detail as CookingIngredientDetail
            : null

    const petHeadwear =
        type === "pet_headwear_unlock_item"
            ? detail as PetHeadwearUnlockItemDetail
            : null

    const craftingMaterial =
        type === "crafting_material"
            ? detail as CraftingMaterialDetail
            : null

    return (
        <DetailContainer>
            <div
                className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-[320px_1fr]
                    lg:items-start
                    lg:gap-8
                "
            >
                <aside
                    className="
                        min-w-0
                        lg:sticky
                        lg:top-24
                    "
                >
                    <div
                        className="
                            rounded-3xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            p-5
                            shadow-xl
                            shadow-black/20
                        "
                    >
                        <div
                            className="
                                mx-auto
                                h-36
                                w-36
                                overflow-hidden
                                rounded-3xl
                                border
                                border-zinc-800
                                bg-black
                                sm:h-44
                                sm:w-44
                            "
                        >
                            <img
                                src={assetUrl(detail.image)}
                                alt={detail.name}
                                className="
                                    h-full
                                    w-full
                                    object-contain
                                    p-3
                                "
                            />
                        </div>

                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {badges.map((badge, index) => (
                                <Chip
                                    key={`${badge}-${index}`}
                                    className="
                                        border-cyan-500/20
                                        bg-cyan-500/10
                                        text-cyan-200
                                    "
                                >
                                    {badge}
                                </Chip>
                            ))}

                            {detail.quality && (
                                <Chip className={qualityClass(detail.quality)}>
                                    {detail.quality}
                                </Chip>
                            )}
                        </div>

                        <h1
                            className="
                                mt-5
                                break-words
                                text-center
                                text-2xl
                                font-black
                                leading-tight
                                text-white
                                sm:text-3xl
                            "
                        >
                            {detail.name}
                        </h1>

                        {detail.description && (
                            <p
                                className="
                                    mt-4
                                    break-words
                                    text-center
                                    text-sm
                                    leading-6
                                    text-zinc-400
                                "
                            >
                                {detail.description}
                            </p>
                        )}
                    </div>
                </aside>

                <main className="min-w-0 space-y-6">
                    {furniture?.effect_text && (
                        <Section title="Effect">
                            <TextBlock value={furniture.effect_text} />
                        </Section>
                    )}

                    {furniture?.unlock_text && (
                        <Section title="Unlock">
                            <TextBlock value={furniture.unlock_text} />
                        </Section>
                    )}

                    {furniture?.deposit_stats && (
                        <Section title="Deposit">
                            <TextBlock value={furniture.deposit_stats} />
                        </Section>
                    )}

                    {petHeadwear && (
                        <Section title="Unlock Data">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <TextBlock value={petHeadwear.pet_headwear_name} />
                                <TextBlock value={petHeadwear.unlock_effect_type} />
                                <TextBlock value={petHeadwear.unlock_body_ids} />
                            </div>
                        </Section>
                    )}

                    {furniture && (
                        <>
                            <RelationSection
                                title="Craft Materials"
                                relations={furniture.craft_materials}
                            />

                            <RelationSection
                                title="Craftable"
                                relations={furniture.craftable}
                            />
                        </>
                    )}

                    {cookingIngredient && (
                        <RelationSection
                            title="Dropped By"
                            relations={cookingIngredient.dropped_by}
                        />
                    )}

                    {petHeadwear && (
                        <RelationSection
                            title="Craft Materials"
                            relations={petHeadwear.craft_materials}
                        />
                    )}

                    {craftingMaterial && (
                        <>
                            <RelationSection
                                title="Craftable"
                                relations={materialCraftableToRelations(craftingMaterial)}
                            />

                            <RelationSection
                                title="Dropped By"
                                relations={materialDroppedByToRelations(craftingMaterial)}
                            />
                        </>
                    )}

                    {formulaCode && (
                        <FormulaViewer
                            title="Formula"
                            code={formulaCode}
                            language="json"
                        />
                    )}

                    {detail.raw_html && (
                        <RomHtmlViewerToggle
                            html={detail.raw_html}
                        />
                    )}
                </main>
            </div>
        </DetailContainer>
    )
}

