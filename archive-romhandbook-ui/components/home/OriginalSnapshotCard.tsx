"use client"
import Link from "next/link"

import {
    Archive,
    ArrowRight
} from "lucide-react"


import { assetUrl } from "@/lib/utils"
import {
    useEffect,
    useState
} from "react"

type Props = {
    snapshot: any
    detail_url?: string
}


function getQualityColor(
    quality?: string
) {

    switch (quality) {

        case "Green":

            return `
                border-green-500/20
                bg-green-500/10
                text-green-300
            `

        case "Blue":

            return `
                border-blue-500/20
                bg-blue-500/10
                text-blue-300
            `

        case "Purple":

            return `
                border-violet-500/20
                bg-violet-500/10
                text-violet-300
            `

        case "White":

            return `
                border-zinc-500/20
                bg-zinc-500/10
                text-zinc-300
            `

        default:

            return `
                border-zinc-700
                bg-zinc-900
                text-zinc-300
            `
    }

}

export default function OriginalSnapshotCard({
    snapshot,
    detail_url
}: Props) {

    // =====================
    // MOUNTED
    // =====================

    const qualityColor =
        getQualityColor(
            snapshot?.quality
        )

    const [mounted, setMounted] =
        useState(false)

    useEffect(() => {

        setMounted(true)

    }, [])

    return (

        <section
            className="
                relative
                overflow-hidden

                rounded-[32px]

                border
                border-zinc-800

                bg-gradient-to-b
                from-zinc-950
                to-black

                p-8

                h-full
            "
        >

            {/* GLOW */}
            <div
                className="
                    absolute
                    inset-0

                    bg-gradient-to-br
                    from-violet-500/[0.04]
                    to-emerald-500/[0.02]

                    pointer-events-none
                "
            />

            {/* CONTENT */}
            <div
                className="
                    relative
                    z-10

                    flex
                    flex-col

                    h-full
                "
            >

                {/* BADGE */}
                <div
                    className="
                        inline-flex
                        items-center
                        gap-2

                        self-start

                        rounded-full

                        border
                        border-emerald-500/20

                        bg-emerald-500/10

                        px-4
                        py-2

                        text-sm
                        text-emerald-300

                        mb-6
                    "
                >

                    <Archive size={16} />

                    Historical Snapshot

                </div>

                {/* TITLE */}
                <h2
                    className="
                        text-4xl
                        font-black
                        text-white
                    "
                >

                    Original Snapshot

                </h2>

                {/* DESC */}
                <p
                    className="
                        mt-5

                        text-zinc-400
                        leading-relaxed
                    "
                >

                    Preserved original HTML pages
                    from the historical ROM Handbook
                    website before shutdown.

                    Experience the authentic archived
                    interface.

                </p>


                {/* ACTION */}
                <div className="mt-6">

                    <Link
                        href={
                            detail_url
                            || `${snapshot?.detail_url}`
                        }
                        className="
            inline-flex
            items-center
            gap-2

            rounded-2xl

            border
            border-violet-500/30

            bg-violet-500/10

            px-5
            py-3

            text-violet-300

            hover:bg-violet-500/20
            hover:border-violet-400

            transition-all
        "
                    >

                        Open Snapshot

                        <ArrowRight size={18} />

                    </Link>

                </div>


                {/* SNAPSHOT PREVIEW */}
                <div
                    className="
        relative

        flex-1

        mt-6

        overflow-hidden

        rounded-3xl

        border
        border-zinc-800

        bg-black
    "
                >

                    {/* BROWSER BAR */}
                    <div
                        className="
            flex
            items-center
            gap-2

            border-b
            border-zinc-800

            px-4
            py-3
        "
                    >

                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />

                    </div>

                    <div className="
        flex
        flex-col

        h-full

        p-6
    ">

                        {/* ITEM */}
                        <div className="flex gap-4">

                            <img
                                src={assetUrl(snapshot?.image)}
                                alt={snapshot?.name}
                                className="
                    h-24
                    w-24

                    rounded-2xl

                    object-cover

                    border
                    border-zinc-800
                "
                            />

                            <div className="flex-1">

                                <h3
                                    className="
                        text-2xl
                        font-bold
                        text-emerald-300
                    "
                                >
                                    {snapshot?.name}
                                </h3>

                                <p
                                    className="
                        mt-2
                        text-sm
                        text-zinc-500
                    "
                                >
                                    Preserved ROM Handbook
                                    HTML snapshot archive.
                                </p>

                                <div
                                    className="
                        mt-4

                        inline-flex
                        items-center
                        gap-2

                        rounded-full

                        border
                        border-violet-500/20

                        bg-violet-500/10

                        px-3
                        py-1

                        text-xs
                        text-violet-300
                    "
                                >

                                    Original HTML

                                </div>

                            </div>

                        </div>

                        {/* REAL CONTENT */}
                        <div
                            className="
        mt-6

        flex-1

        flex
        flex-col
        justify-between

        space-y-4
    "
                        >

                            {/* TYPE + QUALITY */}
                            <div
                                className="
            flex
            flex-wrap
            gap-2
        "
                            >

                                <div
                                    className="
                rounded-full

                border
                border-zinc-700

                bg-zinc-900

                px-3
                py-1

                text-xs
                text-zinc-300
            "
                                >
                                    {snapshot?.card_type || "Card"}

                                </div>

                                <div
                                    className={`
        rounded-full

        border

        px-3
        py-1

        text-xs

        ${qualityColor}
    `}
                                >
                                    {snapshot?.quality || "Rare"}
                                </div>

                            </div>

                            {/* EFFECT */}
                            <div
                                className="
            rounded-2xl

            border
            border-zinc-800

            bg-zinc-950/80

            p-4
        "
                            >

                                <p
                                    className="
                text-sm
                leading-relaxed
                text-zinc-300

                line-clamp-3
            "
                                >

                                    {snapshot?.effect_texts?.[0] ? `${snapshot.effect_texts[0]} ... and more...` : "Preserved original ROM Handbook archived snapshot page."
                                    }

                                </p>

                            </div>



                        </div>

                    </div>

                </div>


            </div>

        </section>

    )

}