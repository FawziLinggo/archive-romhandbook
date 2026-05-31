import Link from "next/link"

import CommentsPanel from "@/components/comments/CommentsPanel"
import FormulaViewer from "@/components/common/FormulaViewer"
import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"
import DetailContainer from "@/components/layout/DetailContainer"
import { assetUrl } from "@/lib/utils"

import type {
    AncientEquipDetail as AncientEquipDetailType,
    ThingRelation
} from "@/lib/types/AncientEquip"

type Props = {
    item: AncientEquipDetailType
}

function parseList(value: string | null) {
    if (!value) {
        return []
    }

    try {
        const parsed =
            JSON.parse(value)

        return Array.isArray(parsed)
            ? parsed.filter(Boolean)
            : [String(parsed)]
    } catch {
        return [value]
    }
}

function mergeRelations(
    ...groups: Array<ThingRelation[] | undefined | null>
) {
    const seen =
        new Set<string>()

    const merged:
        ThingRelation[] = []

    for (const group of groups) {
        for (const item of group || []) {
            const key =
                `${item.relation_type}:${item.related_id}:${item.related_url}:${item.related_name}`

            if (seen.has(key)) {
                continue
            }

            seen.add(key)
            merged.push(item)
        }
    }

    return merged
}

function TextSection({
    title,
    value
}: {
    title: string
    value: string | null
}) {
    const items =
        parseList(value)

    if (items.length === 0) {
        return null
    }

    return (
        <section className="rounded-3xl border border-zinc-800 bg-black p-5">
            <h2 className="text-xl font-black text-white">
                {title}
            </h2>

            <div className="mt-4 space-y-3">
                {items.map((text, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-300"
                    >
                        {String(text)}
                    </div>
                ))}
            </div>
        </section>
    )
}

function RelationSection({
    title,
    items
}: {
    title: string
    items: ThingRelation[]
}) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <section className="rounded-3xl border border-zinc-800 bg-black p-5">
            <h2 className="text-xl font-black text-white">
                {title}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((relation) => {
                    const image =
                        assetUrl(relation.related_image)

                    const card = (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 transition hover:border-violet-500/40">
                            <div className="flex gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={relation.related_name || "Related item"}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs font-black text-violet-300">
                                            {relation.related_name?.slice(0, 2).toUpperCase() || "IT"}
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="line-clamp-2 text-sm font-black text-emerald-200">
                                        {relation.quantity ? `${relation.quantity} x ` : ""}
                                        {relation.related_name || "Unknown"}
                                    </p>

                                    {relation.related_id && (
                                        <p className="mt-1 text-xs text-zinc-600">
                                            {relation.related_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )

                    if (!relation.related_url) {
                        return (
                            <div key={relation.id}>
                                {card}
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={relation.id}
                            href={relation.related_url}
                        >
                            {card}
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

export default function AncientEquipDetail({
    item
}: Props) {
    const formulaJson =
        JSON.stringify(
            item.formulas
                .map((formula) => formula.formula_json)
                .filter(Boolean)
        )

    return (
        <>
            <DetailContainer>
                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <aside className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-zinc-950 to-black p-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
                            {item.image && (
                                <img
                                    src={assetUrl(item.image)}
                                    alt={item.name}
                                    className="h-full w-full object-contain"
                                />
                            )}
                        </div>

                        <div className="mt-6">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-200">
                                    Ancient Equip
                                </span>

                                {item.equip_type && (
                                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-200">
                                        {item.equip_type}
                                    </span>
                                )}

                                {item.quality && (
                                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-200">
                                        {item.quality}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-4 text-3xl font-black leading-tight text-white">
                                {item.name}
                            </h1>

                            {item.description && (
                                <p className="mt-4 text-sm leading-7 text-zinc-400">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </aside>

                    <main className="space-y-6">
                        <TextSection
                            title="Equip Effects"
                            value={item.equip_effects}
                        />

                        <TextSection
                            title="Random Attributes"
                            value={item.random_attributes}
                        />

                        <TextSection
                            title="Unlock"
                            value={item.unlock_text}
                        />

                        <TextSection
                            title="Jobs"
                            value={item.jobs}
                        />

                        <RelationSection
                            title="Materials"
                            items={mergeRelations(
                                item.materials,
                                item.craft_materials
                            )}
                        />

                        <RelationSection
                            title="Skills"
                            items={item.skills || []}
                        />

                        <RelationSection
                            title="Craftable"
                            items={item.craftable || []}
                        />

                        {item.formulas?.length > 0 && (
                            <FormulaViewer
                                title="Formula"
                                code={formulaJson}
                                language="json"
                            />
                        )}

                        {item.raw_html && (
                            <RomHtmlViewerToggle
                                html={item.raw_html}
                            />
                        )}
                    </main>
                </div>
            </DetailContainer>

            <CommentsPanel
                targetType="ancient_equip"
                targetId={item.id}
            />
        </>
    )
}