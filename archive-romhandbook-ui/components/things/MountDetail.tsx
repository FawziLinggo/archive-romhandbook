import Image from "next/image"

import RomHtmlViewerToggle from "../common/RomHtmlViewerToggle"
import DetailContainer from "../layout/DetailContainer"

type Props = {

    mount: any

}

export default function MountDetail({
    mount
}: Props) {

    // =====================
    // PARSE
    // =====================

    let effects: string[] = []
    let unlocks: string[] = []
    let jobs: string[] = []

    try {

        effects =
            JSON.parse(
                mount.effect_text || "[]"
            )

    } catch { }

    try {

        unlocks =
            JSON.parse(
                mount.unlock_text || "[]"
            )

    } catch { }

    try {

        jobs =
            JSON.parse(
                mount.jobs || "[]"
            )

    } catch { }

    // =====================
    // RENDER
    // =====================

    return (

        <DetailContainer>

            {/* HERO */}

            <div
                className="
                    relative
                    overflow-hidden

                    rounded-[32px]

                    border
                    border-violet-500/20

                    bg-gradient-to-br
                    from-[#120312]
                    via-black
                    to-[#07111f]

                    p-8
                "
            >

                {/* GLOW */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0

                        bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_40%)]

                        opacity-70
                    "
                />

                <div
                    className="
                        relative
                        z-10

                        flex
                        flex-col
                        gap-6

                        md:flex-row
                    "
                >

                    {/* IMAGE */}

                    <div
                        className="
                            relative

                            h-32
                            w-32

                            shrink-0

                            overflow-hidden

                            rounded-3xl

                            border
                            border-white/10

                            bg-black/30
                        "
                    >

                        <Image
                            src={mount.image}
                            alt={mount.name}
                            fill
                            className="
                                object-contain
                                p-3
                            "
                        />

                    </div>

                    {/* INFO */}

                    <div
                        className="
                            flex-1
                            min-w-0
                        "
                    >

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    rounded-full

                                    border
                                    border-violet-500/20

                                    bg-violet-500/10

                                    px-3
                                    py-1

                                    text-xs
                                    font-medium

                                    text-violet-300
                                "
                            >
                                Mount
                            </span>

                            {mount.quality && (

                                <span
                                    className="
                                        rounded-full

                                        border
                                        border-cyan-500/20

                                        bg-cyan-500/10

                                        px-3
                                        py-1

                                        text-xs
                                        font-medium

                                        text-cyan-300
                                    "
                                >
                                    {mount.quality}
                                </span>

                            )}

                        </div>

                        <h1
                            className="
                                mt-4

                                text-4xl
                                font-black

                                tracking-tight
                                text-white
                            "
                        >
                            {mount.name}
                        </h1>

                        {mount.description && (

                            <p
                                className="
                                    mt-4

                                    max-w-3xl

                                    text-zinc-300
                                    leading-7
                                "
                            >
                                {mount.description}
                            </p>

                        )}



                    </div>

                </div>

            </div>

            <div
                className="
        mt-6

        grid
        gap-4

        md:grid-cols-3
    "
            >

                {/* EFFECT */}

                {effects.length > 0 && (

                    <div
                        className="
                rounded-2xl

                border
                border-white/10

                bg-black/20

                p-4
            "
                    >

                        <p
                            className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider

                    text-zinc-500
                "
                        >
                            Effect
                        </p>

                        <div
                            className="
                    mt-3
                    space-y-2
                "
                        >

                            {effects.map(
                                (
                                    effect: string,
                                    index: number
                                ) => (

                                    <div
                                        key={index}
                                        className="
                                flex
                                items-start
                                gap-2
                            "
                                    >

                                        <span
                                            className="
                                    text-orange-400
                                "
                                        >
                                            ✦
                                        </span>

                                        <p
                                            className="
                                    text-sm
                                    text-zinc-200
                                "
                                        >
                                            {effect}
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

                {/* UNLOCK */}

                {unlocks.length > 0 && (

                    <div
                        className="
                rounded-2xl

                border
                border-white/10

                bg-black/20

                p-4
            "
                    >

                        <p
                            className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider

                    text-zinc-500
                "
                        >
                            Unlock Bonus
                        </p>

                        <div
                            className="
                    mt-3
                    space-y-2
                "
                        >

                            {unlocks.map(
                                (
                                    unlock: string,
                                    index: number
                                ) => (

                                    <div
                                        key={index}
                                        className="
                                flex
                                items-start
                                gap-2
                            "
                                    >

                                        <span
                                            className="
                                    text-emerald-400
                                "
                                        >
                                            ✦
                                        </span>

                                        <p
                                            className="
                                    text-sm
                                    text-zinc-200
                                "
                                        >
                                            {unlock}
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

                {/* JOBS */}

                {jobs.length > 0 && (

                    <div
                        className="
                rounded-2xl

                border
                border-white/10

                bg-black/20

                p-4
            "
                    >

                        <p
                            className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider

                    text-zinc-500
                "
                        >
                            Jobs
                        </p>

                        <div
                            className="
                    mt-3

                    flex
                    flex-wrap
                    gap-2
                "
                        >

                            {jobs.map(
                                (
                                    job: string
                                ) => (

                                    <span
                                        key={job}
                                        className="
                                rounded-full

                                border
                                border-cyan-500/20

                                bg-cyan-500/10

                                px-3
                                py-1

                                text-xs
                                font-medium

                                text-cyan-300
                            "
                                    >
                                        {job}
                                    </span>

                                )
                            )}

                        </div>

                    </div>

                )}

            </div>

            {/* RAW HTML */}

            {mount.raw_html && (

                <RomHtmlViewerToggle
                    html={mount.raw_html}
                />

            )}

        </DetailContainer>

    )

}