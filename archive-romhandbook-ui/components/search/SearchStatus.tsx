type Props = {

    query: string

    loading: boolean

    count: number

}

export default function SearchStatus({

    query,
    loading,
    count

}: Props) {

    if (loading) {

        return (

            <div
                className="
                    text-sm
                    text-zinc-500
                "
            >
                Searching...
            </div>

        )

    }

    if (
        query.length > 0 &&
        query.length < 4
    ) {

        return (

            <div
                className="
                    text-sm
                    text-zinc-500
                "
            >
                Type at least 4 characters to search
            </div>

        )

    }

    if (query.length >= 3) {

        return (

            <div
                className="
                    text-sm
                    text-zinc-500
                "
            >


                {count === 0
                    ? "No results found"
                    : count >= 24
                        ? "24+ results found, go to next page"
                        : `${count} result${count > 1 ? "s" : ""} found`
                }
            </div>

        )

    }

    return null

}