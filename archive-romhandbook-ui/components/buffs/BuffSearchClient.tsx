"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    ApiResponse,
    Buff
} from "@/lib/types/Buff"

import PaginationSearch from "../common/PaginationSearch"

import BuffGrid from "./BuffGrid"

import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"

import useDebounce from "../search/useDebounce"

type Props = {

    initialBuffs: Buff[]

    total: number

    page: number
}

type SearchMeta = {

    page: number

    limit: number

    total: number

    has_next: boolean
}

type SearchResponse = ApiResponse<Buff[]> & {

    meta: SearchMeta
}

const LIMIT = 24

export default function BuffSearchClient({

    initialBuffs,
    total,
    page

}: Props) {

    const [
        query,
        setQuery
    ] = useState("")

    const [
        loading,
        setLoading
    ] = useState(false)

    const [
        buffs,
        setBuffs
    ] = useState(initialBuffs)

    const [
        currentPage,
        setCurrentPage
    ] = useState(1)

    const [
        searchHasNext,
        setSearchHasNext
    ] = useState(false)

    const debouncedQuery =
        useDebounce(query, 300)

    useEffect(() => {

        setCurrentPage(1)

    }, [
        debouncedQuery
    ])

    useEffect(() => {

        if (debouncedQuery.length < 3) {

            setBuffs(initialBuffs)

            setSearchHasNext(false)

            return
        }

        setLoading(true)

        async function fetchBuffs() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/buffs/search?query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}&limit=${LIMIT}`
                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to search buffs"
                    )
                }

                const response =
                    await res.json() as SearchResponse

                setBuffs(response.data)

                setSearchHasNext(response.meta.has_next)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchBuffs()

    }, [
        debouncedQuery,
        currentPage,
        initialBuffs
    ])

    function nextPage() {

        if (!searchHasNext) {

            return
        }

        setCurrentPage((prev) => prev + 1)
    }

    function prevPage() {

        if (currentPage <= 1) {

            return
        }

        setCurrentPage((prev) => prev - 1)
    }

    return (

        <div
            className="
                space-y-6
            "
        >

            <div
                className="
                    space-y-3
                "
            >

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search buffs..."
                />

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={buffs.length}
                />

                {query.length < 3 && (

                    <div
                        className="
                            text-sm
                            text-zinc-500
                        "
                    >
                        {total.toLocaleString()} buffs archived
                    </div>
                )}

            </div>

            <BuffGrid
                buffs={buffs}
            />

            {query.length < 3 && (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/buffs"
                />
            )}

            {query.length >= 3 && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-4
                    "
                >

                    <button
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className="
                            h-12
                            px-5

                            rounded-xl

                            border
                            border-zinc-800

                            bg-zinc-900

                            text-white

                            transition-all

                            disabled:pointer-events-none
                            disabled:opacity-40

                            hover:bg-zinc-800
                        "
                    >
                        Prev
                    </button>

                    <div
                        className="
                            text-sm
                            text-zinc-400
                        "
                    >
                        Page {currentPage}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={!searchHasNext}
                        className="
                            h-12
                            px-5

                            rounded-xl

                            border
                            border-zinc-800

                            bg-zinc-900

                            text-white

                            transition-all

                            disabled:pointer-events-none
                            disabled:opacity-40

                            hover:bg-zinc-800
                        "
                    >
                        Next
                    </button>

                </div>
            )}

        </div>
    )
}