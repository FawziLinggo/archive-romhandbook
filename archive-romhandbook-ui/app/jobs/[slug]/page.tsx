import Link from "next/link"

import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"

import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetch } from "@/lib/server-api"
import type {
    JobDetail,
    JobRelation,
    JobRune,
    JobSkill
} from "@/lib/types/Job"
import { assetUrl } from "@/lib/utils"

type Props = {

    params: Promise<{
        slug: string
    }>
}

function parseJsonArray(
    value: string | null
): string[] {

    try {

        const parsed =
            JSON.parse(value || "[]")

        return Array.isArray(parsed)
            ? parsed
            : []

    } catch {

        return []
    }
}

function RelationLinks({
    title,
    relations
}: {
    title: string
    relations: JobRelation[]
}) {

    if (relations.length === 0) {
        return null
    }

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-5
            "
        >
            <div
                className="
                    text-sm
                    font-bold
                    text-emerald-300
                "
            >
                {title}
            </div>

            <div
                className="
                    flex
                    flex-wrap
                    gap-2

                    sm:col-span-4
                "
            >
                {relations.map((relation) => (

                    <Link
                        key={`${relation.relation_type}-${relation.related_slug}`}
                        href={`/jobs/${relation.related_slug}`}
                        className="
                            rounded-full
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-3
                            py-1
                            text-sm
                            text-zinc-200
                            transition-colors

                            hover:border-emerald-500/40
                            hover:text-emerald-300
                        "
                    >
                        {relation.related_name}
                    </Link>

                ))}
            </div>
        </div>
    )
}

function SkillCard({
    skill
}: {
    skill: JobSkill
}) {

    const tags =
        parseJsonArray(skill.tags_raw)

    const aesir =
        parseJsonArray(skill.aesir_raw)

    return (

        <Link
            href={skill.skill_url || "#"}
            className="
                block
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-4
                transition-colors

                hover:border-violet-500/40
                hover:bg-zinc-900
            "
        >
            <div className="flex gap-3">

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
                        border-white/10
                        bg-black
                    "
                >
                    {skill.skill_image && (

                        <img
                            src={assetUrl(skill.skill_image)}
                            alt={skill.skill_name || "Skill"}
                            className="
                                h-8
                                w-8
                                object-contain
                            "
                        />

                    )}
                </div>

                <div className="min-w-0 flex-1">

                    <h3
                        className="
                            text-sm
                            font-bold
                            text-white
                        "
                    >
                        {skill.skill_name}
                    </h3>

                    {skill.description && (

                        <p
                            className="
                                mt-2
                                line-clamp-3
                                text-sm
                                leading-6
                                text-zinc-400
                            "
                        >
                            {skill.description}
                        </p>

                    )}

                </div>

            </div>

            {tags.length > 0 && (

                <div
                    className="
                        mt-4
                        flex
                        flex-wrap
                        gap-2
                    "
                >
                    {tags.slice(0, 8).map((tag) => (

                        <span
                            key={tag}
                            className="
                                rounded-full
                                bg-zinc-800
                                px-2
                                py-1
                                text-xs
                                text-zinc-300
                            "
                        >
                            {tag}
                        </span>

                    ))}
                </div>

            )}

            {aesir.length > 0 && (

                <div
                    className="
                        mt-4
                        space-y-1
                    "
                >
                    <div
                        className="
                            text-xs
                            font-bold
                            uppercase
                            text-emerald-400
                        "
                    >
                        Aesir
                    </div>

                    {aesir.slice(0, 2).map((item) => (

                        <p
                            key={item}
                            className="
                                text-xs
                                leading-5
                                text-zinc-400
                            "
                        >
                            {item}
                        </p>

                    ))}
                </div>

            )}

        </Link>
    )
}

