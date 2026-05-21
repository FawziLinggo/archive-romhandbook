import {
    getCardById,
    getCardFormulas,
} from "@/lib/queries/cards"
import {
    getThingTypeById
} from "@/lib/queries/things"

import CardDetail from "@/components/things/CardDetail"

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

    const thing: any =
        getThingTypeById(id)

    if (!thing) {

        return (
            <div>
                Not Found
            </div>
        )

    }

    switch (thing.type) {

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

        // case "equipment": {

        //     const equipment =
        //         getEquipmentById(id)

        //     return (
        //         <EquipmentDetail
        //             equipment={equipment}
        //         />
        //     )

        // }

        default:

            return (
                <div>
                    Unknown type
                </div>
            )

    }

}