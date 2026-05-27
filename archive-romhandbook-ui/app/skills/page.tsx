import SkillSearchClient from "@/components/skills/SkillSearchClient"

import {
    apiFetch
} from "@/lib/api"

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
    // FETCH API
    // =====================

    const response =
        await apiFetch<any>(

            `/api/v1/skills?page=${page}&limit=24&query=${query}`

        )

    // =====================
    // API DATA
    // =====================

    const skills =
        response.data

    const meta =
        response.meta

    return (

        <main
            className="
                mx-auto
                max-w-7xl

                px-6
                py-10
            "
        >

            <section>

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
                    hasNext={meta.has_next}
                />

            </section>

        </main>

    )
}