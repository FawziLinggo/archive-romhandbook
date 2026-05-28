import Link from "next/link"

import type {
    Job
} from "@/lib/types/Job"

type Props = {

    job: Job
}

export default function JobCard({
    job
}: Props) {

    return (

        <Link
            href={job.detail_url}
            className="
                group
                flex
                min-h-[88px]
                items-center
                gap-4
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-4
                transition-all

                hover:-translate-y-1
                hover:border-emerald-500/40
                hover:bg-zinc-900
                hover:shadow-xl
                hover:shadow-emerald-500/10
            "
        >
            <div
                className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-black
                "
            >
                {job.image ? (

                    <img
                        src={job.image}
                        alt={job.name}
                        className="
                            h-8
                            w-8
                            object-contain
                        "
                    />

                ) : (

                    <div
                        className="
                            h-3
                            w-3
                            rounded-full
                            bg-emerald-400
                        "
                    />

                )}
            </div>

            <div className="min-w-0">

                <h2
                    className="
                        truncate
                        text-base
                        font-bold
                        text-white
                    "
                >
                    {job.name}
                </h2>

                <p
                    className="
                        mt-1
                        text-xs
                        text-zinc-500
                    "
                >
                    /jobs/{job.slug}
                </p>

            </div>

        </Link>
    )
}