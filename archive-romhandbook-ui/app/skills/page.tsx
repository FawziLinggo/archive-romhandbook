
import SkillGrid from "@/components/skills/SkillGrid"

import Pagination from "@/components/common/Pagination"

import {
    getSkills
} from "@/lib/queries/skills"

type Props = {

    searchParams: Promise<{

        page?: string

        q?: string

    }>

}

export default async function SkillsPage({

    searchParams



}: Props) {

    const params =
        await searchParams

    const page =
        Number(params.page || "1")

    const query =
        params.q || ""

    // =====================
    // DATA
    // =====================

    const {
        skills,
        hasNext
    } = getSkills(
        page,
        query
    )

    // =====================
    // PAGE
    // =====================

    return (

        <main
            className="
                mx-auto
                max-w-7xl

                px-6
                py-10
            "
        >

            {/* HEADER */}
            <section>

                {/* TOP */}
                <div
                    className="
            flex
            flex-col
            gap-6

            lg:flex-row
            lg:items-end
            lg:justify-between
        "
                >

                    {/* LEFT */}
                    <div>

                        <div
                            className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-violet-500/20

                    bg-violet-500/10

                    px-4
                    py-2

                    text-sm
                    text-violet-300
                "
                        >

                            ✨ Skill Explorer

                        </div>

                        <h1
                            className="
                    mt-5

                    text-5xl
                    font-black

                    tracking-tight

                    text-white
                "
                        >

                            Skills

                        </h1>

                        <p
                            className="
                    mt-4

                    max-w-2xl

                    text-lg
                    leading-8

                    text-zinc-400
                "
                        >

                            Explore Ragnarok M skills,
                            mechanics, formulas,
                            and hidden interactions.

                        </p>

                    </div>

                </div>

                {/* SEARCH */}
                <form
                    action="/skills"
                    method="GET"
                    className="
        mt-10
    "
                >

                    <div
                        className="
            relative
        "
                    >

                        {/* ICON */}
                        <div
                            className="
                pointer-events-none

                absolute
                left-5
                top-1/2

                -translate-y-1/2

                text-zinc-500
            "
                        >

                            🔍

                        </div>

                        {/* INPUT */}
                        <input
                            type="text"

                            name="q"

                            defaultValue={query}

                            placeholder="
                Search skills, formulas, mechanics...
            "

                            className="
                w-full

                rounded-3xl

                border
                border-zinc-800

                bg-zinc-950

                px-14
                py-5

                text-lg
                text-white

                outline-none

                transition-all

                placeholder:text-zinc-600

                focus:border-violet-500/50
                focus:ring-4
                focus:ring-violet-500/10
            "
                        />

                    </div>

                </form>

            </section>


            {/* SKILLS */}
            <section
                className="
                    mt-12
                "
            >


                {/* GRID */}
                <SkillGrid
                    skills={skills}
                />

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    query={query}
                    basePath="/skills"
                />

            </section>

        </main>

    )

}