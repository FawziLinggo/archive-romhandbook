export type UserReport = {
    id: string
    user_id: string
    target_type: string | null
    target_id: string | null
    target_url: string | null
    title: string
    body: string
    status: string
    created_at: string
    updated_at: string
}

export type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    meta?: unknown
}
