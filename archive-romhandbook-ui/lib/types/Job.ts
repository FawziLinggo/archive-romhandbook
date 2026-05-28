export type Job = {

    id: string

    slug: string

    detail_url: string

    image: string | null

    name: string
}

export type JobRelation = {

    related_job_id: string | null

    related_slug: string | null

    related_name: string | null

    relation_type: string

    relation_index: number
}

export type JobSkill = {

    skill_slug: string | null

    skill_name: string | null

    skill_image: string | null

    skill_url: string | null

    section: string | null

    max_level: string | null

    tags_raw: string | null

    description: string | null

    aesir_raw: string | null

    skill_index: number
}

export type JobRune = {

    rune_slug: string | null

    rune_name: string | null

    rune_image: string | null

    rune_url: string | null

    tags_raw: string | null

    effects_raw: string | null

    rune_index: number
}

export type JobDetail = Job & {

    raw_html: string | null

    relations: JobRelation[]

    skills: JobSkill[]

    runes: JobRune[]
}

export type PaginatedApiResponse<T> = {

    success: boolean

    data: T[]

    meta: {

        page: number

        limit: number

        total: number

        has_next: boolean
    }
}

export type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown
}