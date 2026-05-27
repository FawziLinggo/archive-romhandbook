type Props = {

    value: string

    onChange: (
        value: string
    ) => void

    placeholder?: string

}

export default function SearchInput({

    value,
    onChange,
    placeholder = "Search..."

}: Props) {

    return (

        <input
            type="text"
            value={value}
            onChange={(e) =>

                onChange(
                    e.target.value
                )

            }
            placeholder={placeholder}
            className="
                h-14
                w-full

                rounded-2xl

                border
                border-white/10

                bg-zinc-950/80

                px-5

                text-white

                outline-none

                transition-all

                focus:border-violet-500/50
            "
        />

    )

}