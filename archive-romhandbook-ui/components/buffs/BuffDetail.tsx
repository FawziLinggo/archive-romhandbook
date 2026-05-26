import Image from "next/image"

import FormulaViewer from "@/components/common/FormulaViewer"
import RomHtmlViewerToggle from "../common/RomHtmlViewerToggle"
import DetailContainer from "../layout/DetailContainer"

type Props = {

    buff: any

}

export default function BuffDetail({
    buff
}: Props) {

    return (

        <DetailContainer>

            {/* HERO */}

            <div
                className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-violet-500/20
                    bg-gradient-to-br
                    from-violet-950/40
                    via-black
                    to-cyan-950/20
                    p-8
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-6

                        md:flex-row
                        md:items-start
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
                            src={
                                buff.image ||
                                "/placeholder.png"
                            }
                            alt={buff.name}
                            fill
                            sizes="64px"
                            className="
                                object-cover
                            "
                        />

                    </div>

                    {/* INFO */}

                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            className="
                                inline-flex
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
                            Arcane Buff
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
                            {buff.name}
                        </h1>

                        <p
                            className="
                                mt-4
                                max-w-3xl
                                text-base
                                leading-7
                                text-zinc-300
                            "
                        >

                            {buff.description ||

                                "Ancient magical effect archived from Ragnarok Mobile."

                            }

                        </p>

                        <div
                            className="
                                mt-5
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
                                Buff
                            </div>

                            <div
                                className="
                                    rounded-full
                                    border
                                    border-cyan-500/20
                                    bg-cyan-500/10
                                    px-3
                                    py-1
                                    text-xs
                                    text-cyan-300
                                "
                            >
                                Formula
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* JSON */}

            {buff.raw_json && (

                <FormulaViewer
                    title="Formula JSON"
                    code={buff.raw_json}
                    language="json"
                />

            )}

            {/* HTML SNAPSHOT */}

            {buff.raw_html && (
                <RomHtmlViewerToggle
                    html={buff.raw_html}
                />

            )}

        </DetailContainer>

    )

}