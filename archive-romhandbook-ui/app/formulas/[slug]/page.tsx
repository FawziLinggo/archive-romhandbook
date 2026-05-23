import { notFound } from "next/navigation"

import {
    getFormulaBySlug
} from "@/lib/queries/formulas"

import FormulaCodeViewer from "@/components/formulas/code-viewer"

type PageProps = {

    params: Promise<{
        slug: string
    }>

}

export default async function FormulaDetailPage(
    {
        params
    }: PageProps
) {

    const { slug } = await params

    const formula =
        getFormulaBySlug(slug)

    if (!formula) {
        notFound()
    }

    return (

        <main
            className="
                mx-auto
                max-w-6xl
                px-6
                py-10
            "
        >

            {/* HEADER */}
            <div className="mb-8">

                <p
                    className="
                        text-sm
                        uppercase
                        tracking-[0.2em]
                        text-violet-400
                    "
                >
                    Formula
                </p>

                <h1
                    className="
                        mt-2
                        text-5xl
                        font-black
                        text-white
                    "
                >
                    {formula.name}
                </h1>

            </div>

            {/* CODE */}
            <FormulaCodeViewer
                code={formula.formula_code}
            />

        </main>

    )

}