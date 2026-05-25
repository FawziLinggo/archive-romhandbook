import Image from "next/image"
import Link from "next/link"

type PetHeaderProps = {

    pet: {

        image: string

        name: string

        race: string

        element: string

        size: string

        description: string

        unlock_text: string | null

        egg_name: string | null

        egg_url: string | null

        egg_image: string | null
    }
}

const elementColors: Record<string, string> = {

    Fire:
        "from-red-500/10 to-red-950/5 border-red-500/20",

    Water:
        "from-sky-500/10 to-sky-950/5 border-sky-500/20",

    Wind:
        "from-emerald-500/10 to-emerald-950/5 border-emerald-500/20",

    Earth:
        "from-yellow-500/10 to-yellow-950/5 border-yellow-500/20",

    Shadow:
        "from-violet-500/10 to-violet-950/5 border-violet-500/20",

    Holy:
        "from-amber-500/10 to-amber-950/5 border-amber-500/20",

    Neutral:
        "from-zinc-500/10 to-zinc-950/5 border-zinc-500/20"
}

export default function PetHeader({

    pet

}: PetHeaderProps) {

    const glow =
        elementColors[pet.element]
        ||
        "from-zinc-500/10 to-zinc-950/5 border-white/10"

    return (

        <div
            className={`
                relative

                overflow-hidden

                rounded-3xl
                border

                bg-gradient-to-br

                ${glow}

                p-5
            `}
        >

            {/* GLOW */}
            <div
                className="
                    pointer-events-none

                    absolute
                    inset-0

                    bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]

                    opacity-60
                "
            />

            <div
                className="
                    relative
                    z-10

                    flex
                    items-start
                    gap-5
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

                        bg-black/30
                    "
                >

                    <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        sizes="96px"
                        className="
                            object-cover
                        "
                    />

                </div>

                {/* CONTENT */}
                <div
                    className="
                        min-w-0
                        flex-1
                    "
                >

                    {/* TITLE */}
                    <h1
                        className="
                            text-3xl
                            font-black
                            leading-tight
                            tracking-tight
                            text-white
                        "
                    >
                        {pet.name}
                    </h1>

                    {/* TAGS */}
                    <div
                        className="
                            mt-3

                            flex
                            flex-wrap
                            gap-2
                        "
                    >

                        <span
                            className="
                                rounded-full

                                bg-rose-500/15

                                px-3
                                py-1

                                text-xs
                                font-medium

                                text-rose-300
                            "
                        >
                            {pet.race}
                        </span>

                        <span
                            className="
                                rounded-full

                                bg-sky-500/15

                                px-3
                                py-1

                                text-xs
                                font-medium

                                text-sky-300
                            "
                        >
                            {pet.element}
                        </span>

                        <span
                            className="
                                rounded-full

                                bg-emerald-500/15

                                px-3
                                py-1

                                text-xs
                                font-medium

                                text-emerald-300
                            "
                        >
                            {pet.size}
                        </span>

                    </div>


                    {/* UNLOCK */}
                    {pet.unlock_text && (

                        <div
                            className="
                                mt-4

                                inline-flex
                                items-center
                                gap-2

                                rounded-xl

                                border
                                border-emerald-500/20

                                bg-emerald-500/5

                                px-3
                                py-2
                            "
                        >

                            <span
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider

                                    text-emerald-300
                                "
                            >
                                Unlock
                            </span>

                            <span
                                className="
                                    text-sm
                                    text-white
                                "
                            >
                                {pet.unlock_text}
                            </span>

                        </div>

                    )}


                    {/* EGG */}
                    {pet.egg_name && (

                        <div
                            className="
            mt-5
        "
                        >



                            <Link
                                href={pet.egg_url || "#"}
                                className="
                group

                flex
                items-center
                gap-3

                rounded-2xl

                border
                border-white/10

                bg-black/20

                p-3

                transition-all
                duration-300

                hover:border-violet-500/30
                hover:bg-violet-500/5
            "
                            >

                                {/* IMAGE */}
                                <div
                                    className="
                    relative

                    h-14
                    w-14

                    overflow-hidden

                    rounded-xl

                    border
                    border-white/10
                "
                                >

                                    <Image
                                        src={
                                            pet.egg_image
                                            ||
                                            pet.image
                                        }
                                        alt={pet.egg_name}
                                        fill
                                        sizes="56px"
                                        className="
                        object-cover
                    "
                                    />

                                </div>

                                {/* CONTENT */}
                                <div
                                    className="
                    min-w-0
                "
                                >

                                    <p
                                        className="
                        line-clamp-1

                        text-sm
                        font-semibold

                        text-white

                        transition-colors

                        group-hover:text-violet-300
                    "
                                    >
                                        {pet.egg_name}
                                    </p>

                                </div>

                            </Link>

                        </div>

                    )}

                </div>

            </div>

        </div>

    )

}