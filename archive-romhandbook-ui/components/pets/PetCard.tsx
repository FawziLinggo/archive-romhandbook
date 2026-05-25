import Image from "next/image"
import Link from "next/link"

import { Pet } from "@/lib/queries/pets"

type PetSkill = {
    name: string
    url: string
    image: string
}

export default function PetCard({
    pet
}: {
    pet: Pet
}) {

    const skills =
        JSON.parse(
            pet.skills || "[]"
        ) as PetSkill[]

    return (

        <Link
            href={`/pets/${pet.detail_url}`}
            className="
                group
                rounded-3xl
                border
                border-white/10
                bg-gradient-to-b
                from-[#111827]
                to-[#0b1020]
                p-5
                transition-all
                duration-300
                hover:border-violet-500/50
                hover:shadow-[0_0_40px_rgba(139,92,246,0.18)]
            "
        >

            {/* HEADER */}
            <div className="flex items-start gap-4">

                <div
                    className="
                        relative
                        h-20
                        w-20
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-black/40
                    "
                >
                    <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                </div>

                <div className="flex-1">

                    <h2
                        className="
                            text-2xl
                            font-black
                            text-white
                            transition-colors
                            group-hover:text-violet-300
                        "
                    >
                        {pet.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-2">

                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">
                            {pet.race}
                        </span>

                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                            {pet.element}
                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                            {pet.size}
                        </span>

                    </div>

                </div>

            </div>

            {/* UNLOCK */}
            <div className="mt-5">

                <p className="text-xs text-zinc-500">
                    Unlock Bonus
                </p>

                <p className="mt-1 text-sm text-zinc-200">
                    {pet.unlock_text}
                </p>

            </div>

            {/* EGG */}
            <div
                className="
                    mt-4
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-white/5
                    bg-black/30
                    p-3
                "
            >

                <div
                    className="
                        relative
                        h-10
                        w-10
                        overflow-hidden
                        rounded-xl
                    "
                >
                    <Image
                        src={pet.egg_image}
                        alt={pet.egg_name}
                        fill
                        sizes="40px"
                        className="object-cover"
                    />
                </div>

                <div>

                    <p className="text-xs text-zinc-500">
                        Egg
                    </p>

                    <p className="text-sm text-zinc-200">
                        {pet.egg_name}
                    </p>

                </div>

            </div>

            {/* SKILLS */}
            <div className="mt-5">

                <p className="mb-3 text-xs text-zinc-500">
                    Skills
                </p>

                <div className="flex flex-wrap gap-2">

                    {skills
                        .slice(0, 5)
                        .map((skill) => (

                            <Link
                                key={skill.url}
                                href={skill.url}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-2
                                    py-1.5
                                    transition-all
                                    hover:border-violet-500/40
                                    hover:bg-violet-500/10
                                "
                            >

                                <div
                                    className="
                                        relative
                                        h-6
                                        w-6
                                        overflow-hidden
                                        rounded-md
                                    "
                                >
                                    <Image
                                        src={skill.image}
                                        alt={skill.name}
                                        fill
                                        sizes="24px"
                                        className="object-cover"
                                    />
                                </div>

                                <span
                                    className="
                                        text-xs
                                        text-zinc-200
                                    "
                                >
                                    {skill.name}
                                </span>

                            </Link>

                        ))}

                </div>

            </div>

        </Link>

    )

}