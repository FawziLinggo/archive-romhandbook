"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    ApiResponse,
    Mount
} from "@/lib/types/Mount"

import PaginationSearch from "../common/PaginationSearch"

import MountGrid from "./MountGrid"

import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"

import useDebounce from "../search/useDebounce"

type Props = {

    initialMounts: Mount[]

    total: number

    page: number

}

export default function MountSearchClient({

    initialMounts,
    total,
    page

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

        mounts,
        setMounts

    ] = useState(initialMounts)

    // =====================
    // DEBOUNCE
    // =====================

    const debouncedQuery =
        useDebounce(query, 300)

    // =====================
    // SEARCH
    // =====================

    useEffect(() => {

        // RESET
        if (debouncedQuery.length < 4) {

            setMounts(initialMounts)

            return

        }

        setLoading(true)

        async function fetchMounts() {

            try {

                const res =
                    await fetch(

                        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/mounts/search?query=${encodeURIComponent(debouncedQuery)}`

                    )

                const response =
                    await res.json() as ApiResponse<Mount[]>

                setMounts(response.data)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)

            }

        }

        fetchMounts()

    }, [

        debouncedQuery,
        initialMounts

    ])

    return (

        <div
            className="
                space-y-6
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
                    placeholder="Search mounts..."
                />

                {/* STATUS */}

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={mounts.length}
                />

                {/* TOTAL */}

                {query.length < 4 && (

                    <div
                        className="
                            text-sm
                            text-zinc-500
                        "
                    >
                        {total.toLocaleString()} mounts archived
                    </div>

                )}

            </div>

            {/* GRID */}

            <MountGrid
                mounts={mounts}
            />

            {/* PAGINATION */}

            {query.length < 4 && (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/mounts"
                />

            )}

        </div>

    )

}