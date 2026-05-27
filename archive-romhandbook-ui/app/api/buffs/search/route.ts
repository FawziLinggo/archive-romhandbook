import { NextResponse } from "next/server"

import {
    searchBuffs
} from "@/lib/queries/buffs"

export async function GET(
    req: Request
) {

    const {

        searchParams

    } = new URL(req.url)

    const query =
        searchParams.get("query") || ""

    const buffs =
        searchBuffs(query)

    return NextResponse.json(
        buffs
    )

}