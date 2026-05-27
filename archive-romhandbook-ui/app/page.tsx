import HomeHero from "@/components/home/HomeHero"

import FormulaPreview from "@/components/home/FormulaPreview"

import OriginalSnapshotCard from "@/components/home/OriginalSnapshotCard"

import type {
  ApiResponse,
  Formula
} from "@/lib/types/Formula"

import type {
  RandomSnapshotCard
} from "@/lib/types/Thing"

export default async function HomePage() {

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL

  const formulaRes =
    await fetch(
      `${API_URL}/api/v1/formulas/featured`,
      {
        next: {
          revalidate: 60
        }
      }
    )

  const formula =
    formulaRes.ok
      ? (
        await formulaRes.json() as ApiResponse<Formula>
      ).data
      : null

  const snapshotRes =
    await fetch(
      `${API_URL}/api/v1/things/random-snapshot-card`,
      {
        next: {
          revalidate: 60
        }
      }
    )

  const snapshot =
    snapshotRes.ok
      ? (
        await snapshotRes.json() as ApiResponse<RandomSnapshotCard>
      ).data
      : null

  return (

    <div className="space-y-12">

      <HomeHero />

      <section
        className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-10
            items-start
        "
      >

        <div>

          {formula && (

            <FormulaPreview
              formula={formula}
            />

          )}

        </div>

        <div>

          {snapshot && (

            <OriginalSnapshotCard
              snapshot={snapshot}
            />

          )}

        </div>

      </section>

    </div>
  )
}