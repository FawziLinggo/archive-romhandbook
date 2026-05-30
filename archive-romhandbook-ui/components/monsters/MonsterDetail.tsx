import Image from "next/image"

import FormulaViewer from "@/components/common/FormulaViewer"
import RomHtmlViewerToggle from "@/components/common/RomHtmlViewerToggle"
import DetailContainer from "@/components/layout/DetailContainer"

import type {
    MonsterDetail as MonsterDetailType
} from "@/lib/types/Monster"
import { assetUrl } from "@/lib/utils"

type Props = {

    monster: MonsterDetailType
}

type StatPair = {

    leftLabel: string

    leftValue: string | number | null

    rightLabel: string

    rightValue: string | number | null
}


function displayValue(
    value: string | number | null
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-"
    }

    return value
}

function Chip({
    children,
    tone = "violet"
}: {
    children: React.ReactNode
    tone?: "violet" | "cyan" | "zinc"
}) {

    const styles = {
        violet:
            "border-violet-500/20 bg-violet-500/10 text-violet-300",

        cyan:
            "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",

        zinc:
            "border-zinc-700 bg-zinc-900 text-zinc-300"
    }

    return (
        <span
            className={`
                rounded-full
                border
                px-3
                py-1
                text-xs
                ${styles[tone]}
            `}
        >
            {children}
        </span>
    )
}

function StatTable({
    rows
}: {
    rows: StatPair[]
}) {

    return (
        <section
            className="
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-zinc-950/50
            "
        >
            <div
                className="
                    border-b
                    border-white/10
                    px-5
                    py-4
                "
            >
                <h2
                    className="
                        text-lg
                        font-bold
                        text-white
                    "
                >
                    Stats
                </h2>

                <p
                    className="
                        mt-1
                        text-sm
                        text-zinc-500
                    "
                >
                    Compact archived stat table
                </p>
            </div>

            <div className="divide-y divide-white/10">

                {rows.map((row) => (

                    <div
                        key={`${row.leftLabel}-${row.rightLabel}`}
                        className="
                            grid
                            grid-cols-2
                            gap-0
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-[110px_1fr]
                                items-center
                                gap-3
                                px-5
                                py-3
                            "
                        >
                            <div
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-zinc-500
                                "
                            >
                                {row.leftLabel}
                            </div>

                            <div
                                className="
                                    text-sm
                                    font-semibold
                                    text-zinc-100
                                "
                            >
                                {displayValue(row.leftValue)}
                            </div>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-[110px_1fr]
                                items-center
                                gap-3
                                border-l
                                border-white/10
                                px-5
                                py-3
                            "
                        >
                            <div
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-zinc-500
                                "
                            >
                                {row.rightLabel}
                            </div>

                            <div
                                className="
                                    text-sm
                                    font-semibold
                                    text-zinc-100
                                "
                            >
                                {displayValue(row.rightValue)}
                            </div>
                        </div>

                    </div>
                ))}

            </div>
        </section>
    )
}

export default function MonsterDetail({
    monster
}: Props) {

    const rows: StatPair[] = [
        {
            leftLabel: "Level",
            leftValue: monster.level,
            rightLabel: "HP",
            rightValue: monster.hp
        },
        {
            leftLabel: "Base EXP",
            leftValue: monster.base_exp,
            rightLabel: "Job EXP",
            rightValue: monster.job_exp
        },
        {
            leftLabel: "STR",
            leftValue: monster.str,
            rightLabel: "AGI",
            rightValue: monster.agi
        },
        {
            leftLabel: "VIT",
            leftValue: monster.vit,
            rightLabel: "INT",
            rightValue: monster.int_stat
        },
        {
            leftLabel: "DEX",
            leftValue: monster.dex,
            rightLabel: "LUK",
            rightValue: monster.luk
        },
        {
            leftLabel: "ATK",
            leftValue: monster.atk,
            rightLabel: "M.ATK",
            rightValue: monster.matk
        },
        {
            leftLabel: "DEF",
            leftValue: monster.def,
            rightLabel: "M.DEF",
            rightValue: monster.mdef
        },
        {
            leftLabel: "HIT",
            leftValue: monster.hit,
            rightLabel: "FLEE",
            rightValue: monster.flee
        },
        {
            leftLabel: "Move SPD",
            leftValue: monster.move_speed,
            rightLabel: "ASPD",
            rightValue: monster.aspd
        }
    ]

    return (

        <DetailContainer>

            <div
                className="
                    grid
                    gap-6
                    lg:grid-cols-[360px_1fr]
                "
            >

                <aside
                    className="
        rounded-3xl
        border
        border-violet-500/20
        bg-gradient-to-b
        from-zinc-950
        to-black
        p-6

        lg:sticky
        lg:top-24
        lg:self-start
    "
                >

                    <div
                        className="
                            relative
                            mx-auto
                            h-40
                            w-40
                            overflow-hidden
                            rounded-3xl
                            border
                            border-white/10
                            bg-black/40
                        "
                    >
                        <Image
                            src={assetUrl(monster.image)}
                            alt={monster.name}
                            fill
                            sizes="160px"
                            className="object-cover"
                        />
                    </div>

                    <div className="mt-6">

                        <div className="flex flex-wrap gap-2">

                            <Chip>
                                Monster
                            </Chip>

                            <Chip tone="cyan">
                                {monster.element || "Unknown Element"}
                            </Chip>

                            <Chip tone="zinc">
                                {monster.size || "Unknown Size"}
                            </Chip>

                        </div>

                        <h1
                            className="
                                mt-4
                                text-3xl
                                font-black
                                leading-tight
                                text-white
                            "
                        >
                            {monster.name}
                        </h1>

                        <p
                            className="
                                mt-3
                                text-sm
                                leading-6
                                text-zinc-400
                            "
                        >
                            {monster.race || "Unknown Race"}
                            {" · "}
                            {monster.element || "Unknown Element"}
                            {" · "}
                            {monster.size || "Unknown Size"}
                        </p>

                        <div
                            className="
                                mt-5
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-4
                            "
                        >
                            <div
                                className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-zinc-500
                                "
                            >
                                Location
                            </div>

                            <div
                                className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-zinc-100
                                "
                            >
                                {monster.location || "Unknown"}
                            </div>
                        </div>

                    </div>

                </aside>

                <div className="space-y-6">

                    <StatTable
                        rows={rows}
                    />

                    {monster.raw_json && (

                        <FormulaViewer
                            title="Raw Monster JSON"
                            code={monster.raw_json}
                            language="json"
                        />
                    )}

                    {monster.raw_html && (

                        <RomHtmlViewerToggle
                            html={monster.raw_html}
                        />
                    )}

                </div>

            </div>

        </DetailContainer>
    )
}