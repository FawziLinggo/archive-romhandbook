import Link from "next/link"

import type {
    Job
} from "@/lib/types/Job"

import {
    jobTrees,
    specialJobs
} from "./job-tree"

type Props = {

    jobs: Job[]
}

function JobNode({
    job,
    center = false
}: {
    job?: Job
    center?: boolean
}) {

    if (!job) {
        return null
    }

    return (

        <Link
            href={job.detail_url}
            className={`
                group
                flex
                min-w-0
                items-center
                gap-3
                rounded-xl
                px-2
                py-2
                text-sm
                font-bold
                text-zinc-200
                transition-colors

                hover:bg-white/5
                hover:text-violet-200

                ${center ? "justify-center" : ""}
            `}
        >
            <span
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-black
                    shadow-inner
                "
            >
                {job.image && (

                    <img
                        src={job.image}
                        alt={job.name}
                        className="
                            h-6
                            w-6
                            object-contain
                        "
                    />

                )}
            </span>

            <span
                className="
                    min-w-0
                    break-words
                    leading-5
                "
            >
                {job.name}
            </span>
        </Link>
    )
}

export default function JobTree({
    jobs
}: Props) {

    const jobMap =
        new Map(
            jobs.map((job) => [
                job.slug,
                job
            ])
        )

    return (

        <div className="space-y-4">

            <div
                className="
                    grid
                    grid-cols-1
                    gap-2

                    sm:grid-cols-2
                    lg:grid-cols-3
                "
            >
                {specialJobs.map((slug) => (

                    <div
                        key={slug}
                        className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900/70
                            px-3
                            py-2
                        "
                    >
                        <JobNode
                            job={jobMap.get(slug)}
                        />
                    </div>

                ))}
            </div>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-2

                    lg:grid-cols-2
                "
            >
                {jobTrees.map((tree) => (

                    <div
                        key={tree.root}
                        className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900/70
                            px-4
                            py-4
                        "
                    >
                        <JobNode
                            job={jobMap.get(tree.root)}
                            center
                        />

                        <div
                            className="
                                mt-2
                                flex
                                justify-center
                                gap-4
                            "
                        >
                            {tree.branches.map((branch, branchIndex) => (

                                <div
                                    key={`${tree.root}-${branchIndex}`}
                                    className="
                                        min-w-0
                                        flex-1
                                        space-y-1
                                    "
                                >
                                    {branch.map((slug) => (

                                        <JobNode
                                            key={slug}
                                            job={jobMap.get(slug)}
                                        />

                                    ))}
                                </div>

                            ))}
                        </div>
                    </div>

                ))}
            </div>

        </div>
    )
}