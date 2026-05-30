
import type {
    PetDetail
} from "@/lib/types/Pets"

import FormulaViewer from "@/components/common/FormulaViewer"

import PetHeader from "@/components/pets/PetHeader"

import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"

import DetailContainer from "@/components/layout/DetailContainer"

import ApiErrorState from "@/components/common/ApiErrorState"
import PetSkills from "@/components/pets/PetSkills"
import { serverApiFetch } from "@/lib/server-api"

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


    const result =
        await serverApiFetch<PetDetail>(
            `/api/v1/pets/${slug}`
        )

    if (result.error || !result.data) {
        return (
            <ApiErrorState
                error={result.error || "server_error"}
                backHref="/pets"
            />
        )
    }

    const pet =
        result.data

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