import type {
    Skill
} from "@/lib/types/Skills"

import SkillCard from "./SkillCard"

type Props = {

    skills: Skill[]

}

export default function SkillGrid({

    skills

}: Props) {

    if (!skills.length) {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-center
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    py-24
                "
            >

                <div className="text-center">

                    <h3 className="text-2xl font-bold text-white">
                        No skills found
                    </h3>

                    <p className="mt-3 text-zinc-500">
                        Try another keyword or filter.
                    </p>

                </div>

            </div>

        )

    }

    return (

        <div
            className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
            "
        >

            {skills.map((skill) => (

                <SkillCard
                    key={skill.id}
                    skill={skill}
                />

            ))}

        </div>

    )

}