export type Monster = {

    id: string

    detail_url: string

    image: string | null

    name: string

    race: string | null

    element: string | null

    size: string | null

    location: string | null

    level: number | null

    hp: string | null

    base_exp: string | null

    job_exp: string | null
}

export type MonsterDetail = Monster & {

    str: number | null

    agi: number | null

    vit: number | null

    int_stat: number | null

    dex: number | null

    luk: number | null

    atk: string | null

    matk: string | null

    def: string | null

    mdef: string | null

    hit: string | null

    flee: string | null

    move_speed: string | null

    aspd: string | null

    raw_json: string | null

    raw_html: string | null
}

export type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown
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