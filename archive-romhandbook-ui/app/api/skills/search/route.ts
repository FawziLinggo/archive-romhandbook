import { NextResponse } from "next/server"

import {
    searchSkills
} from "@/lib/queries/skills"

export async function GET(
    req: Request
) {

    const {

        searchParams

    } = new URL(req.url)

    const query =
        searchParams.get("query") || ""

    const skills =
        searchSkills(query)

    return NextResponse.json(
        skills
    )

}