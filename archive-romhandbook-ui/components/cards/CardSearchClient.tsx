"use client"

import {
    useEffect,
    useState
} from "react"

import CardItem from "@/components/cards/CardItem"

import Pagination from "@/components/common/Pagination"

import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import type {
    Card,
    PaginatedApiResponse
} from "@/lib/types/Card"

type Props = {

    initialCards: Card[]

    page: number

    hasNext: boolean

    initialType: string

    initialQuality: string
}

const LIMIT = 24

export default function CardSearchClient({

    initialCards,
    page,
    hasNext,
    initialType,
    initialQuality

}: Props) {

    const [
        query,
        setQuery
    ] = useState("")

    const [
        type,
        setType
    ] = useState(initialType)

    const [
        quality,
        setQuality
    ] = useState(initialQuality)

    const [
        loading,
        setLoading
    ] = useState(false)

    const [
        cards,
        setCards
    ] = useState(initialCards)

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
        type.length > 0 ||
        quality.length > 0

    useEffect(() => {

        setCurrentPage(1)

    }, [
        debouncedQuery,
        type,
        quality
    ])

    useEffect(() => {

        if (!isSearching) {

            setCards(initialCards)

            setSearchHasNext(hasNext)

            return
        }

        setLoading(true)

        async function fetchCards() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/cards?page=${currentPage}&limit=${LIMIT}&query=${encodeURIComponent(debouncedQuery)}&type=${encodeURIComponent(type)}&quality=${encodeURIComponent(quality)}`
                    )

                if (!res.ok) {

                    throw new Error(
                        "Failed to fetch cards"
                    )
                }

                const response =
                    await res.json() as PaginatedApiResponse<Card>

                setCards(response.data)

                setSearchHasNext(response.meta.has_next)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchCards()

    }, [
        isSearching,
        debouncedQuery,
        type,
        quality,
        currentPage,
        initialCards,
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

        <div>

            <div
                className="
                    flex
                    gap-3
                    mb-6
                    flex-wrap
                "
            >

                <div className="min-w-[260px] flex-1">

                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search card..."
                    />

                </div>

                <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="
                        bg-zinc-900
                        border
                        border-zinc-700
                        rounded-xl
                        px-4
                        py-2
                    "
                >

                    <option value="">
                        All Types
                    </option>

                    <option value="Accessory Card">
                        Accessory Card
                    </option>

                    <option value="Armor Card">
                        Armor Card
                    </option>

                    <option value="Garments Card">
                        Garments Card
                    </option>

                    <option value="Headwear Card">
                        Headwear Card
                    </option>

                    <option value="Off Hand Card">
                        Off Hand Card
                    </option>

                    <option value="Shoe Card">
                        Shoe Card
                    </option>

                    <option value="Weapon Card">
                        Weapon Card
                    </option>

                </select>

                <select
                    value={quality}
                    onChange={(event) => setQuality(event.target.value)}
                    className="
                        bg-zinc-900
                        border
                        border-zinc-700
                        rounded-xl
                        px-4
                        py-2
                    "
                >

                    <option value="">
                        All Quality
                    </option>

                    <option value="White">
                        White
                    </option>

                    <option value="Green">
                        Green
                    </option>

                    <option value="Blue">
                        Blue
                    </option>

                    <option value="Purple">
                        Purple
                    </option>

                </select>

            </div>

            <div className="mb-6">

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={cards.length}
                />

            </div>

            <div
                className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:grid-cols-6
                    gap-5
                "
            >

                {cards.map((card) => (

                    <CardItem
                        key={card.id}
                        card={card}
                    />

                ))}

            </div>

            {!isSearching && (

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    basePath="/cards"
                    query=""
                    type={initialType}
                    quality={initialQuality}
                />

            )}

            {isSearching && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-4
                        mt-12
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