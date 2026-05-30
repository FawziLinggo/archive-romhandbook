import { assetUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type Props = {

    skill: {

        id: string

        detail_url: string

        image: string

        name: string

        max_level: number

        skill_type: string

        damage_type: string

        cooldown: string

        range_value: string

        cast_time: string

        description: string

    }

}

export default function SkillCard({

    skill

}: Props) {

    // =====================
    // TAG COLOR
    // =====================

    function getTagStyle(
        type?: string
    ) {

        const value =
            type?.toLowerCase() || ""

        // =====================
        // ATTACK
        // =====================

        if (
            value.includes("attack")
        ) {

            return `
                border-red-500/20
                bg-red-500/10
                text-red-300
            `

        }

        // =====================
        // PASSIVE
        // =====================

        if (
            value.includes("passive")
        ) {

            return `
                border-emerald-500/20
                bg-emerald-500/10
                text-emerald-300
            `

        }

        // =====================
        // MAGIC
        // =====================

        if (
            value.includes("magic")
        ) {

            return `
                border-sky-500/20
                bg-sky-500/10
                text-sky-300
            `

        }

        // =====================
        // BUFF
        // =====================

        if (
            value.includes("buff")
        ) {

            return `
                border-violet-500/20
                bg-violet-500/10
                text-violet-300
            `

        }

        // =====================
        // DEFAULT
        // =====================

        return `
            border-zinc-700
            bg-zinc-800/50
            text-zinc-300
        `

    }

    return (

        <Link
            href={`/skills/${skill.detail_url}`}
            className="
                group

                relative

                overflow-hidden

                rounded-3xl

                border
                border-zinc-800

                bg-gradient-to-b
                from-zinc-950
                to-black

                p-6

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-violet-500/40
                hover:shadow-2xl
                hover:shadow-violet-500/10
            "
        >

            {/* GLOW */}
            <div
                className="
                    pointer-events-none

                    absolute
                    inset-0

                    bg-gradient-to-br
                    from-violet-500/0
                    via-violet-500/0
                    to-fuchsia-500/0

                    opacity-0

                    transition-opacity
                    duration-300

                    group-hover:opacity-100
                    group-hover:from-violet-500/5
                    group-hover:to-fuchsia-500/5
                "
            />

            {/* HEADER */}
            <div
                className="
                    relative

                    flex
                    items-start
                    gap-4
                "
            >

                {/* ICON */}
                <div
                    className="
                        relative

                        h-16
                        w-16

                        overflow-hidden

                        rounded-2xl

                        border
                        border-zinc-800

                        bg-zinc-900
                    "
                >

                    <Image
                        src={assetUrl(skill.image)}
                        alt={skill.name}
                        fill

                        sizes="
        (max-width: 768px) 100vw,
        (max-width: 1280px) 50vw,
        33vw
    "

                        className="
        object-cover
    "
                    />

                </div>

                {/* INFO */}
                <div className="flex-1">

                    <h3
                        className="
                            text-2xl
                            font-black

                            text-white

                            transition-colors

                            group-hover:text-violet-300
                        "
                    >

                        {skill.name}

                    </h3>

                    <div
                        className="
                            mt-2

                            flex
                            flex-wrap
                            items-center
                            gap-2
                        "
                    >

                        {/* LEVEL */}
                        <div
                            className="
                                rounded-full

                                border
                                border-zinc-700

                                bg-zinc-900

                                px-3
                                py-1

                                text-xs
                                text-zinc-300
                            "
                        >

                            Lv {skill.max_level}

                        </div>

                        {/* SKILL TYPE */}
                        <div
                            className={`
                                rounded-full
                                border

                                px-3
                                py-1

                                text-xs

                                ${getTagStyle(
                                skill.skill_type
                            )}
                            `}
                        >

                            {skill.skill_type}

                        </div>

                        {/* DAMAGE TYPE */}
                        {skill.damage_type && (

                            <div
                                className={`
                                    rounded-full
                                    border

                                    px-3
                                    py-1

                                    text-xs

                                    ${getTagStyle(
                                    skill.damage_type
                                )}
                                `}
                            >

                                {skill.damage_type}

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* DESCRIPTION */}
            <p
                className="
                    relative

                    mt-6

                    line-clamp-3

                    text-sm
                    leading-7

                    text-zinc-400
                "
            >

                {skill.description}

            </p>
            {/* STATS */}
            <div
                className="
                    relative

                    mt-6

                    flex
                    flex-wrap
                    gap-2
                "
            >

                {/* COOLDOWN */}
                {skill.cooldown && (

                    <div
                        className="
                            rounded-xl

                            border
                            border-zinc-800

                            bg-zinc-900/70

                            px-3
                            py-2

                            text-xs
                            text-zinc-300
                        "
                    >

                        Cooldown: {skill.cooldown}

                    </div>

                )}

                {/* RANGE */}
                {skill.range_value && (

                    <div
                        className="
                            rounded-xl

                            border
                            border-zinc-800

                            bg-zinc-900/70

                            px-3
                            py-2

                            text-xs
                            text-zinc-300
                        "
                    >

                        Range: {skill.range_value}

                    </div>

                )}

                {/* CAST */}
                {skill.cast_time && (

                    <div
                        className="
                            rounded-xl

                            border
                            border-zinc-800

                            bg-zinc-900/70

                            px-3
                            py-2

                            text-xs
                            text-zinc-300
                        "
                    >

                        Cast: {skill.cast_time}

                    </div>

                )}

            </div>



        </Link>

    )

}