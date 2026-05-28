"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import PaginationSearch from "@/components/common/PaginationSearch"
import SearchInput from "@/components/search/SearchInput"
import SearchStatus from "@/components/search/SearchStatus"
import useDebounce from "@/components/search/useDebounce"

import type { Equipment } from "@/lib/types/Equipment"

import EquipmentGrid from "./EquipmentGrid"

type Props = {
    initialEquipments: Equipment[]
    total: number
    page: number
    hasNext: boolean
    initialQuery: string
    initialType: string
    initialQuality: string
    initialStat: string
    initialUnlock: string
    initialDepo: string
    initialSort: string
}

const typeOptions = [
    "",
    "Costume",
    "Weapon Axe",
    "Weapon Book",
    "Weapon Bow",
    "Weapon Dagger",
    "Weapon Katar",
    "Weapon Knuckle",
    "Weapon Mace",
    "Weapon Musical Instrument",
    "Weapon Pistol",
    "Weapon Rifle",
    "Weapon Shuriken",
    "Weapon Spear",
    "Weapon Staff",
    "Weapon Sword",
    "Weapon Whip",
    "Armor",
    "Off Hand",
    "Garment",
    "Shoe",
    "Accessory",
]

const qualityOptions = [
    "",
    "White",
    "Green",
    "Blue",
    "Purple",
]

const statOptions = [
    "",
    "Atk%/Matk%",
    "Atk",
    "Atk Refine",
    "Pen",
    "Matk",
    "Matk Refine",
    "MPen",
    "MDef",
    "Ignore Def",
    "Ignore MDef",
    "PDI",
    "MDmg",
    "Skill Dmg",
    "Skill Dmg Reduc",
    "Mini/MVP Dmg",
    "Hit",
    "HP",
    "SP",
    "Flee",
    "Crit",
    "Movement",
    "Int",
    "Str",
    "Vit",
    "Luk",
    "Agi",
    "Dex",
    "Element (Fire)",
    "Element (Wind)",
    "Element (Earth)",
    "Element (Water)",
    "Element (Ghost)",
    "Element (Neutral)",
    "Element (Shadow)",
    "Element (Holy)",
    "Element (Poison)",
    "Element (Undead)",
    "Race (Plant)",
    "Race (DemiHuman)",
    "Race (Angel)",
    "Race (Brute)",
    "Race (Demon)",
    "Race (Dragon)",
    "Race (Fish)",
    "Race (Formless)",
    "Race (Insect)",
    "Race (Undead)",
    "Size (Small)",
    "Size (Medium)",
    "Size (Large)",
    "VCT",
    "FCT",
    "Cooldown",
    "Skill Delay",
    "Auto Attack",
    "MVP,MINI",
    "AoE",
]

const sortOptions = [
    "Name asc",
    "Name desc",
]

function buildQueryString(params: Record<string, string | number>) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === "" || value === 0) {
            return
        }

        searchParams.set(key, String(value))
    })

    return searchParams.toString()
}

function buildPageUrl({
    page,
    query,
    type,
    quality,
    stat,
    unlock,
    depo,
    sort,
}: {
    page: number
    query: string
    type: string
    quality: string
    stat: string
    unlock: string
    depo: string
    sort: string
}) {
    const qs = buildQueryString({
        page,
        query,
        type,
        quality,
        stat,
        unlock,
        depo,
        sort,
    })

    return qs ? `/equipments?${qs}` : "/equipments"
}

