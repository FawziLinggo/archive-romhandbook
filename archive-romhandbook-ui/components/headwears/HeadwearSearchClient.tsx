"use client"

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition
} from "react"

import {
    usePathname,
    useRouter
} from "next/navigation"

import type {
    Headwear
} from "@/lib/types/Headwear"

import PaginationSearch from "@/components/common/PaginationSearch"
import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import HeadwearGrid from "./HeadwearGrid"

type Props = {

    initialHeadwears: Headwear[]

    total: number

    page: number

    hasNext: boolean

    initialQuery: string

    initialPosition: string

    initialStat: string

    initialUnlock: string

    initialDepo: string

    initialSort: string

}

const positions = [
    "",
    "Headwear",
    "Face",
    "Mouth",
    "Back",
    "Tail",
]

const statOptions = [
    "",
    "Atk",
    "Matk",
    "Atk%/Matk%",
    "Ignore Def",
    "Ignore MDef",
    "Pen",
    "MPen",
    "PDI",
    "MDmg",
    "Skill Dmg",
    "HP",
    "SP",
    "Crit",
    "Movement",
    "Str",
    "Agi",
    "Vit",
    "Int",
    "Dex",
    "Luk",
]

const sortOptions = [
    "Name asc",
    "Name desc",
]

function buildQueryString(
    params: Record<string, string | number>
) {

    const searchParams =
        new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {

        if (value === "" || value === 0) {
            return
        }

        searchParams.set(
            key,
            String(value)
        )
    })

    return searchParams.toString()
}

function SelectControl({
    value,
    label,
    options,
    onChange
}: {
    value: string
    label: string
    options: string[]
    onChange: (value: string) => void
}) {

    return (

        <select
            value={value}
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
            {options.map((item) => (

                <option
                    key={item || label}
                    value={item}
                >
                    {item || label}
                </option>

            ))}
        </select>

    )
}

function FilterPagination({
    page,
    hasNext,
    query,
    position,
    stat,
    unlock,
    depo,
    sort
}: {
    page: number
    hasNext: boolean
    query: string
    position: string
    stat: string
    unlock: string
    depo: string
    sort: string
}) {

    function buildPageUrl(
        nextPage: number
    ) {
        const qs =
            buildQueryString({
                page: nextPage,
                query,
                position,
                stat,
                unlock,
                depo,
                sort,
            })

        return `/headwears?${qs}`
    }

    return (

        <div
            className="
                flex
                items-center
                justify-center
                gap-3
                pt-2
            "
        >

            {page > 1 ? (

                <a
                    href={buildPageUrl(page - 1)}
                    className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-300
                        transition-colors
                        hover:border-violet-500/40
                        hover:text-white
                    "
                >
                    Previous
                </a>

            ) : (

                <span
                    className="
                        rounded-xl
                        border
                        border-zinc-900
                        bg-zinc-950/40
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-700
                    "
                >
                    Previous
                </span>

            )}

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
                Page {page}
            </div>

            {hasNext ? (

                <a
                    href={buildPageUrl(page + 1)}
                    className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-300
                        transition-colors
                        hover:border-violet-500/40
                        hover:text-white
                    "
                >
                    Next
                </a>

            ) : (

                <span
                    className="
                        rounded-xl
                        border
                        border-zinc-900
                        bg-zinc-950/40
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-700
                    "
                >
                    Next
                </span>

            )}

        </div>

    )
}

export default function HeadwearSearchClient({

    initialHeadwears,
    total,
    page,
    hasNext,
    initialQuery,
    initialPosition,
    initialStat,
    initialUnlock,
    initialDepo,
    initialSort

}: Props) {

    const router =
        useRouter()

    const pathname =
        usePathname()

    const [
        isPending,
        startTransition
    ] = useTransition()

    const didMount =
        useRef(false)

    const [query, setQuery] =
        useState(initialQuery)

    const [position, setPosition] =
        useState(initialPosition)

    const [stat, setStat] =
        useState(initialStat)

    const [unlock, setUnlock] =
        useState(initialUnlock)

    const [depo, setDepo] =
        useState(initialDepo)

    const [sort, setSort] =
        useState(initialSort || "Name asc")

    const debouncedQuery =
        useDebounce(query, 300)

    const isFiltered =
        useMemo(() => {

            return Boolean(
                debouncedQuery ||
                position ||
                stat ||
                unlock ||
                depo ||
                sort !== "Name asc"
            )

        }, [
            debouncedQuery,
            position,
            stat,
            unlock,
            depo,
            sort
        ])

    useEffect(() => {

        if (!didMount.current) {

            didMount.current = true

            return
        }

        const qs =
            buildQueryString({
                query: debouncedQuery,
                position,
                stat,
                unlock,
                depo,
                sort,
                page: 1,
            })

        const nextUrl =
            qs
                ? `${pathname}?${qs}`
                : pathname

        startTransition(() => {

            router.replace(
                nextUrl,
                {
                    scroll: false
                }
            )

        })

    }, [
        debouncedQuery,
        position,
        stat,
        unlock,
        depo,
        sort,
        pathname,
        router
    ])

    function clearFilters() {

        setQuery("")
        setPosition("")
        setStat("")
        setUnlock("")
        setDepo("")
        setSort("Name asc")

        startTransition(() => {

            router.replace(
                "/headwears",
                {
                    scroll: false
                }
            )

        })
    }

    return (

        <div
            className="
                space-y-6
            "
        >

            <div
                className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-4
                "
            >

                <div
                    className="
                        space-y-3
                    "
                >

                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        placeholder="Search headwears..."
                    />

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            md:grid-cols-2
                            xl:grid-cols-6
                        "
                    >
                        <SelectControl
                            value={position}
                            label="Position"
                            options={positions}
                            onChange={setPosition}
                        />

                        <SelectControl
                            value={stat}
                            label="Stat"
                            options={statOptions}
                            onChange={setStat}
                        />

                        <SelectControl
                            value={unlock}
                            label="Unlock"
                            options={statOptions}
                            onChange={setUnlock}
                        />

                        <SelectControl
                            value={depo}
                            label="Deposit"
                            options={statOptions}
                            onChange={setDepo}
                        />

                        <SelectControl
                            value={sort}
                            label="Sort"
                            options={sortOptions}
                            onChange={setSort}
                        />

                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={!isFiltered}
                            className="
                                h-12
                                rounded-xl
                                border
                                border-zinc-800
                                bg-black
                                px-4
                                text-sm
                                font-semibold
                                text-zinc-300
                                transition-colors
                                hover:border-violet-500/40
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            Clear
                        </button>

                    </div>

                </div>

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
                    loading={isPending}
                    count={initialHeadwears.length}
                />

                <div
                    className="
                        text-zinc-500
                    "
                >
                    {total.toLocaleString()} headwears archived
                </div>
            </div>

            <HeadwearGrid
                headwears={initialHeadwears}
            />

            {isFiltered ? (

                <FilterPagination
                    page={page}
                    hasNext={hasNext}
                    query={debouncedQuery}
                    position={position}
                    stat={stat}
                    unlock={unlock}
                    depo={depo}
                    sort={sort}
                />

            ) : (

                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/headwears"
                />

            )}

        </div>

    )
}