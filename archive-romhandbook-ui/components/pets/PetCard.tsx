import Image from "next/image"
import Link from "next/link"

import type {
    Pet
} from "@/lib/types/Pets"
import { assetUrl } from "@/lib/utils"

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

    // =====================
    // SAFE SKILLS
    // =====================

    const skills = (() => {

        try {

            if (!pet.skills)
                return []

            return JSON.parse(
                pet.skills
            ) as PetSkill[]

        } catch {

            return []

        }

    })()

    return (

        <div
            className="
                group

                rounded-3xl

                border
                border-white/10

                bg-zinc-950/90
                p-5

                transition-all
                duration-300

                hover:border-violet-500/50
                hover:border-violet-500/30
            "
        >

            {/* HEADER */}
            <div className="flex items-start gap-4">

                {/* IMAGE */}
                <Link
                    href={
                        pet.detail_url.startsWith("/pets/")
                            ? pet.detail_url
                            : `/pets/${pet.detail_url}`
                    }
                    className="
                        relative

                        h-20
                        w-20

                        overflow-hidden

                        rounded-2xl

                        border
                        border-white/10

                        bg-zinc-900
                    "
                >

                    {pet.image && (

                        <Image
                            src={assetUrl(pet.image)}
                            alt={pet.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />

                    )}

                </Link>

                {/* INFO */}
                <div className="flex-1">

                    <Link
                        href={
                            pet.detail_url.startsWith("/pets/")
                                ? pet.detail_url
                                : `/pets/${pet.detail_url}`
                        }
                        className="
        group
        block
    "
                    >

                        <h2
                            className="
                                text-2xl
                                font-black
                                text-white

                                transition-colors

                                hover:text-violet-300
                            "
                        >
                            {pet.name}
                        </h2>

                    </Link>

                    <div className="mt-2 flex flex-wrap gap-2">

                        {pet.race && (

                            <span
                                className="
                                    rounded-full

                                    bg-red-500/10

                                    px-3
                                    py-1

                                    text-xs
                                    text-red-300
                                "
                            >
                                {pet.race}
                            </span>

                        )}

                        {pet.element && (

                            <span
                                className="
                                    rounded-full

                                    bg-sky-500/10

                                    px-3
                                    py-1

                                    text-xs
                                    text-sky-300
                                "
                            >
                                {pet.element}
                            </span>

                        )}

                        {pet.size && (

                            <span
                                className="
                                    rounded-full

                                    bg-emerald-500/10

                                    px-3
                                    py-1

                                    text-xs
                                    text-emerald-300
                                "
                            >
                                {pet.size}
                            </span>

                        )}

                    </div>

                </div>

            </div>

            {/* UNLOCK */}
            {pet.unlock_text && (

                <div className="mt-5">

                    <p
                        className="
                            text-xs
                            text-zinc-500
                        "
                    >
                        Unlock Bonus
                    </p>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-zinc-200
                        "
                    >
                        {pet.unlock_text}
                    </p>

                </div>

            )}

            {/* EGG */}
            {(pet.egg_name || pet.egg_image) && (

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

                    {/* EGG IMAGE */}
                    <div
                        className="
                            relative

                            h-10
                            w-10

                            overflow-hidden

                            rounded-xl
                        "
                    >

                        {pet.egg_image && (

                            <Image
                                src={assetUrl(pet.egg_image)}
                                alt={pet.egg_name || "Egg"}
                                fill
                                sizes="40px"
                                className="object-cover"
                            />

                        )}

                    </div>

                    {/* EGG INFO */}
                    <div>

                        <p
                            className="
                                text-xs
                                text-zinc-500
                            "
                        >
                            Egg
                        </p>

                        {pet.egg_url ? (

                            <Link
                                href={pet.egg_url}
                                className="
                                    text-sm
                                    text-zinc-200

                                    transition-colors

                                    hover:text-violet-300
                                "
                            >
                                {pet.egg_name}
                            </Link>

                        ) : (

                            <p
                                className="
                                    text-sm
                                    text-zinc-200
                                "
                            >
                                {pet.egg_name}
                            </p>

                        )}

                    </div>

                </div>

            )}


            {/* UNLOCK */}
            {pet.unlock_text && (

                <div className="mt-4">

                    <p
                        className="
                mb-2
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-zinc-500
            "
                    >
                        Unlock Bonus
                    </p>

                    <div
                        className="
                rounded-2xl
                border
                border-emerald-500/10
                bg-emerald-500/5
                px-4
                py-3
            "
                    >

                        <p
                            className="
                    text-sm
                    leading-relaxed
                    text-emerald-200
                "
                        >
                            {pet.unlock_text}
                        </p>

                    </div>

                </div>

            )}



            {/* SKILLS */}
            {skills.length > 0 && (

                <div className="mt-5">

                    <p
                        className="
                            mb-3
                            text-xs
                            text-zinc-500
                        "
                    >
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

                                        bg-zinc-900

                                        px-2
                                        py-1.5

                                        transition-all

                                        hover:border-violet-500/40
                                        hover:bg-violet-500/10
                                    "
                                >

                                    {/* SKILL IMAGE */}
                                    <div
                                        className="
                                            relative

                                            h-6
                                            w-6

                                            overflow-hidden

                                            rounded-md
                                        "
                                    >

                                        {skill.image && (

                                            <Image
                                                src={assetUrl(skill.image)}
                                                alt={skill.name}
                                                fill
                                                sizes="24px"
                                                className="object-cover"
                                            />

                                        )}

                                    </div>

                                    {/* SKILL NAME */}
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

            )}

        </div>

    )

}