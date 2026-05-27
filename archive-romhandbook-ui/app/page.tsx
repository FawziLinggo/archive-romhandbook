import HomeHero from "@/components/home/HomeHero"


import FormulaPreview from "@/components/home/FormulaPreview"

import OriginalSnapshotCard from "@/components/home/OriginalSnapshotCard"


import {
  getRandomSnapshotCard as getRandomSnapshot
} from "@/lib/queries/things"

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