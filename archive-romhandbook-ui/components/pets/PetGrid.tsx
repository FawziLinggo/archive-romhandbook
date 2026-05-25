import { Pet } from "@/lib/queries/pets"
import PetCard from "./PetCard"

export default function PetGrid({
    pets
}: {
    pets: Pet[]
}) {

    return (

        <div
            className="
                grid
                grid-cols-1
                gap-5

                md:grid-cols-2
                xl:grid-cols-3
            "
        >

            {pets.map((pet) => (

                <PetCard
                    key={pet.id}
                    pet={pet}
                />

            ))}

        </div>

    )

}