import Image from "next/image"
import Link from "next/link"

import type {
    Monster
} from "@/lib/types/Monster"

type Props = {

    monster: Monster
}

function elementClass(
    element: string | null
) {
    switch (element) {
        case "Fire":
            return "border-red-500/25 bg-red-500/10 text-red-300"
        case "Water":
            return "border-sky-500/25 bg-sky-500/10 text-sky-300"
        case "Earth":
            return "border-amber-500/25 bg-amber-500/10 text-amber-300"
        case "Wind":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
        case "Shadow":
        case "Undead (Element)":
            return "border-violet-500/25 bg-violet-500/10 text-violet-300"
        case "Holy":
            return "border-yellow-300/25 bg-yellow-300/10 text-yellow-200"
        case "Poison":
            return "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300"
        case "Ghost":
            return "border-indigo-500/25 bg-indigo-500/10 text-indigo-300"
        default:
            return "border-zinc-700 bg-zinc-900 text-zinc-300"
    }
}

function normalizeImage(
    image: string | null
) {

    if (!image) {

        return "/placeholder.png"
    }

    return image
        .replace("https://romhandbook.com", "")
        .replace("http://romhandbook.com", "")
}

function CompactStat({
    label,
    value
}: {
    label: string
    value: string | number | null
}) {

    return (
        <div
            className="
                min-w-[68px]
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-3
                py-2
            "
        >
            <div
                className="
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-zinc-500
                "
            >
                {label}
            </div>

            <div
                className="
                    mt-0.5
                    truncate
                    text-sm
                    font-bold
                    text-white
                "
            >
                {value || "-"}
            </div>
        </div>
    )
}

function Chip({
    children,
    className = ""
}: {
    children: React.ReactNode
    className?: string
}) {

    return (
        <span
            className={`
                rounded-full
                border
                px-3
                py-1
                text-xs
                ${className}
            `}
        >
            {children}
        </span>
    )
}

export default function MonsterCard({
    monster
}: Props) {

    return (

        <Link
            href={monster.detail_url}
            className="
                group
                relative
                block
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-zinc-950
                via-zinc-900
                to-black
                p-4
                transition-all
                hover:-translate-y-0.5
                hover:border-violet-500/40
                hover:shadow-xl
                hover:shadow-violet-500/10
            "
        >

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-0
                    transition-opacity
                    group-hover:opacity-100
                    bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_42%)]
                "
            />

            <div
                className="
                    relative
                    z-10
                    grid
                    gap-4
                    lg:grid-cols-[minmax(0,1fr)_auto]
                    lg:items-center
                "
            >

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-4
                    "
                >
                    <div
                        className="
                            relative
                            h-16
                            w-16
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            border
                            border-white/10
                            bg-black/40
                        "
                    >
                        <Image
                            src={normalizeImage(monster.image)}
                            alt={monster.name}
                            fill
                            sizes="64px"
                            className="
                                object-cover
                                transition-transform
                                duration-300
                                group-hover:scale-110
                            "
                        />
                    </div>

                    <div className="min-w-0">

                        <h2
                            className="
                                line-clamp-1
                                text-lg
                                font-black
                                text-violet-200
                            "
                        >
                            {monster.name}
                        </h2>

                        <p
                            className="
                                mt-1
                                line-clamp-1
                                text-sm
                                text-zinc-400
                            "
                        >
                            {monster.race || "Unknown Race"}
                            {" · "}
                            {monster.element || "Unknown Element"}
                            {" · "}
                            {monster.size || "Unknown Size"}
                        </p>

                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                gap-2
                            "
                        >
                            <Chip className={elementClass(monster.element)}>
                                {monster.element || "Neutral"}
                            </Chip>

                            <Chip
                                className="
                                    border-violet-500/20
                                    bg-violet-500/10
                                    text-violet-300
                                "
                            >
                                {monster.race || "Unknown"}
                            </Chip>

                            <Chip
                                className="
                                    border-zinc-700
                                    bg-zinc-900
                                    text-zinc-300
                                "
                            >
                                {monster.size || "Size ?"}
                            </Chip>

                        </div>

                    </div>
                </div>

                <div
                    className="
                        grid
                        grid-cols-2
                        gap-2
                        sm:grid-cols-5
                        lg:flex
                        lg:justify-end
                    "
                >
                    <CompactStat
                        label="Lv"
                        value={monster.level}
                    />

                    <CompactStat
                        label="HP"
                        value={monster.hp}
                    />

                    <CompactStat
                        label="Base"
                        value={monster.base_exp}
                    />

                    <CompactStat
                        label="Job"
                        value={monster.job_exp}
                    />

                    <CompactStat
                        label="ID"
                        value={monster.id}
                    />
                </div>

            </div>

        </Link>
    )
}