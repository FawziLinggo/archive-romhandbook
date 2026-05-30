import type {
    Mount
} from "@/lib/types/Mount"
import { assetUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type Props = {

    mount: Mount
}

const qualityStyles: Record<
    string,
    string
> = {

    White:
        "border-zinc-700",

    Green:
        "border-emerald-500/30 shadow-emerald-500/10",

    Blue:
        "border-sky-500/30 shadow-sky-500/10",

    Purple:
        "border-violet-500/30 shadow-violet-500/10",

    Gold:
        "border-amber-500/30 shadow-amber-500/10"

}

export default function MountCard({
    mount
}: Props) {

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

    return (

        <Link
            href={mount.detail_url}
            className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                bg-gradient-to-b
                from-zinc-900
                to-black
                p-5

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-violet-500/40
                hover:shadow-2xl
                hover:shadow-violet-500/10

                ${mount.quality ? qualityStyles[mount.quality] || "border-zinc-800" : "border-zinc-800"}
            `}
        >

            {/* GLOW */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0

                    bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_45%)]

                    opacity-0
                    transition-opacity
                    duration-500

                    group-hover:opacity-100
                "
            />

            <div
                className="
                    relative
                    z-10
                "
            >

                {/* TOP */}

                <div
                    className="
                        flex
                        gap-4
                    "
                >

                    {/* IMAGE */}

                    <div
                        className="
                            relative
                            h-24
                            w-24
                            shrink-0
                            overflow-hidden
                            rounded-2xl
                            border
                            border-white/10
                            bg-black/40
                        "
                    >

                        <Image
                            src={
                                assetUrl(mount.image)
                            }
                            alt={mount.name}
                            fill
                            sizes="96px"
                            className="
        object-cover
        transition-transform
        duration-500

        group-hover:scale-110
    "
                        />

                    </div>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                        <h2
                            className="
                                line-clamp-2
                                text-xl
                                font-black
                                leading-tight
                                text-white
                            "
                        >
                            {mount.name}
                        </h2>

                        {mount.description && (

                            <p
                                className="
                                    mt-3
                                    line-clamp-3
                                    text-sm
                                    leading-6
                                    text-zinc-400
                                "
                            >
                                {mount.description}
                            </p>

                        )}

                    </div>

                </div>

                {/* EFFECT */}

                {effects.length > 0 && (

                    <div className="mt-5">

                        <p
                            className="
                                mb-2
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-emerald-400
                            "
                        >
                            Effect
                        </p>

                        <div className="space-y-2">

                            {effects
                                .slice(0, 2)
                                .map((
                                    effect: string,
                                    index: number
                                ) => (

                                    <div
                                        key={index}
                                        className="
                                            flex
                                            items-start
                                            gap-2
                                            text-sm
                                            text-zinc-300
                                        "
                                    >

                                        <span
                                            className="
                                                mt-1
                                                text-amber-400
                                            "
                                        >
                                            ◆
                                        </span>

                                        <span>
                                            {effect}
                                        </span>

                                    </div>

                                ))}

                        </div>

                    </div>

                )}

                {/* UNLOCK */}

                {unlocks.length > 0 && (

                    <div className="mt-5">

                        <p
                            className="
                                mb-2
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-sky-400
                            "
                        >
                            Unlock
                        </p>

                        <div className="space-y-2">

                            {unlocks
                                .slice(0, 2)
                                .map((
                                    unlock: string,
                                    index: number
                                ) => (

                                    <div
                                        key={index}
                                        className="
                                            flex
                                            items-start
                                            gap-2
                                            text-sm
                                            text-zinc-300
                                        "
                                    >

                                        <span
                                            className="
                                                mt-1
                                                text-violet-400
                                            "
                                        >
                                            ◆
                                        </span>

                                        <span>
                                            {unlock}
                                        </span>

                                    </div>

                                ))}

                        </div>

                    </div>

                )}

                {/* TAGS */}

                <div
                    className="
                        mt-6
                        flex
                        flex-wrap
                        gap-2
                    "
                >

                    <div
                        className="
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
                        Mount
                    </div>

                    {mount.quality && (

                        <div
                            className={`
            rounded-full
            border
            px-3
            py-1
            text-xs

            ${mount.quality === "White"

                                    ? `
                        border-zinc-500/20
                        bg-zinc-500/10
                        text-zinc-300
                    `

                                    : mount.quality === "Green"

                                        ? `
                        border-emerald-500/20
                        bg-emerald-500/10
                        text-emerald-300
                    `

                                        : mount.quality === "Blue"

                                            ? `
                        border-sky-500/20
                        bg-sky-500/10
                        text-sky-300
                    `

                                            : mount.quality === "Purple"

                                                ? `
                        border-violet-500/20
                        bg-violet-500/10
                        text-violet-300
                    `

                                                : mount.quality === "Gold"

                                                    ? `
                        border-amber-500/20
                        bg-amber-500/10
                        text-amber-300
                    `

                                                    : `
                    border-zinc-700
                    bg-zinc-900
                    text-zinc-300
                `
                                }
        `}
                        >
                            {mount.quality}
                        </div>

                    )}

                    {jobs
                        .slice(0, 2)
                        .map((
                            job: string
                        ) => (

                            <div
                                key={job}
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
                                {job}
                            </div>

                        ))}

                </div>

            </div>

        </Link>

    )

}