function SelectControl({
    value,
    label,
    options,
    onChange,
}: {
    value: string
    label: string
    options: string[]
    onChange: (value: string) => void
}) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
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
    type,
    quality,
    stat,
    unlock,
    depo,
    sort,
}: {
    page: number
    hasNext: boolean
    query: string
    type: string
    quality: string
    stat: string
    unlock: string
    depo: string
    sort: string
}) {
    const previousUrl = buildPageUrl({
        page: Math.max(1, page - 1),
        query,
        type,
        quality,
        stat,
        unlock,
        depo,
        sort,
    })

    const nextUrl = buildPageUrl({
        page: page + 1,
        query,
        type,
        quality,
        stat,
        unlock,
        depo,
        sort,
    })

    return (
        <div className="flex items-center justify-center gap-3">
            {page > 1 ? (
                <Link
                    href={previousUrl}
                    className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-200
                        transition-colors
                        hover:border-violet-500/40
                        hover:text-white
                    "
                >
                    Previous
                </Link>
            ) : (
                <span
                    className="
                        rounded-xl
                        border
                        border-zinc-900
                        bg-zinc-950/50
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

            <span className="text-sm text-zinc-500">
                Page {page}
            </span>

            {hasNext ? (
                <Link
                    href={nextUrl}
                    className="
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-950
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-zinc-200
                        transition-colors
                        hover:border-violet-500/40
                        hover:text-white
                    "
                >
                    Next
                </Link>
            ) : (
                <span
                    className="
                        rounded-xl
                        border
                        border-zinc-900
                        bg-zinc-950/50
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

export default function EquipmentSearchClient({
    initialEquipments,
    total,
    page,
    hasNext,
    initialQuery,
    initialType,
    initialQuality,
    initialStat,
    initialUnlock,
    initialDepo,
    initialSort,
}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const didMount = useRef(false)

    const [query, setQuery] = useState(initialQuery)
    const [type, setType] = useState(initialType)
    const [quality, setQuality] = useState(initialQuality)
    const [stat, setStat] = useState(initialStat)
    const [unlock, setUnlock] = useState(initialUnlock)
    const [depo, setDepo] = useState(initialDepo)
    const [sort, setSort] = useState(initialSort || "Name asc")

    const debouncedQuery = useDebounce(query, 300)

    const isFiltered = useMemo(() => {
        return Boolean(
            debouncedQuery ||
            type ||
            quality ||
            stat ||
            unlock ||
            depo ||
            sort !== "Name asc"
        )
    }, [
        debouncedQuery,
        type,
        quality,
        stat,
        unlock,
        depo,
        sort,
    ])

    function clearFilters() {
        setQuery("")
        setType("")
        setQuality("")
        setStat("")
        setUnlock("")
        setDepo("")
        setSort("Name asc")

        router.replace("/equipments", {
            scroll: false,
        })
    }

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }

        const qs = buildQueryString({
            query: debouncedQuery,
            type,
            quality,
            stat,
            unlock,
            depo,
            sort,
            page: 1,
        })

        router.replace(qs ? `${pathname}?${qs}` : pathname, {
            scroll: false,
        })
    }, [
        debouncedQuery,
        type,
        quality,
        stat,
        unlock,
        depo,
        sort,
        pathname,
        router,
    ])

    return (
        <div className="space-y-6">
            <div
                className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-4
                "
            >
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                    <div className="xl:col-span-4">
                        <SearchInput
                            value={query}
                            onChange={setQuery}
                            placeholder="Search equipments..."
                        />
                    </div>

                    <div className="xl:col-span-2">
                        <SelectControl
                            value={type}
                            label="Type"
                            options={typeOptions}
                            onChange={setType}
                        />
                    </div>

                    <div className="xl:col-span-2">
                        <SelectControl
                            value={quality}
                            label="Quality"
                            options={qualityOptions}
                            onChange={setQuality}
                        />
                    </div>

                    <div className="xl:col-span-2">
                        <SelectControl
                            value={sort}
                            label="Sort"
                            options={sortOptions}
                            onChange={setSort}
                        />
                    </div>

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
                            xl:col-span-2
                        "
                    >
                        Clear
                    </button>

                    <div className="xl:col-span-4">
                        <SelectControl
                            value={stat}
                            label="Effect stat"
                            options={statOptions}
                            onChange={setStat}
                        />
                    </div>

                    <div className="xl:col-span-4">
                        <SelectControl
                            value={unlock}
                            label="Unlock stat"
                            options={statOptions}
                            onChange={setUnlock}
                        />
                    </div>

                    <div className="xl:col-span-4">
                        <SelectControl
                            value={depo}
                            label="Deposit stat"
                            options={statOptions}
                            onChange={setDepo}
                        />
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
                    loading={false}
                    count={initialEquipments.length}
                />

                <div className="text-zinc-500">
                    {total.toLocaleString()} equipments archived
                </div>
            </div>

            <EquipmentGrid equipments={initialEquipments} />

            {isFiltered ? (
                <FilterPagination
                    page={page}
                    hasNext={hasNext}
                    query={debouncedQuery}
                    type={type}
                    quality={quality}
                    stat={stat}
                    unlock={unlock}
                    depo={depo}
                    sort={sort}
                />
            ) : (
                <PaginationSearch
                    page={page}
                    total={total}
                    basePath="/equipments"
                />
            )}
        </div>
    )
}