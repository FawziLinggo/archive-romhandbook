import Link from "next/link"

type Props = {

    page: number

    total: number

    basePath: string

    query?: string

}

const PAGE_SIZE = 20

export default function PaginationSearch({

    page,
    total,
    basePath,
    query = ""

}: Props) {

    // =====================
    // TOTAL PAGES
    // =====================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / PAGE_SIZE
            )
        )

    // =====================
    // CREATE URL
    // =====================

    function createUrl(
        nextPage: number
    ) {

        const params =
            new URLSearchParams()

        // search query
        if (query) {

            params.set(
                "q",
                query
            )

        }

        // page
        params.set(
            "page",
            String(nextPage)
        )

        return `
            ${basePath}?
            ${params.toString()}
        `

    }

    // =====================
    // PAGE NUMBERS
    // =====================

    const pages: number[] = []

    const startPage =
        Math.max(
            1,
            page - 1
        )

    const endPage =
        Math.min(
            totalPages,
            page + 1
        )

    for (
        let i = startPage;
        i <= endPage;
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
                flex-wrap
            "
        >

            {/* PREV */}
            <Link
                href={createUrl(

                    Math.max(
                        1,
                        page - 1
                    )

                )}
                className={`
                    h-12
                    px-5
                    rounded-2xl
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
                            bg-zinc-950
                        `

                        : `
                            border-zinc-700
                            bg-zinc-900

                            hover:border-violet-500
                            hover:bg-violet-600
                        `
                    }
                `}
            >

                ← Prev

            </Link>

            {/* PAGE NUMBERS */}
            {pages.map((p) => (

                <Link
                    key={p}
                    href={createUrl(p)}
                    className={`
                        w-12
                        h-12
                        rounded-2xl

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
                                bg-zinc-900
                                border
                                border-zinc-800
                                text-zinc-300

                                hover:bg-zinc-800
                            `
                        }
                    `}
                >

                    {p}

                </Link>

            ))}

            {/* NEXT */}
            <Link
                href={createUrl(

                    Math.min(
                        totalPages,
                        page + 1
                    )

                )}
                className={`
                    h-12
                    px-5
                    rounded-2xl
                    border

                    flex
                    items-center
                    justify-center

                    transition-all

                    ${page >= totalPages

                        ? `
                            pointer-events-none
                            opacity-40
                            border-zinc-800
                            bg-zinc-950
                        `

                        : `
                            border-zinc-700
                            bg-zinc-900

                            hover:border-violet-500
                            hover:bg-violet-600
                        `
                    }
                `}
            >

                Next →

            </Link>

        </div>

    )

}