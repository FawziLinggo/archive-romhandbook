"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    Buff
} from "@/lib/queries/buffs"

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

export default function BuffSearchClient({

    initialBuffs,
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

        buffs,
        setBuffs

    ] = useState(initialBuffs)

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
        if (debouncedQuery.length < 3) {

            setBuffs(initialBuffs)

            return

        }

        setLoading(true)

        async function fetchBuffs() {

            try {

                const res =
                    await fetch(

                        `/api/buffs/search?query=${encodeURIComponent(debouncedQuery)}`

                    )

                const data =
                    await res.json()

                setBuffs(data)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)

            }

        }

        fetchBuffs()

    }, [

        debouncedQuery,
        initialBuffs

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
                    placeholder="Search buffs..."
                />

                {/* STATUS */}

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={buffs.length}
                />

                {/* TOTAL */}

                {query.length < 4 && (

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

            {/* GRID */}

            <BuffGrid
                buffs={buffs}
            />

            {/* PAGINATION */}

            {query.length < 4 && (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/buffs"
                />

            )}

        </div>

    )

}