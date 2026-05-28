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

    limit?: number
}

const LIMIT = 24

function SelectControl({
    value,
    label,
    children,
    onChange
}: {
    value: string
    label: string
    children: React.ReactNode
    onChange: (value: string) => void
}) {

    return (

        <select
            value={value}
            aria-label={label}
            onChange={(event) =>
                onChange(event.target.value)
            }
            className="
                h-12
                w-full
                rounded-xl
                border
                border-zinc-800
                bg-black
                px-4
                text-sm
                text-white
                outline-none
                transition-colors

                hover:border-zinc-700
                focus:border-violet-500
            "
        >
            {children}
        </select>

    )
}

export default function CardSearchClient({

    initialCards,
    page,
    hasNext,
    initialType,
    initialQuality,
    limit = 24

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
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/cards?page=${currentPage}&limit=${limit}&query=${encodeURIComponent(debouncedQuery)}&type=${encodeURIComponent(type)}&quality=${encodeURIComponent(quality)}`
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
        hasNext,
        limit
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
        mb-6
        flex
        flex-col
        gap-3

        md:flex-row
        md:flex-wrap
    "
            >

                <div
                    className="
            w-full

            md:min-w-[260px]
            md:flex-1
        "
                >
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
            h-12
            w-full
            rounded-xl
            border
            border-zinc-700
            bg-zinc-900
            px-4
            text-sm
            text-white

            md:w-auto
            md:min-w-[180px]
        "
                >
                    <option value="">All Types</option>
                    <option value="Accessory Card">Accessory Card</option>
                    <option value="Armor Card">Armor Card</option>
                    <option value="Garments Card">Garments Card</option>
                    <option value="Headwear Card">Headwear Card</option>
                    <option value="Off Hand Card">Off Hand Card</option>
                    <option value="Shoe Card">Shoe Card</option>
                    <option value="Weapon Card">Weapon Card</option>
                </select>

                <select
                    value={quality}
                    onChange={(event) => setQuality(event.target.value)}
                    className="
            h-12
            w-full
            rounded-xl
            border
            border-zinc-700
            bg-zinc-900
            px-4
            text-sm
            text-white

            md:w-auto
            md:min-w-[160px]
        "
                >
                    <option value="">All Quality</option>
                    <option value="White">White</option>
                    <option value="Green">Green</option>
                    <option value="Blue">Blue</option>
                    <option value="Purple">Purple</option>
                </select>

            </div>

            <div
                className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                    text-sm
                "
            >

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={cards.length}
                />

                <div
                    className="
                        text-zinc-500
                    "
                >
                    Showing {cards.length} cards
                </div>

            </div>

            {cards.length > 0 ? (

                <div
                    className="
        grid
        grid-cols-2
        gap-3

        sm:grid-cols-3

        md:grid-cols-4
        md:gap-5

        lg:grid-cols-5
        xl:grid-cols-6
    "
                >

                    {cards.map((card) => (

                        <CardItem
                            key={card.id}
                            card={card}
                        />

                    ))}

                </div>

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
                        No cards found
                    </h3>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-zinc-500
                        "
                    >
                        Try another search or filter.
                    </p>
                </div>

            )}

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
                            transition-colors

                            hover:border-violet-500/40
                            hover:text-white

                            disabled:pointer-events-none
                            disabled:opacity-40

                            sm:h-12
                            sm:px-5
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
                            transition-colors

                            hover:border-violet-500/40
                            hover:text-white

                            disabled:pointer-events-none
                            disabled:opacity-40

                            sm:h-12
                            sm:px-5
                        "
                    >
                        Next
                    </button>

                </div>

            )}

        </div>
    )
}