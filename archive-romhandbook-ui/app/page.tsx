import HomeHero from "@/components/home/HomeHero"

import ArchiveStatsGrid from "@/components/home/ArchiveStatsGrid"

import FormulaPreview from "@/components/home/FormulaPreview"

import {
  getSidebarCounts
} from "@/lib/queries/sidebar"

import {
  getFeaturedFormula
} from "@/lib/queries/formulas"

export default function HomePage() {

  const counts =
    getSidebarCounts()

  const formula =
    getFeaturedFormula()

  return (

    <div className="space-y-12">

      <HomeHero />

      <section
        className="
            grid
            grid-cols-1
            xl:grid-cols-3
            gap-8
            items-start
        "
      >

        {/* LEFT */}
        <div className="xl:col-span-2">

          <ArchiveStatsGrid
            counts={counts}
          />

        </div>

        {/* RIGHT */}
        <div>

          <FormulaPreview
            formula={formula}
          />

        </div>

      </section>

    </div>

  )

}