function RuneCard({
    rune
}: {
    rune: JobRune
}) {

    const tags =
        parseJsonArray(rune.tags_raw)

    const effects =
        parseJsonArray(rune.effects_raw)

    return (

        <Link
            href={rune.rune_url || "#"}
            className="
                block
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-4
                transition-colors

                hover:border-amber-500/40
                hover:bg-zinc-900
            "
        >
            <div className="flex gap-3">

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
                        border-white/10
                        bg-black
                    "
                >
                    {rune.rune_image && (

                        <img
                            src={assetUrl(rune.rune_image)}
                            alt={rune.rune_name || "Rune"}
                            className="
                                h-8
                                w-8
                                object-contain
                            "
                        />

                    )}
                </div>

                <div className="min-w-0 flex-1">

                    <h3
                        className="
                            text-sm
                            font-bold
                            text-white
                        "
                    >
                        {rune.rune_name}
                    </h3>

                    {tags.length > 0 && (

                        <div
                            className="
                                mt-2
                                flex
                                flex-wrap
                                gap-2
                            "
                        >
                            {tags.map((tag, index) => (

                                <span
                                    key={`${tag}-${index}`}
                                    className="
            rounded-full
            bg-zinc-800
            px-2
            py-1
            text-xs
            text-zinc-300
        "
                                >
                                    {tag}
                                </span>

                            ))}
                        </div>

                    )}

                </div>

            </div>

            {effects.length > 0 && (

                <div
                    className="
                        mt-4
                        space-y-2
                    "
                >
                    {effects.slice(0, 3).map((effect, index) => (

                        <p
                            key={`${effect}-${index}`}
                            className="
            text-xs
            leading-5
            text-zinc-400
        "
                        >
                            {effect}
                        </p>

                    ))}
                </div>

            )}

        </Link>
    )
}

export default async function JobDetailPage({
    params
}: Props) {

    const {
        slug
    } = await params

    const result =
        await serverApiFetch<JobDetail>(
            `/api/v1/jobs/${slug}`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/jobs"
            />
        )
    }

    const job =
        result.data

    const previous =
        job.relations.filter(
            (relation) => relation.relation_type === "previous"
        )

    const next =
        job.relations.filter(
            (relation) => relation.relation_type === "next"
        )

    const mainSkills =
        job.skills.filter(
            (skill) => skill.section === "Skills"
        )

    const otherSkills =
        job.skills.filter(
            (skill) => skill.section !== "Skills"
        )

    return (

        <main
            className="
                mx-auto
                w-full
                max-w-7xl
                space-y-8
            "
        >
            <section
                className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-5

                    sm:p-6
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >
                    <div
                        className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-white/10
                            bg-black
                        "
                    >
                        {job.image && (

                            <img
                                src={assetUrl(job.image)}
                                alt={job.name}
                                className="
                                    h-11
                                    w-11
                                    object-contain
                                "
                            />

                        )}
                    </div>

                    <div className="min-w-0">

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-emerald-400
                            "
                        >
                            Job Class
                        </p>

                        <h1
                            className="
                                mt-1
                                text-3xl
                                font-black
                                tracking-tight
                                text-white

                                sm:text-4xl
                            "
                        >
                            {job.name}
                        </h1>

                    </div>
                </div>

                <div
                    className="
                        mt-6
                        space-y-4
                    "
                >
                    <RelationLinks
                        title="Previous"
                        relations={previous}
                    />

                    <RelationLinks
                        title="Next"
                        relations={next}
                    />
                </div>
            </section>

            <section
                className="
                    grid
                    grid-cols-1
                    gap-6

                    lg:grid-cols-2
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-5
                    "
                >
                    <h2
                        className="
                            text-xl
                            font-black
                            text-white
                        "
                    >
                        Skills
                    </h2>

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-3
                        "
                    >
                        {mainSkills.map((skill) => (

                            <SkillCard
                                key={`${skill.skill_slug}-${skill.skill_index}`}
                                skill={skill}
                            />

                        ))}
                    </div>
                </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-5
                    "
                >
                    <h2
                        className="
                            text-xl
                            font-black
                            text-white
                        "
                    >
                        Runes
                    </h2>

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-3
                        "
                    >
                        {job.runes.map((rune) => (

                            <RuneCard
                                key={`${rune.rune_slug}-${rune.rune_index}`}
                                rune={rune}
                            />

                        ))}
                    </div>
                </div>
            </section>

            {otherSkills.length > 0 && (

                <section
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-5
                    "
                >
                    <h2
                        className="
                            text-xl
                            font-black
                            text-white
                        "
                    >
                        Other Skills
                    </h2>

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-3

                            lg:grid-cols-2
                        "
                    >
                        {otherSkills.map((skill) => (

                            <SkillCard
                                key={`${skill.skill_slug}-${skill.skill_index}`}
                                skill={skill}
                            />

                        ))}
                    </div>
                </section>

            )}

            <RomHtmlViewerToggle
                html={job.raw_html}
            />

        </main>
    )
}