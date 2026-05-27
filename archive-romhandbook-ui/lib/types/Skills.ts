export type Skill = {

    id: string

    detail_url: string

    image: string

    name: string

    max_level: number

    skill_type: string | null

    damage_type: string | null

    cooldown: string | null

    range_value: string | null

    cast_time: string | null

    description: string | null
}

export type SkillListResponse = {

    success: boolean

    data: Skill[]

    meta: {

        page: number

        limit: number

        total: number

        total_pages: number

        has_next: boolean
    }
}

export type SkillLevel = {

    level: number

    description: string | null

    raw_tags: string | null
}