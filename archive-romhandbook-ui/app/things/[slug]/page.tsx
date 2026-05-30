
import CardDetail from "@/components/things/CardDetail"

import PetEggDetail from "@/components/things/PetEggDetail"

import MountDetail from "@/components/things/MountDetail"

import HeadwearDetail from "@/components/things/HeadwearDetail"

import EquipmentDetail from "@/components/things/EquipmentDetail"

import ArchiveThingDetail from "@/components/things/ArchiveThingDetail"

import CommentsPanel from "@/components/comments/CommentsPanel"

import type {
    CookingIngredientDetail,
    CraftingMaterialDetail,
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

import ApiErrorState from "@/components/common/ApiErrorState"
import { serverApiFetchEnvelope } from "@/lib/server-api"
import type {
    PetEgg
} from "@/lib/types/Pets"
import { notFound } from "next/dist/client/components/navigation"

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

    const result =
        await serverApiFetchEnvelope<ThingResponse<unknown>>(
            `/api/v1/things/${id}`
        )

    if (result.error === "not_found") {
        notFound()
    }

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/"
            />
        )
    }

    const thingResponse =
        result.data

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
                <>
                    <CardDetail
                        card={card}
                        formulas={card.formulas}
                    />

                    <CommentsPanel
                        targetType="card"
                        targetId={card.id}
                    />
                </>
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
                <>
                    <PetEggDetail
                        egg={egg}
                    />

                    <CommentsPanel
                        targetType="pet_egg"
                        targetId={egg.id}
                    />
                </>
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
                <>
                    <MountDetail
                        mount={mount}
                    />

                    <CommentsPanel
                        targetType="mount"
                        targetId={mount.id}
                    />
                </>
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
                <>
                    <HeadwearDetail
                        headwear={headwear}
                    />

                    <CommentsPanel
                        targetType="headwear"
                        targetId={headwear.id}
                    />
                </>
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
                <>
                    <EquipmentDetail
                        equipment={equipment}
                    />

                    <CommentsPanel
                        targetType="equipment"
                        targetId={equipment.id}
                    />
                </>
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
                <>
                    <ArchiveThingDetail
                        type="furniture"
                        detail={furniture}
                    />

                    <CommentsPanel
                        targetType="furniture"
                        targetId={furniture.id}
                    />
                </>
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
                <>
                    <ArchiveThingDetail
                        type="cooking_ingredient"
                        detail={ingredient}
                    />

                    <CommentsPanel
                        targetType="cooking_ingredient"
                        targetId={ingredient.id}
                    />
                </>
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
                <>
                    <ArchiveThingDetail
                        type="pet_headwear_unlock_item"
                        detail={item}
                    />

                    <CommentsPanel
                        targetType="pet_headwear_unlock_item"
                        targetId={item.id}
                    />
                </>
            )
        }

        case "crafting_material": {

            const material =
                thingResponse.data as CraftingMaterialDetail | undefined

            if (!material) {
                return (
                    <div>
                        Crafting material not found
                    </div>
                )
            }

            return (
                <>
                    <ArchiveThingDetail
                        type="crafting_material"
                        detail={material}
                    />

                    <CommentsPanel
                        targetType="crafting_material"
                        targetId={material.id}
                    />
                </>
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
