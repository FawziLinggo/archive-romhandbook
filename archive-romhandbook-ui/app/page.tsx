import HomeHero from "@/components/home/HomeHero"

import FormulaPreview from "@/components/home/FormulaPreview"

import OriginalSnapshotCard from "@/components/home/OriginalSnapshotCard"

import {
  getRandomSnapshotCard as getRandomSnapshot
} from "@/lib/queries/things"

import {
  getSidebarCounts
} from "@/lib/queries/sidebar"

import type {
  ApiResponse,
  Formula
} from "@/lib/types/Formula"

export default async function HomePage() {

  const counts =
    getSidebarCounts()

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

  const snapshot =
    getRandomSnapshot()

  return (

    <div className="space-y-12">

      <HomeHero />

      {/* FORMULA FEATURE */}
      <section
        className="
            grid
            grid-cols-1
            xl:grid-cols-2
            gap-10
            items-start
        "
      >

        {/* LEFT */}
        <div>

          <FormulaPreview
            formula={formula}
          />

        </div>

        {/* RIGHT */}
        <div>

          <OriginalSnapshotCard
            snapshot={snapshot}
          />

        </div>

      </section>

      {/* ARCHIVE GRID */}
      {/* <ArchiveStatsGrid
        counts={counts}
      /> */}

    </div>
  )
}