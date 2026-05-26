import Image from "next/image"
import Link from "next/link"

import { Buff } from "@/lib/queries/buffs"

type Props = {

    buff: Buff

}

export default function BuffCard({

    buff

}: Props) {

    const hasFormula =
        !!buff.raw_json


    let parsedJson: any = null

    try {

        parsedJson =
            buff.raw_json
                ? JSON.parse(buff.raw_json)
                : null

    } catch {

        parsedJson = null

    }

    const buffEffect =
        parsedJson?.BuffEffect

    const effectText = buffEffect

        ? `${buffEffect.type || "Effect"} • ${Object.keys(buffEffect)

            .filter((key) => key !== "type")
            .join(", ")
        }`

        : null

    const buffName = parsedJson?.BuffName

    return (

        <Link
            href={buff.detail_url}
            className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/10
                bg-gradient-to-br
                from-zinc-900
                via-zinc-950
                to-violet-950/20
                p-5
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-violet-500/30
                hover:shadow-2xl
                hover:shadow-violet-500/10
            "
        >

            {/* GLOW */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-0
                    transition-opacity
                    duration-300

                    group-hover:opacity-100
                    bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_40%)]
                "
            />

            {/* CONTENT */}

            <div className="relative z-10">

                {/* TOP */}

                <div
                    className="
                        flex
                        items-start
                        gap-4
                    "
                >

                    {/* ICON */}

                    <div
                        className="
                            relative
                            h-16
                            w-16
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            border
                            border-white/10
                            bg-black/40
                        "
                    >

                        {buff.image ? (

                            <Image
                                src={buff.image}
                                alt={buff.name}
                                fill
                                sizes="64px"
                                className="
                                    object-cover
                                "
                            />

                        ) : (

                            <div
                                className="
                                    flex
                                    h-full
                                    items-center
                                    justify-center
                                    text-2xl
                                "
                            >
                                ✦
                            </div>

                        )}

                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                        <h2
                            className="
                                line-clamp-2
                                text-lg
                                font-bold
                                leading-tight
                                text-white
                                transition-colors

                                group-hover:text-violet-200
                            "
                        >
                            {buff.name}
                        </h2>

                        <p
                            className="
                                mt-2
                                line-clamp-3
                                text-sm
                                leading-6
                                text-zinc-400
                            "
                        >

                            {buff.description ||

                                effectText ||
                                `No Effect just have name ${buffName}` ||

                                "Ancient magical effect archived from Ragnarok Mobile."

                            }

                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <div
                    className="
                        mt-5
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >

                    <div
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
                        Buff
                    </div>

                    {hasFormula && (

                        <div
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
                            Formula
                        </div>

                    )}


                </div>

            </div>

        </Link>

    )

}