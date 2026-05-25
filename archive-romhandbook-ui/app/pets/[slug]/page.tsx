import { notFound } from "next/navigation"

import {
    getPetBySlug
} from "@/lib/queries/pets"

import FormulaViewer from "@/components/common/FormulaViewer"

import PetHeader from "@/components/pets/PetHeader"

import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"
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

    const { slug } =
        await params

    // =====================
    // GET PET
    // =====================

    const pet =
        getPetBySlug(slug)

    // =====================
    // NOT FOUND
    // =====================

    if (!pet) {

        notFound()

    }

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

        <div
            className="
                mx-auto
                max-w-7xl

                space-y-8
            "
        >

            {/* ===================== */}
            {/* HEADER */}
            {/* ===================== */}

            <PetHeader
                pet={pet}
            />

            {/* ===================== */}
            {/* SKILLS */}
            {/* ===================== */}

            <PetSkills
                skills={skills}
            />

            {/* ===================== */}
            {/* FORMULA */}
            {/* ===================== */}

            {pet.formulas_raw && (

                <FormulaViewer
                    title="Formula"
                    code={pet.formulas_raw}
                    language="json"
                />

            )}


            {pet.raw_html && (
                <RomHtmlViewerToggle
                    html={pet.raw_html}
                />

            )}

        </div>

    )

}