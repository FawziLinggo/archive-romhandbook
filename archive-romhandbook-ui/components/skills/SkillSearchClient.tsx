"use client"

import type {
    Skill,
    SkillListResponse
} from "@/lib/types/Skills"
import {
    useEffect,
    useState
} from "react"

import Pagination from "../common/Pagination"
import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"
import useDebounce from "../search/useDebounce"
import SkillGrid from "./SkillGrid"

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

    const debouncedQuery =
        useDebounce(query, 300)

    const isSearching =
        debouncedQuery.length >= 4

    useEffect(() => {
        setCurrentPage(1)
    }, [
        debouncedQuery
    ])

    useEffect(() => {
        if (!isSearching) {
            setSkills(initialSkills)
            setSearchHasNext(hasNext)
            setLoading(false)
            return
        }

        let cancelled =
            false

        async function fetchSkills() {
            setLoading(true)

            try {
                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/skills?page=${currentPage}&limit=${LIMIT}&query=${encodeURIComponent(debouncedQuery)}`
                    )

                if (!res.ok) {
                    throw new Error("Failed to fetch skills")
                }

                const data =
                    await res.json() as SkillListResponse

                if (cancelled) {
                    return
                }

                setSkills(data.data)
                setSearchHasNext(data.meta.has_next)
            } catch {
                if (!cancelled) {
                    setSkills([])
                    setSearchHasNext(false)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchSkills()

        return () => {
            cancelled = true
        }
    }, [
        isSearching,
        debouncedQuery,
        currentPage,
        initialSkills,
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

        <div className="space-y-8">

            <div className="space-y-3">

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

            <SkillGrid
                skills={skills}
            />

            {!isSearching && (

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    query=""
                    basePath="/skills"
                />

            )}

            {isSearching && (

                <div className="flex items-center justify-center gap-4">

                    <button
                        type="button"
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className="
                            h-12
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            px-5
                            text-white
                            transition-all
                            hover:bg-zinc-800
                            disabled:pointer-events-none
                            disabled:opacity-40
                        "
                    >
                        Prev
                    </button>

                    <div className="text-sm text-zinc-400">
                        Page {currentPage}
                    </div>

                    <button
                        type="button"
                        onClick={nextPage}
                        disabled={!searchHasNext}
                        className="
                            h-12
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            px-5
                            text-white
                            transition-all
                            hover:bg-zinc-800
                            disabled:pointer-events-none
                            disabled:opacity-40
                        "
                    >
                        Next
                    </button>

                </div>

            )}

        </div>

    )
}