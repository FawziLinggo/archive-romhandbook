type Props = {
    title: string
    items?: string[]
}

export default function InfoSection({
    title,
    items
}: Props) {

    if (!items?.length) {
        return null
    }

    return (

        <div
            className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900/60
                p-6
            "
        >

            <h2
                className="
                    text-lg
                    font-semibold
                    text-white
                    mb-4
                "
            >
                {title}
            </h2>

            <div className="space-y-3">

                {items.map((item, index) => (

                    <div
                        key={index}
                        className="
                            flex
                            gap-3
                            text-zinc-300
                        "
                    >

                        <div
                            className="
                                w-2
                                h-2
                                rounded-full
                                bg-violet-400
                                mt-2
                                shrink-0
                            "
                        />

                        <p className="leading-7">
                            {item}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    )

}