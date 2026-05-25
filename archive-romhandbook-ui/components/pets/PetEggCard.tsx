import Image from "next/image"
import Link from "next/link"

type Props = {

    pet: {

        egg_name: string | null

        egg_image: string | null

        egg_url: string | null
    }
}

export default function PetEggCard({

    pet

}: Props) {

    if (
        !pet.egg_name
    ) {

        return null

    }

    return (

        <div>

            <h2
                className="
                    mb-4
                    text-2xl
                    font-black
                    text-white
                "
            >
                Pet Egg
            </h2>

            <Link
                href={
                    pet.egg_url || "#"
                }
                className="
                    group
                    flex
                    items-center
                    gap-4

                    rounded-3xl
                    border
                    border-white/10

                    bg-white/[0.03]

                    p-5

                    transition-all
                    duration-300

                    hover:border-violet-500/30
                    hover:bg-violet-500/5
                "
            >

                <div
                    className="
                        relative
                        h-20
                        w-20

                        overflow-hidden
                        rounded-2xl

                        border
                        border-white/10
                    "
                >

                    {pet.egg_image && (

                        <Image
                            src={pet.egg_image}
                            alt={pet.egg_name}
                            fill
                            sizes="80px"
                            className="
                                object-cover
                            "
                        />

                    )}

                </div>

                <div>

                    <h3
                        className="
                            mt-1
                            text-xl
                            font-bold
                            text-white

                            transition-colors
                            group-hover:text-violet-300
                        "
                    >
                        {pet.egg_name}
                    </h3>

                </div>

            </Link>

        </div>

    )

}