export type Formula = {

    id: number

    detail_url: string

    name: string

    formula_code: string
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