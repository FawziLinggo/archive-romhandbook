
import CardDetail from "@/components/things/CardDetail"

import PetEggDetail from "@/components/things/PetEggDetail"

import MountDetail from "@/components/things/MountDetail"

import HeadwearDetail from "@/components/things/HeadwearDetail"

import EquipmentDetail from "@/components/things/EquipmentDetail"

import ArchiveThingDetail from "@/components/things/ArchiveThingDetail"

import type {
    CookingIngredientDetail,
    FurnitureDetail,
    PetHeadwearUnlockItemDetail
} from "@/lib/types/Thing"

import type {
    HeadwearDetail as HeadwearDetailType
} from "@/lib/types/Headwear"

import type {
    EquipmentDetail as EquipmentDetailType
} from "@/lib/types/Equipment"

import type {
    CardDetail as CardDetailType
} from "@/lib/types/Card"

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
                thingResponse.data as CardDetailType | undefined

            if (!card) {

                return (
                    <div>
                        Card not found
                    </div>
                )
            }

            return (
                <CardDetail
                    card={card}
                    formulas={card.formulas}
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

        case "headwear": {

            const headwear =
                thingResponse.data as HeadwearDetailType | undefined

            if (!headwear) {

                return (
                    <div>
                        Headwear not found
                    </div>
                )
            }

            return (
                <HeadwearDetail
                    headwear={headwear}
                />
            )
        }

        case "equipment": {

            const equipment =
                thingResponse.data as EquipmentDetailType | undefined

            if (!equipment) {

                return (
                    <div>
                        Equipment not found
                    </div>
                )
            }

            return (
                <EquipmentDetail
                    equipment={equipment}
                />
            )
        }

        case "furniture": {

            const furniture =
                thingResponse.data as FurnitureDetail | undefined

            if (!furniture) {
                return (
                    <div>
                        Furniture not found
                    </div>
                )
            }

            return (
                <ArchiveThingDetail
                    type="furniture"
                    detail={furniture}
                />
            )
        }

        case "cooking_ingredient": {

            const ingredient =
                thingResponse.data as CookingIngredientDetail | undefined

            if (!ingredient) {
                return (
                    <div>
                        Cooking ingredient not found
                    </div>
                )
            }

            return (
                <ArchiveThingDetail
                    type="cooking_ingredient"
                    detail={ingredient}
                />
            )
        }

        case "pet_headwear_unlock_item": {

            const item =
                thingResponse.data as PetHeadwearUnlockItemDetail | undefined

            if (!item) {
                return (
                    <div>
                        Pet headwear unlock item not found
                    </div>
                )
            }

            return (
                <ArchiveThingDetail
                    type="pet_headwear_unlock_item"
                    detail={item}
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
