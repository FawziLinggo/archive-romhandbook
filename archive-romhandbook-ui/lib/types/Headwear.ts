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

export type Headwear = {

    id: string

    detail_url: string

    image: string | null

    name: string

    type: string | null

    description: string | null

    quality: string | null

    effect_text: string | null

    unlock_text: string | null

    deposit_stats: string | null

    unlock_stats: string | null

    jobs: string | null

    availability_date: string | null

}

export type HeadwearFormula = {

    id: number

    headwear_id: string

    formula_index: number | null

    formula_json: string | null

}

export type HeadwearDetail = Headwear & {

    formula_id: string | null

    raw_html: string | null

    formulas: HeadwearFormula[]

}