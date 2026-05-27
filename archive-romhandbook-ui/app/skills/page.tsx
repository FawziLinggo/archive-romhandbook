


import SkillSearchClient from "@/components/skills/SkillSearchClient"
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

                <SkillSearchClient
                    initialSkills={skills}
                    page={page}
                    hasNext={hasNext}
                />

            </section>

        </main>

    )

}