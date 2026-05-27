import type {
    Mount
} from "@/lib/types/Mount"

import MountCard from "./MountCard"

type Props = {

    mounts: Mount[]
}

export default function MountGrid({
    mounts
}: Props) {

    return (

        <div
            className="
                grid
                gap-6

                md:grid-cols-2
                xl:grid-cols-3
            "
        >

            {mounts.map((mount) => (

                <MountCard
                    key={mount.id}
                    mount={mount}
                />

            ))}

        </div>

    )

}