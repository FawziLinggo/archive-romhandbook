import Image from "next/image"
import Link from "next/link"

import FormulaViewer from "@/components/common/FormulaViewer"
import RomHtmlViewerToggle from "../common/RomHtmlViewerToggle"

type Props = {

    egg: any
}

export default function PetEggDetail({

    egg

}: Props) {

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* HERO */}
            <div
                className="
                    relative
                    overflow-hidden

                    rounded-3xl

                    border
                    border-violet-500/20

                    bg-gradient-to-br
                    from-zinc-900
                    via-zinc-950
                    to-violet-950/20

                    p-8
                "
            >

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

                            h-28
                            w-28

                            overflow-hidden

                            rounded-2xl

                            border
                            border-white/10

                            bg-black/40
                        "
                    >

                        <Image
                            src={egg.image}
                            alt={egg.name}
                            fill
                            className="
                                object-cover
                            "
                        />

                    </div>

                    {/* INFO */}
                    <div
                        className="
                            flex-1
                            space-y-4
                        "
                    >

                        <div>

                            <h1
                                className="
                                    text-4xl
                                    font-black
                                    leading-tight
                                    text-white
                                "
                            >
                                {egg.name}
                            </h1>

                            <div
                                className="
                                    mt-3
                                "
                            >

                                <span
                                    className="
                                        inline-flex
                                        items-center

                                        rounded-full

                                        border
                                        border-violet-500/30

                                        bg-violet-500/10

                                        px-3
                                        py-1

                                        text-xs
                                        font-medium

                                        text-violet-300
                                    "
                                >
                                    Pet Egg
                                </span>

                            </div>

                        </div>

                        {/* DESCRIPTION */}
                        {egg.description && (

                            <p
                                className="
                                    max-w-4xl

                                    text-sm
                                    leading-7

                                    text-zinc-300
                                "
                            >
                                {egg.description}
                            </p>

                        )}

                        {/* STATS */}
                        <div
                            className="
                                grid
                                gap-4

                                md:grid-cols-3
                            "
                        >

                            {/* EFFECT */}
                            {egg.effect_text && (

                                <div
                                    className="
                                        rounded-2xl

                                        border
                                        border-emerald-500/20

                                        bg-emerald-500/5

                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider

                                            text-emerald-400
                                        "
                                    >
                                        Effect
                                    </p>

                                    <p
                                        className="
                                            mt-2

                                            text-sm
                                            text-zinc-200
                                        "
                                    >
                                        {egg.effect_text}
                                    </p>

                                </div>

                            )}

                            {/* UNLOCK */}
                            {egg.unlock_text && (

                                <div
                                    className="
                                        rounded-2xl

                                        border
                                        border-cyan-500/20

                                        bg-cyan-500/5

                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider

                                            text-cyan-400
                                        "
                                    >
                                        Unlock
                                    </p>

                                    <p
                                        className="
                                            mt-2

                                            text-sm
                                            text-zinc-200
                                        "
                                    >
                                        {egg.unlock_text}
                                    </p>

                                </div>

                            )}

                            {/* JOBS */}
                            {egg.jobs_raw && (

                                <div
                                    className="
                                        rounded-2xl

                                        border
                                        border-orange-500/20

                                        bg-orange-500/5

                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider

                                            text-orange-400
                                        "
                                    >
                                        Jobs
                                    </p>

                                    <p
                                        className="
                                            mt-2

                                            text-sm
                                            text-zinc-200
                                        "
                                    >
                                        {egg.jobs_raw}
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* PET */}
                        {egg.pet_url && (

                            <div
                                className="
                                    pt-2
                                "
                            >

                                <Link
                                    href={egg.pet_url}
                                    className="
                                        group

                                        flex
                                        items-center
                                        gap-4

                                        rounded-2xl

                                        border
                                        border-white/10

                                        bg-black/20

                                        p-4

                                        transition-all
                                        duration-300

                                        hover:border-violet-500/40
                                        hover:bg-violet-500/5
                                    "
                                >

                                    {egg.pet_image && (

                                        <div
                                            className="
                                                relative

                                                h-14
                                                w-14

                                                overflow-hidden

                                                rounded-xl

                                                border
                                                border-white/10
                                            "
                                        >

                                            <Image
                                                src={egg.pet_image}
                                                alt={egg.pet_name}
                                                fill
                                                className="
                                                    object-cover
                                                "
                                            />

                                        </div>

                                    )}

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                uppercase

                                                tracking-widest

                                                text-zinc-500
                                            "
                                        >
                                            Pet
                                        </p>

                                        <p
                                            className="
                                                mt-1

                                                text-base
                                                font-semibold

                                                text-white

                                                group-hover:text-violet-300
                                            "
                                        >
                                            {egg.pet_name}
                                        </p>

                                    </div>

                                </Link>

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* FORMULAS */}
            {egg.formulas_raw && (

                <FormulaViewer
                    title="Formulas"
                    code={egg.formulas_raw}
                    language="json"
                />

            )}

            <RomHtmlViewerToggle
                html={egg.raw_html}
            />

        </div>

    )

}