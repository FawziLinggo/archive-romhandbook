export type Mount = {

    id: string

    name: string

    detail_url: string

    image: string | null

    description: string | null

    quality: string | null

    effect_text: string | null

    unlock_text: string | null

    jobs: string | null
}

export type MountDetail = {

    id: string

    detail_url: string

    image: string | null

    name: string

    mount_type: string | null

    description: string | null

    quality: string | null

    effect_text: string | null

    unlock_text: string | null

    jobs: string | null

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