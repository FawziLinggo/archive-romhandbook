export type Profile = {
    id: string
    email: string | null
    display_name: string
    avatar_url: string | null
    provider: string
    provider_user_id: string
    role: string
    status: string
    class_id: string | null
    class_name: string | null
    class_image: string | null
    rank_name: string
    points_total: number
    bio: string | null
}

export type JobClass = {
    id: string
    slug: string
    detail_url: string
    image: string | null
    name: string
}

export type ApiResponse<T> = {
    success: boolean
    data: T
    meta?: unknown
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