"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    Pet
} from "@/lib/types/Pets"

import PaginationSearch from "../common/PaginationSearch"

import PetGrid from "./PetGrid"

import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"

import useDebounce from "../search/useDebounce"

type Props = {

    initialPets: Pet[]

    total: number

    page: number
}

export default function PetSearchClient({

    initialPets,
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

        pets,
        setPets

    ] = useState<Pet[]>(initialPets)

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

            setPets(initialPets)

            return
        }

        setLoading(true)

        async function fetchPets() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL

                const res =
                    await fetch(

                        `${API_URL}/api/v1/pets/search?query=${encodeURIComponent(debouncedQuery)}`

                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to fetch pets"
                    )
                }

                const data =
                    await res.json()

                setPets(
                    data.data
                )

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchPets()

    }, [

        debouncedQuery,
        initialPets

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
                    placeholder="Search pets..."
                />

                {/* STATUS */}

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={pets.length}
                />

                {/* TOTAL */}

                {query.length < 4 && (

                    <div
                        className="
                            flex
                            items-center
                            justify-between

                            text-sm
                            text-zinc-500
                        "
                    >

                        <p>
                            {total.toLocaleString()} pets archived
                        </p>

                        <p>
                            Page {page}
                        </p>

                    </div>

                )}

            </div>

            {/* GRID */}

            <PetGrid
                pets={pets}
            />

            {/* EMPTY */}

            {pets.length <= 0 && (

                <div
                    className="
                        rounded-3xl

                        border
                        border-dashed
                        border-white/10

                        bg-black/20

                        py-24
                        text-center
                    "
                >

                    <p
                        className="
                            text-lg
                            font-semibold
                            text-zinc-300
                        "
                    >
                        No pets found
                    </p>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-zinc-500
                        "
                    >
                        Try another keyword.
                    </p>

                </div>

            )}

            {/* PAGINATION */}

            {query.length < 4 &&
                pets.length > 0 && (

                    <PaginationSearch
                        page={page}
                        total={total}
                        basePath="/pets"
                    />

                )}

        </div>

    )

}