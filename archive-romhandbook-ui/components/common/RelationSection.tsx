import Link from "next/link"

type RelationItem = {
    id?: number

    material_name?: string
    material_image?: string
    material_url?: string

    skill_name?: string
    skill_image?: string
    skill_url?: string

    monster_name?: string
    monster_image?: string
    monster_url?: string

    item_name?: string
    item_image?: string
    item_url?: string
}

type Props = {
    title: string
    items: RelationItem[]
    type:
    | "material"
    | "skill"
    | "monster"
    | "craftable"
}

export default function RelationSection({
    title,
    items,
    type
}: Props) {

    if (!items?.length) {
        return null
    }

    return (

        <div
            className="
                border-t
                border-dashed
                border-zinc-700
                pt-5
            "
        >

            {/* TITLE */}
            <h3
                className="
                    text-emerald-300
                    text-sm
                    mb-4
                    font-medium
                "
            >
                {title}
            </h3>

            {/* ITEMS */}
            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-3
                    gap-3
                    hover:shadow-lg
                    hover:shadow-violet-500/10  
                "
            >

                {items.map((item: any) => {

                    const name =
                        item.material_name
                        || item.skill_name
                        || item.monster_name
                        || item.item_name

                    const image =
                        item.material_image
                        || item.skill_image
                        || item.monster_image
                        || item.item_image

                    const url =
                        item.material_url
                        || item.skill_url
                        || item.monster_url
                        || item.item_url

                    return (

                        <Link
                            key={`url-${item.id}`}
                            href={url || "#"}
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    p-2
                                    hover:bg-zinc-800
                                    transition-all
                                "
                            >

                                {/* IMAGE */}
                                <img
                                    src={image}
                                    alt={name}
                                    className="
                                        w-10
                                        h-10
                                        rounded-lg
                                        object-cover
                                        shrink-0
                                    "
                                />

                                {/* NAME */}
                                <div
                                    className="
                                        text-sm
                                        text-emerald-100
                                        font-medium
                                        line-clamp-2
                                    "
                                >
                                    {name}
                                </div>

                            </div>

                        </Link>

                    )

                })}

            </div>

        </div>

    )

}