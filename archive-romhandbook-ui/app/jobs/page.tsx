import JobSearchClient from "@/components/jobs/JobSearchClient"

import type {
    Job,
    PaginatedApiResponse
} from "@/lib/types/Job"

type Props = {

    searchParams: Promise<{
        page?: string
    }>
}

export default async function JobsPage({
    searchParams
}: Props) {

    const params =
        await searchParams

    const page =
        Math.max(
            1,
            Number(params.page || "1")
        )

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8080"

    const res =
        await fetch(
            `${API_URL}/api/v1/jobs?page=1&limit=200`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {
        throw new Error("Failed to fetch jobs")
    }

    const response =
        await res.json() as PaginatedApiResponse<Job>

    return (

        <main
            className="
                mx-auto
                w-full
                max-w-7xl
                space-y-6
            "
        >
            <section className="space-y-2">

                <h1
                    className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-white

                        sm:text-4xl
                    "
                >
                    Jobs
                </h1>

                <p
                    className="
                        max-w-2xl
                        text-sm
                        leading-6
                        text-zinc-400

                        sm:text-base
                    "
                >
                    Browse class trees, job progressions, skills, runes,
                    and archived ROM Handbook job data.
                </p>

            </section>

            <JobSearchClient
                initialJobs={response.data}
                page={response.meta.page}
                hasNext={response.meta.has_next}
                total={response.meta.total}
            />

        </main>
    )
}