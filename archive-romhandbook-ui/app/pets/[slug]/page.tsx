import { notFound } from "next/navigation"

import type {
    PetDetail
} from "@/lib/types/Pets"

import FormulaViewer from "@/components/common/FormulaViewer"

import PetHeader from "@/components/pets/PetHeader"

import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"

import DetailContainer from "@/components/layout/DetailContainer"

import PetSkills from "@/components/pets/PetSkills"

export default async function PetDetailPage({

    params

}: {

    params: Promise<{
        slug: string
    }>

}) {

    // =====================
    // PARAMS
    // =====================

    const {
        slug
    } = await params

    // =====================
    // API
    // =====================

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    // =====================
    // FETCH
    // =====================

    const res =
        await fetch(

            `${API_URL}/api/v1/pets/${slug}`,

            {
                next: {

                    revalidate: 60
                }
            }
        )

    // =====================
    // NOT FOUND
    // =====================

    if (!res.ok) {

        notFound()
    }

    const response =
        await res.json()

    const pet =
        response.data as PetDetail

    // =====================
    // PARSE SKILLS
    // =====================

    let skills = []

    try {

        skills = JSON.parse(
            pet.skills || "[]"
        )

    } catch {

        skills = []
    }

    // =====================
    // PAGE
    // =====================

    return (

        <DetailContainer>

            {/* HEADER */}

            <PetHeader
                pet={pet}
            />

            {/* SKILLS */}

            <PetSkills
                skills={skills}
            />

            {/* FORMULA */}

            {pet.formulas_raw && (

                <FormulaViewer
                    title="Formula"
                    code={pet.formulas_raw}
                    language="json"
                />

            )}

            {/* RAW HTML */}

            {pet.raw_html && (

                <RomHtmlViewerToggle
                    html={pet.raw_html}
                />

            )}

        </DetailContainer>

    )

}