"use client"

import {
    useEffect,
    useState
} from "react"

import Link from "next/link"

import PaginationSearch from "@/components/common/PaginationSearch"

import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import type {
    ApiResponse,
    Formula
} from "@/lib/types/Formula"

type Props = {

    initialFormulas: Formula[]

    total: number

    page: number
}

type SearchMeta = {

    page: number

    limit: number

    total: number

    has_next: boolean
}

type SearchResponse = ApiResponse<Formula[]> & {

    meta: SearchMeta
}

const LIMIT = 20

function getPreview(
    code: string
) {

    return code
        .split("\n")
        .slice(0, 5)
        .join("\n")
}

function getLineCount(
    code: string
) {

    return code
        .split("\n")
        .length
}

export default function FormulaExplorer({

    initialFormulas,
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
        formulas,
        setFormulas
    ] = useState(initialFormulas)

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

            setFormulas(initialFormulas)

            setSearchHasNext(false)

            return
        }

        setLoading(true)

        async function fetchFormulas() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/formulas/search?query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}&limit=${LIMIT}`
                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to search formulas"
                    )
                }

                const response =
                    await res.json() as SearchResponse

                setFormulas(response.data)

                setSearchHasNext(response.meta.has_next)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchFormulas()

    }, [
        debouncedQuery,
        currentPage,
        initialFormulas
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

        <div className="space-y-8">

            <div className="space-y-3">

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search formulas..."
                />

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={formulas.length}
                />

                {query.length < 3 && (

                    <div
                        className="
                            text-sm
                            text-zinc-500
                        "
                    >
                        {total.toLocaleString()} formulas archived
                    </div>
                )}

            </div>

            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-6
                "
            >

                {formulas.map(
                    (formula) => (

                        <Link
                            key={formula.id}
                            href={formula.detail_url}
                        >

                            <div
                                className="
                                    rounded-3xl
                                    border
                                    border-zinc-800
                                    bg-gradient-to-br
                                    from-zinc-950
                                    to-zinc-900
                                    overflow-hidden

                                    hover:border-violet-500/40
                                    hover:-translate-y-1
                                    hover:shadow-2xl
                                    hover:shadow-violet-500/10

                                    transition-all
                                    duration-300
                                "
                            >

                                <div
                                    className="
                                        p-5
                                        border-b
                                        border-zinc-800
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        "
                                    >

                                        <div>

                                            <h2
                                                className="
                                                    text-xl
                                                    font-bold
                                                    text-emerald-300
                                                    break-all
                                                "
                                            >
                                                {formula.name}
                                            </h2>

                                        </div>

                                        <div
                                            className="
                                                shrink-0
                                                px-3
                                                py-1
                                                rounded-full
                                                bg-violet-500/20
                                                text-violet-300
                                                text-xs
                                            "
                                        >
                                            Lua
                                        </div>

                                    </div>

                                </div>

                                <div className="p-5">

                                    <pre
                                        className="
                                            text-sm
                                            leading-7
                                            text-zinc-300
                                            font-mono
                                            whitespace-pre-wrap
                                            break-words
                                            overflow-hidden
                                        "
                                    >
                                        {getPreview(
                                            formula.formula_code
                                        )}
                                    </pre>

                                </div>

                                <div
                                    className="
                                        px-5
                                        py-4
                                        border-t
                                        border-zinc-800

                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-zinc-500
                                        "
                                    >
                                        {getLineCount(
                                            formula.formula_code
                                        )}
                                        {" "}
                                        lines
                                    </span>

                                    <span
                                        className="
                                            text-violet-400
                                            text-sm
                                        "
                                    >
                                        View Formula
                                    </span>

                                </div>

                            </div>

                        </Link>
                    )
                )}

            </div>

            {query.length < 3 && (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/formulas"
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