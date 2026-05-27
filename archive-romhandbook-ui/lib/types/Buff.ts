export type Buff = {

    id: string

    name: string

    detail_url: string

    image: string | null

    description: string | null

    raw_json: string | null
}

export type BuffDetail = {

    id: string

    name: string

    detail_url: string

    image: string | null

    description: string | null

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