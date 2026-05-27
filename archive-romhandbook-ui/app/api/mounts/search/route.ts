import { NextResponse } from "next/server"

import {
    searchMounts
} from "@/lib/queries/mounts"

export async function GET(
    req: Request
) {

    const {

        searchParams

    } = new URL(req.url)

    const query =
        searchParams.get("query") || ""

    const mounts =
        searchMounts(query)

    return NextResponse.json(
        mounts
    )

}