import { assetUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type Skill = {

    name: string

    url: string

    image: string
}

type Props = {

    skills: Skill[]
}

export default function PetSkills({

    skills

}: Props) {

    if (
        skills.length <= 0
    ) {

        return null

    }

    return (

        <div>

            <h2
                className="
                    mb-4
                    text-xl
                    font-black
                    text-white
                "
            >
                Skills
            </h2>

            <div
                className="
                    flex
                    flex-wrap
                    gap-3
                "
            >

                {skills.map((skill) => (

                    <Link
                        key={skill.url}
                        href={skill.url}
                        className="
                            group

                            flex
                            items-center
                            gap-2

                            rounded-xl

                            border
                            border-white/10

                            bg-white/[0.03]

                            px-3
                            py-2

                            transition-all
                            duration-300

                            hover:border-sky-500/30
                            hover:bg-sky-500/5
                        "
                    >

                        <div
                            className="
                                relative
                                h-8
                                w-8

                                overflow-hidden
                                rounded-lg

                                border
                                border-white/10
                            "
                        >

                            <Image
                                src={assetUrl(skill.image)}
                                alt={skill.name}
                                fill
                                sizes="32px"
                                className="
                                    object-cover
                                "
                            />

                        </div>

                        <span
                            className="
                                max-w-[160px]
                                truncate

                                text-sm
                                font-medium
                                text-white

                                transition-colors

                                group-hover:text-sky-300
                            "
                        >
                            {skill.name}
                        </span>

                    </Link>

                ))}

            </div>

        </div>

    )

}