"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    Skill
} from "@/lib/types/Skills"

import SkillGrid from "./SkillGrid"

import Pagination from "../common/Pagination"

import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"

import useDebounce from "../search/useDebounce"

type Props = {

    initialSkills: Skill[]

    page: number

    hasNext: boolean
}

const LIMIT = 24

export default function SkillSearchClient({

    initialSkills,
    page,
    hasNext

}: Props) {

    // =====================
    // STATE
    // =====================

    const [

        query,
        setQuery

    ] = useState("")

    const [

        loading,
        setLoading

    ] = useState(false)

    const [

        skills,
        setSkills

    ] = useState<Skill[]>(initialSkills)

    const [

        currentPage,
        setCurrentPage

    ] = useState(page)

    const [

        searchHasNext,
        setSearchHasNext

    ] = useState(hasNext)

    // =====================
    // DEBOUNCE
    // =====================

    const debouncedQuery =
        useDebounce(query, 300)

    // =====================
    // RESET PAGE
    // =====================

    useEffect(() => {

        setCurrentPage(1)

    }, [

        debouncedQuery

    ])

    // =====================
    // SEARCH
    // =====================

    useEffect(() => {

        // RESET TO SSR DATA
        if (debouncedQuery.length < 4) {

            setSkills(initialSkills)

            setSearchHasNext(hasNext)

            return
        }

        setLoading(true)

        async function fetchSkills() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL

                const res =
                    await fetch(

                        `${API_URL}/api/v1/skills?page=${currentPage}&limit=${LIMIT}&query=${encodeURIComponent(debouncedQuery)}`

                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to fetch skills"
                    )
                }

                const data =
                    await res.json()

                setSkills(
                    data.data
                )

                setSearchHasNext(
                    data.meta.has_next
                )

            } catch (err) {
                setSkills([])

            } finally {

                setLoading(false)
            }
        }

        fetchSkills()

    }, [

        debouncedQuery,
        currentPage,
        initialSkills,
        hasNext

    ])

    // =====================
    // PAGINATION
    // =====================

    function nextPage() {

        if (!searchHasNext) {

            return
        }

        setCurrentPage(

            (prev) => prev + 1

        )
    }

    function prevPage() {

        if (currentPage <= 1) {

            return
        }

        setCurrentPage(

            (prev) => prev - 1

        )
    }

    // =====================
    // RENDER
    // =====================

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* SEARCH */}

            <div
                className="
                    space-y-3
                "
            >

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search skills..."
                />

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={skills.length}
                />

            </div>

            {/* GRID */}

            <SkillGrid
                skills={skills}
            />

            {/* NORMAL PAGINATION */}

            {query.length < 4 && (

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    query=""
                    basePath="/skills"
                />

            )}

            {/* SEARCH PAGINATION */}

            {query.length >= 4 && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-4
                    "
                >

                    {/* PREV */}

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

                        ← Prev

                    </button>

                    {/* PAGE */}

                    <div
                        className="
                            text-sm
                            text-zinc-400
                        "
                    >

                        Page {currentPage}

                    </div>

                    {/* NEXT */}

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

                        Next →

                    </button>

                </div>

            )}

        </div>

    )
}