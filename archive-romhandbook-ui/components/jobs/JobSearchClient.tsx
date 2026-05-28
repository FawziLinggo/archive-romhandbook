"use client"
import JobTree from "./JobTree"

import {
    useEffect,
    useState
} from "react"

import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import type {
    Job,
    PaginatedApiResponse
} from "@/lib/types/Job"

import JobGrid from "./JobGrid"

type Props = {

    initialJobs: Job[]

    page: number

    hasNext: boolean

    total: number
}

const LIMIT = 24

export default function JobSearchClient({

    initialJobs,
    page,
    hasNext,
    total

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
        jobs,
        setJobs
    ] = useState(initialJobs)

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
        debouncedQuery.length >= 3

    useEffect(() => {

        setCurrentPage(1)

    }, [
        debouncedQuery
    ])

    useEffect(() => {

        if (!isSearching) {

            setJobs(initialJobs)

            setSearchHasNext(hasNext)

            return
        }

        setLoading(true)

        async function fetchJobs() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/jobs/search?query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}&limit=${LIMIT}`
                    )

                if (!res.ok) {
                    throw new Error("Failed to fetch jobs")
                }

                const response =
                    await res.json() as PaginatedApiResponse<Job>

                setJobs(response.data)

                setSearchHasNext(response.meta.has_next)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchJobs()

    }, [
        isSearching,
        debouncedQuery,
        currentPage,
        initialJobs,
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

            <div className="space-y-3">

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search jobs..."
                />

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                    "
                >
                    <SearchStatus
                        query={query}
                        loading={loading}
                        count={jobs.length}
                    />

                    {!isSearching && (

                        <div
                            className="
                                text-sm
                                text-zinc-500
                            "
                        >
                            {total.toLocaleString()} jobs archived
                        </div>

                    )}
                </div>

            </div>

            {jobs.length > 0 ? (

                isSearching ? (

                    <JobGrid
                        jobs={jobs}
                    />

                ) : (

                    <JobTree
                        jobs={jobs}
                    />

                )

            ) : (

                <div
                    className="
                        rounded-2xl
                        border
                        border-dashed
                        border-zinc-800
                        bg-zinc-950/50
                        px-6
                        py-16
                        text-center
                    "
                >
                    <h3
                        className="
                            text-lg
                            font-bold
                            text-white
                        "
                    >
                        No jobs found
                    </h3>
                </div>

            )}


            {isSearching && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-3
                        pt-4
                    "
                >
                    <button
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className="
                            h-11
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-4
                            text-sm
                            font-semibold
                            text-zinc-300

                            disabled:pointer-events-none
                            disabled:opacity-40
                        "
                    >
                        Prev
                    </button>

                    <div
                        className="
                            rounded-xl
                            border
                            border-zinc-800
                            bg-black
                            px-4
                            py-2
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
                            h-11
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-4
                            text-sm
                            font-semibold
                            text-zinc-300

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