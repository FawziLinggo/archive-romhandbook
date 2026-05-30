"use client"

import Link from "next/link"

import {
    Search
} from "lucide-react"

import {
    useEffect,
    useState
} from "react"

import useDebounce from "@/components/search/useDebounce"
import { assetUrl } from "@/lib/utils"

type Props = {

    onSearchActiveChange?: (active: boolean) => void
}

type SearchResult = {

    type: string

    label: string

    href: string

    image: string | null

    description: string | null
}

type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown
}


export default function HomeGlobalSearch({
    onSearchActiveChange
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
        results,
        setResults
    ] = useState<SearchResult[]>([])

    const debouncedQuery =
        useDebounce(query, 250)

    const searchActive =
        query.trim().length >= 2

    useEffect(() => {

        onSearchActiveChange?.(searchActive)

    }, [
        searchActive,
        onSearchActiveChange
    ])

    useEffect(() => {

        if (debouncedQuery.trim().length < 2) {
            setResults([])
            return
        }

        setLoading(true)

        async function searchArchive() {

            try {

                const API_URL =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://127.0.0.1:8080"

                const res =
                    await fetch(
                        `${API_URL}/api/v1/search?query=${encodeURIComponent(debouncedQuery)}&limit=30`
                    )

                if (!res.ok) {
                    throw new Error("Search failed")
                }

                const response =
                    await res.json() as ApiResponse<SearchResult[]>

                setResults(response.data)

            } catch (err) {
                setResults([])

            } finally {

                setLoading(false)
            }
        }

        searchArchive()

    }, [
        debouncedQuery
    ])

    return (

        <div className="space-y-3">

            <div
                className="
                    relative
                "
            >
                <Search
                    size={18}
                    className="
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-zinc-500

                        md:left-5
                        md:size-[22px]
                    "
                />

                <input
                    type="text"
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                    placeholder="Search cards, monsters, skills, jobs..."
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-zinc-700
                        bg-zinc-900/80
                        px-12
                        py-4
                        text-base
                        text-white
                        outline-none
                        transition-all

                        focus:border-violet-500
                        focus:ring-4
                        focus:ring-violet-500/20

                        md:rounded-3xl
                        md:px-14
                        md:py-5
                        md:text-lg
                    "
                />
            </div>

            {searchActive && (

                <div
                    className="
                        max-h-[52vh]
                        overflow-y-auto

                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        p-2
                        text-left
                        shadow-2xl
                        shadow-black/40

                        sm:max-h-[460px]
                    "
                >
                    {loading && (

                        <div
                            className="
                                px-4
                                py-5
                                text-sm
                                text-zinc-400
                            "
                        >
                            Searching archive...
                        </div>

                    )}

                    {!loading && results.length === 0 && (

                        <div
                            className="
                                px-4
                                py-5
                                text-sm
                                text-zinc-400
                            "
                        >
                            No results found.
                        </div>

                    )}

                    {!loading && results.map((result, index) => (

                        <Link
                            key={`${result.type}-${result.href}-${index}`}
                            href={result.href}
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                transition-colors

                                hover:bg-white/5
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-zinc-800
                                    bg-black
                                "
                            >
                                {result.image ? (

                                    <img
                                        src={assetUrl(result.image)}
                                        alt={result.label}
                                        className="
                                            h-8
                                            w-8
                                            object-contain
                                        "
                                    />

                                ) : (

                                    <Search
                                        size={18}
                                        className="
                                            text-zinc-500
                                        "
                                    />

                                )}
                            </div>

                            <div className="min-w-0 flex-1">

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >
                                    <span
                                        className="
                                            truncate
                                            text-sm
                                            font-bold
                                            text-white
                                        "
                                    >
                                        {result.label}
                                    </span>

                                    <span
                                        className="
                                            rounded-full
                                            bg-violet-500/10
                                            px-2
                                            py-0.5
                                            text-[11px]
                                            font-semibold
                                            text-violet-300
                                        "
                                    >
                                        {result.type}
                                    </span>
                                </div>

                                {result.description && (

                                    <p
                                        className="
                                            mt-1
                                            line-clamp-1
                                            text-xs
                                            text-zinc-500
                                        "
                                    >
                                        {result.description}
                                    </p>

                                )}

                            </div>
                        </Link>

                    ))}

                </div>

            )}

        </div>
    )
}