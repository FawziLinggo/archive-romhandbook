"use client"

import {
    useEffect,
    useState
} from "react"

import Pagination from "@/components/common/Pagination"

import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import MonsterGrid from "./MonsterGrid"

import type {
    Monster,
    PaginatedApiResponse
} from "@/lib/types/Monster"

type Props = {

    initialMonsters: Monster[]

    page: number

    hasNext: boolean

    total: number

    initialSize: string

    initialElement: string

    initialRace: string

    initialSort: string
}

const LIMIT = 24

export default function MonsterSearchClient({

    initialMonsters,
    page,
    hasNext,
    total,
    initialSize,
    initialElement,
    initialRace,
    initialSort

}: Props) {

    const [
        query,
        setQuery
    ] = useState("")

    const [
        size,
        setSize
    ] = useState(initialSize)

    const [
        element,
        setElement
    ] = useState(initialElement)

    const [
        race,
        setRace
    ] = useState(initialRace)

    const [
        sort,
        setSort
    ] = useState(initialSort)

    const [
        loading,
        setLoading
    ] = useState(false)

    const [
        monsters,
        setMonsters
    ] = useState(initialMonsters)

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
        debouncedQuery.length >= 4 ||
        size.length > 0 ||
        element.length > 0 ||
        race.length > 0 ||
        sort !== "Name asc"

    useEffect(() => {

        setCurrentPage(1)

    }, [
        debouncedQuery,
        size,
        element,
        race,
        sort
    ])

    useEffect(() => {

        if (!isSearching) {

            setMonsters(initialMonsters)

            setSearchHasNext(hasNext)

            return
        }

        setLoading(true)

        async function fetchMonsters() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/monsters?page=${currentPage}&limit=${LIMIT}&query=${encodeURIComponent(debouncedQuery)}&size=${encodeURIComponent(size)}&element=${encodeURIComponent(element)}&race=${encodeURIComponent(race)}&sort=${encodeURIComponent(sort)}`
                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to fetch monsters"
                    )
                }

                const response =
                    await res.json() as PaginatedApiResponse<Monster>

                setMonsters(response.data)

                setSearchHasNext(response.meta.has_next)

            } catch (err) {
                setMonsters([])

            } finally {

                setLoading(false)
            }
        }

        fetchMonsters()

    }, [
        isSearching,
        debouncedQuery,
        size,
        element,
        race,
        sort,
        currentPage,
        initialMonsters,
        hasNext
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

        <div className="space-y-6">

            <div
                className="
                    grid
                    gap-3
                    lg:grid-cols-[1fr_180px_180px_180px_180px]
                "
            >

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search monsters..."
                />

                <select
                    value={size}
                    onChange={(event) => setSize(event.target.value)}
                    className="
                        h-14
                        rounded-2xl
                        border
                        border-white/10
                        bg-zinc-950/80
                        px-4
                        text-white
                    "
                >
                    <option value="">Size</option>
                    <option value="Large">Large</option>
                    <option value="Medium">Medium</option>
                    <option value="Small">Small</option>
                </select>

                <select
                    value={element}
                    onChange={(event) => setElement(event.target.value)}
                    className="
                        h-14
                        rounded-2xl
                        border
                        border-white/10
                        bg-zinc-950/80
                        px-4
                        text-white
                    "
                >
                    <option value="">Element</option>
                    <option value="Wind">Wind</option>
                    <option value="Earth">Earth</option>
                    <option value="Water">Water</option>
                    <option value="Fire">Fire</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Holy">Holy</option>
                    <option value="Shadow">Shadow</option>
                    <option value="Ghost">Ghost</option>
                    <option value="Undead (Element)">Undead</option>
                    <option value="Poison">Poison</option>
                </select>

                <select
                    value={race}
                    onChange={(event) => setRace(event.target.value)}
                    className="
                        h-14
                        rounded-2xl
                        border
                        border-white/10
                        bg-zinc-950/80
                        px-4
                        text-white
                    "
                >
                    <option value="">Race</option>
                    <option value="Brute">Brute</option>
                    <option value="DemiHuman">DemiHuman</option>
                    <option value="Demon">Demon</option>
                    <option value="Plant">Plant</option>
                    <option value="Undead (Race)">Undead</option>
                    <option value="Formless">Formless</option>
                    <option value="Fish">Fish</option>
                    <option value="Angel">Angel</option>
                    <option value="Insect">Insect</option>
                    <option value="Dragon">Dragon</option>
                </select>

                <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="
                        h-14
                        rounded-2xl
                        border
                        border-white/10
                        bg-zinc-950/80
                        px-4
                        text-white
                    "
                >
                    <option value="Name asc">Name asc</option>
                    <option value="Name desc">Name desc</option>
                    <option value="Level asc">Level asc</option>
                    <option value="Level desc">Level desc</option>
                    <option value="Hp asc">HP asc</option>
                    <option value="Hp desc">HP desc</option>
                    <option value="BaseExp asc">Base EXP asc</option>
                    <option value="BaseExp desc">Base EXP desc</option>
                    <option value="JobExp asc">Job EXP asc</option>
                    <option value="JobExp desc">Job EXP desc</option>
                </select>

            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={monsters.length}
                />

                <div>
                    {total.toLocaleString()} monsters archived
                </div>

            </div>

            <MonsterGrid
                monsters={monsters}
            />

            {!isSearching && (

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    basePath="/monsters"
                />
            )}

            {isSearching && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-4
                        pt-6
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

                    <div className="text-sm text-zinc-400">
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