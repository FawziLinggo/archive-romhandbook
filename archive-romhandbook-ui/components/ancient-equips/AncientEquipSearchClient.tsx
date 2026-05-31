"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import PaginationSearch from "@/components/common/PaginationSearch"
import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"
import { assetUrl } from "@/lib/utils"

import type {
    AncientEquip
} from "@/lib/types/AncientEquip"

type Props = {
    initialItems: AncientEquip[]
    total: number
    page: number
    hasNext: boolean
    initialQuery: string
}

function buildUrl(
    page: number,
    query: string
) {
    const params =
        new URLSearchParams()

    if (page > 1) {
        params.set("page", String(page))
    }

    if (query) {
        params.set("query", query)
    }

    const qs =
        params.toString()

    return qs
        ? `/ancient-equips?${qs}`
        : "/ancient-equips"
}

export default function AncientEquipSearchClient({
    initialItems,
    total,
    page,
    hasNext,
    initialQuery
}: Props) {
    const router =
        useRouter()

    const pathname =
        usePathname()

    const didMount =
        useRef(false)

    const [
        query,
        setQuery
    ] = useState(initialQuery)

    const debouncedQuery =
        useDebounce(query, 300)

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }

        router.replace(
            buildUrl(1, debouncedQuery),
            {
                scroll: false
            }
        )
    }, [
        debouncedQuery,
        pathname,
        router
    ])

    return (
        <div className="space-y-6">
            <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search ancient equips..."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <SearchStatus
                    query={query}
                    loading={false}
                    count={initialItems.length}
                />

                <div className="text-zinc-500">
                    {total.toLocaleString()} ancient equips archived
                </div>
            </div>

            {initialItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-black p-10 text-center">
                    <h2 className="text-2xl font-black text-white">
                        No Ancient Equip Found
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                        Try another keyword.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {initialItems.map((item) => (
                        <Link
                            key={item.id}
                            href={`/ancient-equips/${item.id}`}
                            className="group rounded-3xl border border-zinc-800 bg-black p-4 transition hover:border-violet-500/50"
                        >
                            <div className="flex gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                                    {item.image && (
                                        <img
                                            src={assetUrl(item.image)}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                        />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="line-clamp-2 text-base font-black text-emerald-200 group-hover:text-white">
                                        {item.name}
                                    </h2>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {item.equip_type && (
                                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-black text-violet-200">
                                                {item.equip_type}
                                            </span>
                                        )}

                                        {item.quality && (
                                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-black text-cyan-200">
                                                {item.quality}
                                            </span>
                                        )}
                                    </div>

                                    {item.description && (
                                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-500">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {debouncedQuery ? (
                <div className="flex items-center justify-center gap-3 pt-2">
                    {page > 1 ? (
                        <Link
                            href={buildUrl(page - 1, debouncedQuery)}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-200"
                        >
                            Previous
                        </Link>
                    ) : null}

                    <span className="rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-400">
                        Page {page}
                    </span>

                    {hasNext ? (
                        <Link
                            href={buildUrl(page + 1, debouncedQuery)}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-200"
                        >
                            Next
                        </Link>
                    ) : null}
                </div>
            ) : (
                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/ancient-equips"
                />
            )}
        </div>
    )
}