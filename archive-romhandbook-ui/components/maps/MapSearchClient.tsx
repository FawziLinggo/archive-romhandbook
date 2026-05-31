"use client"

import { Map, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import Pagination from "@/components/common/Pagination"
import useDebounce from "@/components/search/useDebounce"
import { assetUrl } from "@/lib/utils"

import type {
    PaginatedMapResponse,
    ROMMap
} from "@/lib/types/Map"

type Props = {
    initialMaps: ROMMap[]
    page: number
    hasNext: boolean
    total: number
}

const LIMIT = 24

export default function MapSearchClient({
    initialMaps,
    page,
    hasNext,
    total
}: Props) {
    const [
        query,
        setQuery
    ] = useState("")

    const [
        maps,
        setMaps
    ] = useState(initialMaps)

    const [
        loading,
        setLoading
    ] = useState(false)

    const [
        currentPage,
        setCurrentPage
    ] = useState(page)

    const [
        searchHasNext,
        setSearchHasNext
    ] = useState(hasNext)

    const debouncedQuery =
        useDebounce(query, 300)

    const isSearching =
        debouncedQuery.trim().length >= 2

    useEffect(() => {
        setCurrentPage(1)
    }, [
        debouncedQuery
    ])

    useEffect(() => {
        if (!isSearching) {
            setMaps(initialMaps)
            setSearchHasNext(hasNext)
            return
        }

        async function fetchMaps() {
            setLoading(true)

            try {
                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/maps?page=${currentPage}&limit=${LIMIT}&query=${encodeURIComponent(debouncedQuery)}`
                    )

                const json =
                    await res.json() as PaginatedMapResponse

                if (!res.ok) {
                    throw new Error("Failed to fetch maps")
                }

                setMaps(json.data)
                setSearchHasNext(json.meta.has_next)
            } catch {
                setMaps([])
                setSearchHasNext(false)
            } finally {
                setLoading(false)
            }
        }

        fetchMaps()
    }, [
        isSearching,
        debouncedQuery,
        currentPage,
        initialMaps,
        hasNext
    ])

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search maps..."
                    className="h-14 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-12 text-sm font-semibold text-white outline-none focus:border-violet-500"
                />
            </div>

            <div className="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {loading ? "Searching maps..." : `${maps.length} maps shown`}
                </div>

                <div>
                    {total.toLocaleString()} maps archived
                </div>
            </div>

            {maps.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-black p-10 text-center">
                    <h3 className="text-2xl font-black text-white">
                        No Maps Found
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                        Try another map name.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {maps.map((item) => (
                        <Link
                            key={item.id}
                            href={`/maps/${item.id}`}
                            className="group rounded-3xl border border-zinc-800 bg-black p-4 transition hover:border-violet-500/50"
                        >
                            <div className="flex gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                                    {item.image ? (
                                        <img
                                            src={assetUrl(item.image)}
                                            alt={item.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <Map
                                            size={28}
                                            className="text-violet-300"
                                        />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="line-clamp-2 text-base font-black text-emerald-200 group-hover:text-white">
                                        {item.name}
                                    </h2>

                                    <p className="mt-2 text-xs font-bold text-zinc-500">
                                        {item.monster_count} monsters
                                    </p>

                                    <p className="mt-3 break-all text-xs text-zinc-600">
                                        {item.detail_url}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!isSearching && (
                <Pagination
                    page={page}
                    hasNext={hasNext}
                    basePath="/maps"
                />
            )}

            {isSearching && (
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                        className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-5 text-sm font-bold text-white disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="text-sm text-zinc-500">
                        Page {currentPage}
                    </span>

                    <button
                        type="button"
                        disabled={!searchHasNext}
                        onClick={() => setCurrentPage((value) => value + 1)}
                        className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-5 text-sm font-bold text-white disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}