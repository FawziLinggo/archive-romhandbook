import {
    getCardById,
    getCardFormulas,
} from "@/lib/queries/cards"

import CardDetail from "@/components/things/CardDetail"

import PetEggDetail from "@/components/things/PetEggDetail"

import MountDetail from "@/components/things/MountDetail"

import type {
    MountDetail as MountDetailType
} from "@/lib/types/Mount"

import type {
    PetEgg
} from "@/lib/types/Pets"

type ThingResponse<T> = {

    success: boolean

    type: string

    data: T

    meta: unknown
}

// import EquipmentDetail from "@/components/things/EquipmentDetail"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export default async function ThingPage({
    params
}: Props) {

    const { slug } =
        await params

    const id =
        slug.split("-").pop() || ""

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const thingRes =
        await fetch(
            `${API_URL}/api/v1/things/${id}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!thingRes.ok) {

        return (
            <div>
                Not Found
            </div>
        )
    }

    const thingResponse =
        await thingRes.json() as ThingResponse<unknown>

    switch (thingResponse.type) {

        case "card": {

            const card =
                getCardById(id)

            const formulas =
                getCardFormulas(id)

            return (
                <CardDetail
                    card={card}
                    formulas={formulas}
                />
            )
        }

        case "pet_egg": {

            const egg =
                thingResponse.data as PetEgg | undefined

            if (!egg) {

                return (
                    <div>
                        Egg not found
                    </div>
                )
            }

            return (
                <PetEggDetail
                    egg={egg}
                />
            )
        }

        case "mount": {

            const mount =
                thingResponse.data as MountDetailType | undefined

            if (!mount) {

                return (
                    <div>
                        Mount not found
                    </div>
                )
            }

            return (
                <MountDetail
                    mount={mount}
                />
            )
        }

        default:

            return (
                <div>
                    Unknown type
                </div>
            )
    }
}