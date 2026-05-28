import type {
    Equipment
} from "@/lib/types/Equipment"

import EquipmentCard from "./EquipmentCard"

type Props = {

    equipments: Equipment[]

}

export default function EquipmentGrid({
    equipments
}: Props) {

    if (equipments.length === 0) {

        return (

            <div
                className="
                    rounded-2xl
                    border
                    border-dashed
                    border-zinc-800
                    bg-zinc-950/50
                    px-6
                    py-16
                    text-center
                "
            >
                <h3
                    className="
                        text-lg
                        font-bold
                        text-white
                    "
                >
                    No equipments found
                </h3>

                <p
                    className="
                        mt-2
                        text-sm
                        text-zinc-500
                    "
                >
                    Try another search or filter.
                </p>
            </div>

        )
    }

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
            "
        >
            {equipments.map((equipment) => (

                <EquipmentCard
                    key={equipment.id}
                    equipment={equipment}
                />

            ))}
        </div>

    )
}