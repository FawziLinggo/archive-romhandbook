import CardItem from "@/components/cards/CardItem"
import Pagination from "@/components/common/Pagination"
import { getCards } from "@/lib/queries/cards"

export default async function CardsPage({
    searchParams
}: {
    searchParams: Promise<{
        q?: string
        type?: string
        quality?: string
        page?: string
    }>
}) {

    const params = await searchParams

    const query = params.q || ""

    const type =
        params.type || ""

    const quality =
        params.quality || ""

    const page = Number(
        params.page || "1"
    )
    const cards = getCards(
        query,
        type,
        quality,
        page
    )

    const prevUrl =
        `/cards?${new URLSearchParams({
            q: query,
            type,
            quality,
            page: String(page - 1)

        }).toString()}`

    const nextUrl =
        `/cards?${new URLSearchParams({
            q: query,
            type,
            quality,
            page: String(page + 1)
        }).toString()}`

    return (

        <div>

            {/* TITLE */}
            <div className="mb-6">

                <h1
                    className="
                        text-3xl
                        font-bold
                    "
                >
                    Cards
                </h1>

                <p className="text-zinc-400 mt-1">
                    Browse all ROM cards
                </p>

            </div>

            {/*filters*/}
            <form
                action="/cards"
                className="
        flex
        gap-3
        mb-6
        flex-wrap
    "
            >

                <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search card..."
                    className="
            bg-zinc-900
            border
            border-zinc-700
            rounded-xl
            px-4
            py-2
        "
                />

                <select
                    name="type"
                    defaultValue={type}
                    className="
            bg-zinc-900
            border
            border-zinc-700
            rounded-xl
            px-4
            py-2
        "
                >

                    <option value="">
                        All Types
                    </option>

                    <option value="Accessory Card">
                        Accessory Card
                    </option>

                    <option value="Armor Card">
                        Armor Card
                    </option>

                    <option value="Garments Card">
                        Garments Card
                    </option>

                    <option value="Headwear Card">
                        Headwear Card
                    </option>
                    <option value="Off Hand Card">
                        Off Hand Card
                    </option>
                    <option value="Shoe Card">
                        Shoe Card
                    </option>
                    <option value="Weapon Card">
                        Weapon Card
                    </option>

                </select>

                <select
                    name="quality"
                    defaultValue={quality}
                    className="
            bg-zinc-900
            border
            border-zinc-700
            rounded-xl
            px-4
            py-2
        "
                >

                    <option value="">
                        All Quality
                    </option>

                    <option value="White">
                        White
                    </option>

                    <option value="Green">
                        Green
                    </option>

                    <option value="Blue">
                        Blue
                    </option>

                    <option value="Purple">
                        Purple
                    </option>

                </select>

                <button
                    className="
            bg-violet-600
            hover:bg-violet-500
            px-5
            rounded-xl
        "
                >
                    Search
                </button>

            </form>

            {/* GRID */}
            <div
                className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:grid-cols-6
                    gap-5
                "
            >

                {cards.map((card: any) => (

                    <CardItem
                        key={card.id}
                        card={card}
                    />

                ))}

            </div>

            <Pagination
                page={page}
                hasNext={cards.length === 30}
                basePath="/cards"
                query={query}
                type={type}
                quality={quality}
            />

        </div >

    )
}