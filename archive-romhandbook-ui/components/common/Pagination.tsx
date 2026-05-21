import Link from "next/link"

type Props = {
    page: number
    hasNext: boolean
    basePath: string
    query?: string
    type?: string
    quality?: string
}

export default function Pagination({
    page,
    hasNext,
    basePath,
    query = "",
    type = "",
    quality = ""
}: Props) {

    // =====================
    // CREATE URL
    // =====================

    function createUrl(
        nextPage: number
    ) {

        return `${basePath}?${new URLSearchParams({

            q: query,
            type,
            quality,
            page: String(nextPage)

        }).toString()}`

    }

    // =====================
    // PAGE NUMBERS
    // =====================

    const pages = []

    for (
        let i = Math.max(1, page - 1);
        i <= page + 1;
        i++
    ) {

        pages.push(i)

    }

    return (

        <div
            className="
                flex
                items-center
                justify-center
                gap-2
                mt-12
            "
        >

            {/* PREV */}
            <Link
                href={createUrl(
                    Math.max(1, page - 1)
                )}
                className={`
                    w-12
                    h-12
                    rounded-xl
                    border
                    flex
                    items-center
                    justify-center
                    transition-all

                    ${page <= 1
                        ? `
                            pointer-events-none
                            opacity-40
                            border-zinc-800
                            bg-zinc-900
                        `
                        : `
                            border-violet-500/30
                            bg-zinc-900
                            hover:bg-violet-600
                            hover:border-violet-500
                        `
                    }
                `}
            >
                ←
            </Link>

            {/* PAGE NUMBERS */}
            {pages.map((p) => (

                <Link
                    key={p}
                    href={createUrl(p)}
                    className={`
                        w-12
                        h-12
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        font-semibold
                        transition-all

                        ${p === page
                            ? `
                                bg-violet-600
                                text-white
                                shadow-lg
                                shadow-violet-500/20
                            `
                            : `
                                bg-zinc-800
                                text-zinc-300
                                hover:bg-zinc-700
                            `
                        }
                    `}
                >
                    {p}
                </Link>

            ))}

            {/* NEXT */}
            <Link
                href={createUrl(page + 1)}
                className={`
                    w-12
                    h-12
                    rounded-xl
                    border
                    flex
                    items-center
                    justify-center
                    transition-all

                    ${!hasNext
                        ? `
                            pointer-events-none
                            opacity-40
                            border-zinc-800
                            bg-zinc-900
                        `
                        : `
                            border-violet-500/30
                            bg-zinc-900
                            hover:bg-violet-600
                            hover:border-violet-500
                        `
                    }
                `}
            >
                →
            </Link>

        </div>

    )

}