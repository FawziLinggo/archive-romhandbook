import PetGrid from "@/components/pets/PetGrid"
import { getPets } from "@/lib/queries/pets"

export default async function PetsPage({

    searchParams

}: {

    searchParams: Promise<{
        query?: string
        page?: string
    }>

}) {

    const params =
        await searchParams

    const query =
        params.query || ""

    const page =
        Number(params.page || "1")

    const {
        pets
    } = getPets(
        page,
        query
    )

    return (

        <div className="space-y-6">

            <div>

                <h1
                    className="
                        text-4xl
                        font-black
                        text-white
                    "
                >
                    Pets
                </h1>

                <p className="mt-2 text-zinc-400">
                    Discover every pet, unlock bonus, and skills.
                </p>

            </div>

            <PetGrid pets={pets} />

        </div>

    )

}