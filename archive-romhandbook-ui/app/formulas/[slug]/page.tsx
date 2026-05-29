import FormulaGraphPanel from "@/components/formulas/FormulaGraphPanel"
import FormulaCodeViewer from "@/components/formulas/code-viewer"
import { notFound } from "next/navigation"

import type {
    ApiResponse,
    Formula
} from "@/lib/types/Formula"

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

    const { slug } =
        await params

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const res =
        await fetch(
            `${API_URL}/api/v1/formulas/${slug}`,
            {
                next: {
                    revalidate: 60
                }
            }
        )

    if (!res.ok) {

        notFound()
    }

    const response =
        await res.json() as ApiResponse<Formula>

    const formula =
        response.data

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

            <FormulaCodeViewer
                code={formula.formula_code}
            />

            <FormulaGraphPanel
                formulaId={slug}
                formulaName={formula.name}
            />

        </main>
    )
}