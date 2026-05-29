import FormulaGraphPanel from "@/components/formulas/FormulaGraphPanel"
import FormulaCodeViewer from "@/components/formulas/code-viewer"
import { notFound } from "next/navigation"




import FormulaGraphJumpButton from "@/components/formulas/FormulaGraphJumpButton"
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
        w-full
        max-w-6xl
        min-w-0
        overflow-x-hidden
        px-4
        py-6
        sm:px-6
        sm:py-10
    "
        >

            <div
                className="
        mb-8
        flex
        flex-col
        gap-5
        lg:flex-row
        lg:items-end
        lg:justify-between
    "
            >
                <div className="min-w-0">

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
    max-w-full
    break-words
    text-3xl
    font-black
    leading-tight
    text-white
    [overflow-wrap:anywhere]
    sm:text-4xl
    md:text-5xl
"
                    >
                        {formula.name}
                    </h1>

                </div>

                <FormulaGraphJumpButton targetId="formula-graph" />
            </div>


            <FormulaCodeViewer
                code={formula.formula_code}
            />

            <FormulaGraphPanel
                id="formula-graph"
                formulaId={slug}
                formulaName={formula.name}
            />


        </main>
    )
}