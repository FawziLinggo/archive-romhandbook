import { NextResponse } from "next/server"

import {
    searchPets
} from "@/lib/queries/pets"

export async function GET(
    req: Request
) {

    const {

        searchParams

    } = new URL(req.url)

    const query =
        searchParams.get("query") || ""

    const pets =
        searchPets(query)

    return NextResponse.json(
        pets
    )

}