import { Map, Skull } from "lucide-react"
import Link from "next/link"

import CommentsPanel from "@/components/comments/CommentsPanel"
import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"
import DetailContainer from "@/components/layout/DetailContainer"
import { assetUrl } from "@/lib/utils"

import type {
    ROMMapDetail,
    ROMMapMonster
} from "@/lib/types/Map"

type Props = {
    map: ROMMapDetail
}

function MonsterCard({
    monster
}: {
    monster: ROMMapMonster
}) {
    const href =
        monster.monster_url || "#"

    const content = (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-emerald-500/40">
            <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                    {monster.monster_image ? (
                        <img
                            src={assetUrl(monster.monster_image)}
                            alt={monster.monster_name || "Monster"}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <Skull
                            size={22}
                            className="text-violet-300"
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="break-words text-sm font-black text-emerald-200">
                            {monster.monster_name || "Unknown Monster"}
                        </h3>

                        {monster.level && (
                            <span className="shrink-0 text-xs font-black text-white">
                                Lv. {monster.level}
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                        {[monster.race, monster.element, monster.size]
                            .filter(Boolean)
                            .join(" · ") || "Unknown traits"}
                    </p>
                </div>
            </div>
        </div>
    )

    if (!monster.monster_url) {
        return content
    }

    return (
        <Link href={href}>
            {content}
        </Link>
    )
}

export default function MapDetail({
    map
}: Props) {
    return (
        <>
            <DetailContainer>
                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    <aside className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-zinc-950 to-black p-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="mx-auto flex h-64 w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
                            {map.image ? (
                                <img
                                    src={assetUrl(map.image)}
                                    alt={map.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Map
                                    size={48}
                                    className="text-violet-300"
                                />
                            )}
                        </div>

                        <div className="mt-6">
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-black text-violet-200">
                                Map
                            </span>

                            <h1 className="mt-4 text-3xl font-black leading-tight text-white">
                                {map.name}
                            </h1>

                            <p className="mt-3 break-all text-sm leading-6 text-zinc-500">
                                {map.detail_url}
                            </p>

                            <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-4">
                                <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                    Monsters
                                </div>

                                <div className="mt-1 text-2xl font-black text-white">
                                    {map.monsters.length}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="space-y-6">
                        <section className="rounded-3xl border border-zinc-800 bg-black p-5">
                            <div className="flex items-center gap-2">
                                <Skull
                                    size={18}
                                    className="text-emerald-300"
                                />

                                <h2 className="text-2xl font-black text-white">
                                    Monsters
                                </h2>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Monsters archived from this map page.
                            </p>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                {map.monsters.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
                                        No monsters archived for this map.
                                    </div>
                                ) : (
                                    map.monsters.map((monster) => (
                                        <MonsterCard
                                            key={monster.id}
                                            monster={monster}
                                        />
                                    ))
                                )}
                            </div>
                        </section>

                        {map.raw_html && (
                            <RomHtmlViewerToggle
                                html={map.raw_html}
                            />
                        )}
                    </main>
                </div>
            </DetailContainer>

            <CommentsPanel
                targetType="map"
                targetId={map.id}
            />
        </>
    )
}