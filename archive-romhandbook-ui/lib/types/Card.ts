export type Card = {

    id: string
    effect_text: string | null


    name: string

    card_type: string | null

    quality: string | null

    image: string | null

    detail_url: string
}

export type CardFormula = {

    id: number

    formula_index: number | null

    formula_json: unknown
}

export type CardDetail = Card & {

    description: string | null

    effect_text: string | null

    raw_html: string | null

    effect_texts: string[]

    formulas: CardFormula[]

    deposit_texts: string[]

    unlock_texts: string[]

    craft_materials: unknown[]

    skills: unknown[]

    dropped_by: unknown[]

    craftable: unknown[]
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