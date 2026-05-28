import type {
    Job
} from "@/lib/types/Job"

import JobCard from "./JobCard"

type Props = {

    jobs: Job[]
}

export default function JobGrid({
    jobs
}: Props) {

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
            "
        >
            {jobs.map((job) => (

                <JobCard
                    key={job.id}
                    job={job}
                />

            ))}
        </div>
    )
}