import { notFound } from "next/navigation"

import {
    getBuffBySlug
} from "@/lib/queries/buffs"

import BuffDetail from "@/components/buffs/BuffDetail"

type Props = {

    params: Promise<{
        slug: string
    }>

}

export default async function BuffPage({
    params
}: Props) {

    const { slug } =
        await params

    const buff =
        getBuffBySlug(slug)

    if (!buff) {

        notFound()

    }

    return (

        <BuffDetail
            buff={buff}
        />

    )

}