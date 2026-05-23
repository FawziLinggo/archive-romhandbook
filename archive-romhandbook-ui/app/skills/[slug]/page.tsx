import {
    notFound
} from "next/navigation"

import {
    getSkillBySlug
} from "@/lib/queries/skills"

type Props = {

    params: Promise<{

        slug: string

    }>

}

export default async function SkillDetailPage({

    params

}: Props) {

    // =====================
    // PARAMS
    // =====================

    const {
        slug
    } = await params

    // =====================
    // GET SKILL
    // =====================

    const skill =
        getSkillBySlug(slug)

    // =====================
    // NOT FOUND
    // =====================

    if (!skill) {

        notFound()

    }

    // =====================
    // AESIR
    // =====================

    const aesirs: string[] =
        skill.aesir_raw
            ? JSON.parse(
                skill.aesir_raw
            )
            : []




    return (

        <div
            className="
                mx-auto
                max-w-7xl

                px-6
                py-10
            "
        >

            {/* HERO */}
            <div
                className="
                    rounded-3xl
                    border
                    border-zinc-800

                    bg-zinc-950/60

                    p-8
                "
            >

                <div
                    className="
                        flex
                        items-start
                        gap-6
                    "
                >

                    {/* IMAGE */}
                    <img
                        src={skill.image}
                        alt={skill.name}
                        className="
                            h-24
                            w-24

                            rounded-2xl
                            border
                            border-zinc-700

                            object-cover
                        "
                    />

                    {/* INFO */}
                    <div
                        className="
                            flex-1
                        "
                    >

                        <h1
                            className="
                                text-4xl
                                font-black
                                tracking-tight

                                text-white
                            "
                        >

                            {skill.name}

                        </h1>

                        <div
                            className="
                                mt-4
                                flex
                                flex-wrap
                                gap-2
                            "
                        >

                            <span
                                className="
                                    rounded-full
                                    bg-violet-500/10

                                    px-3
                                    py-1

                                    text-sm
                                    text-violet-300
                                "
                            >
                                Lv {skill.max_level}
                            </span>

                            <span
                                className="
                                    rounded-full
                                    bg-emerald-500/10

                                    px-3
                                    py-1

                                    text-sm
                                    text-emerald-300
                                "
                            >
                                {skill.skill_type}
                            </span>

                            {skill.damage_type && (

                                <span
                                    className="
                                        rounded-full
                                        bg-sky-500/10

                                        px-3
                                        py-1

                                        text-sm
                                        text-sky-300
                                    "
                                >
                                    {skill.damage_type}
                                </span>

                            )}

                        </div>

                        {/* DESCRIPTION */}
                        <p
                            className="
                                mt-6

                                max-w-4xl

                                text-lg
                                leading-8

                                text-zinc-300
                            "
                        >

                            {skill.description}

                        </p>

                        {/* META */}
                        <div
                            className="
        mt-4

        flex
        flex-wrap
        gap-2
    "
                        >

                            {skill.cooldown && (

                                <div
                                    className="
                rounded-md

                border
                border-cyan-500/20

                bg-cyan-500/10

                px-3
                py-1

                text-sm
                text-cyan-300
            "
                                >

                                    CD: {skill.cooldown}

                                </div>

                            )}

                            {skill.range_value && (

                                <div
                                    className="
                rounded-md

                border
                border-violet-500/20

                bg-violet-500/10

                px-3
                py-1

                text-sm
                text-violet-300
            "
                                >

                                    Range: {skill.range_value}

                                </div>

                            )}

                            {skill.cast_time && (

                                <div
                                    className="
                rounded-md

                border
                border-yellow-500/20

                bg-yellow-500/10

                px-3
                py-1

                text-sm
                text-yellow-300
            "
                                >

                                    Cast: {skill.cast_time}

                                </div>

                            )}

                            {skill.fixed_cast_time && (

                                <div
                                    className="
                rounded-md

                border
                border-orange-500/20

                bg-orange-500/10

                px-3
                py-1

                text-sm
                text-orange-300
            "
                                >

                                    Fixed: {skill.fixed_cast_time}

                                </div>

                            )}

                        </div>



                    </div>

                </div>

            </div>



            {/* LEVELS */}
            {
                skill.levels.length > 0 && (

                    <div
                        className="
            mt-8

            rounded-3xl
            border
            border-zinc-800

            bg-zinc-950/50

            p-8
        "
                    >

                        <h2
                            className="
                text-2xl
                font-bold

                text-white
            "
                        >
                            Skill Levels
                        </h2>

                        <div
                            className="
                mt-6
                space-y-4
            "
                        >



                            {skill.levels.map((level) => {

                                const tags: string[] =
                                    level.raw_tags
                                        ? JSON.parse(
                                            level.raw_tags
                                        )
                                        : []

                                return (

                                    <div
                                        key={level.level}
                                        className="
                border-b
                border-zinc-800/80

                px-6
                py-5

                transition-colors

                hover:bg-zinc-900/40
            "
                                    >

                                        {/* TAGS */}
                                        <div
                                            className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                "
                                        >

                                            {tags.map((
                                                tag,
                                                index
                                            ) => (

                                                <div
                                                    key={index}
                                                    className={`
    rounded-md

    border

    px-2
    py-1

    text-xs
    font-medium

    ${tag.includes("Attack")

                                                            ? `
            border-red-500/20
            bg-red-500/10
            text-red-300
        `

                                                            : tag.includes("Buff")

                                                                ? `
                border-emerald-500/20
                bg-emerald-500/10
                text-emerald-300
            `

                                                                : tag.includes("Physical")

                                                                    ? `
                    border-orange-500/20
                    bg-orange-500/10
                    text-orange-300
                `

                                                                    : tag.includes("Magic")

                                                                        ? `
                        border-sky-500/20
                        bg-sky-500/10
                        text-sky-300
                    `

                                                                        : tag.includes("Range")

                                                                            ? `
                            border-violet-500/20
                            bg-violet-500/10
                            text-violet-300
                        `

                                                                            : tag.includes("CD")

                                                                                ? `
                                border-cyan-500/20
                                bg-cyan-500/10
                                text-cyan-300
                            `

                                                                                : tag.includes("SP")

                                                                                    ? `
                                    border-fuchsia-500/20
                                    bg-fuchsia-500/10
                                    text-fuchsia-300
                                `

                                                                                    : tag.includes("Cast")

                                                                                        ? `
                                        border-yellow-500/20
                                        bg-yellow-500/10
                                        text-yellow-300
                                    `

                                                                                        : `
                                        border-zinc-700
                                        bg-zinc-900
                                        text-zinc-300
                                    `
                                                        }
`}
                                                >

                                                    {tag}

                                                </div>

                                            ))}

                                        </div>



                                        {/* DESCRIPTION */}
                                        <p
                                            className="
                    mt-4

                    leading-8

                    text-zinc-300
                "
                                        >

                                            {level.description}

                                        </p>

                                    </div>

                                )

                            })}

                        </div>

                    </div>

                )
            }

            {/* AESIR */}
            {aesirs.length > 0 && (

                <div
                    className="
                        mt-8

                        rounded-3xl
                        border
                        border-violet-500/20

                        bg-violet-500/5

                        p-8
                    "
                >

                    <h2
                        className="
                            text-2xl
                            font-bold

                            text-violet-300
                        "
                    >
                        Aesir Effects
                    </h2>

                    <div
                        className="
                            mt-6
                            space-y-4
                        "
                    >

                        {aesirs.map((
                            item,
                            index
                        ) => (

                            <div
                                key={index}
                                className="
                                    rounded-2xl

                                    border
                                    border-violet-500/10

                                    bg-black/30

                                    p-5

                                    text-zinc-300
                                    leading-7
                                "
                            >

                                {item}

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </div>

    )

}