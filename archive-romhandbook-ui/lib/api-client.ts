export class ApiError extends Error {
    status: number
    payload: unknown

    constructor(
        message: string,
        status: number,
        payload?: unknown
    ) {
        super(message)

        this.name = "ApiError"
        this.status = status
        this.payload = payload
    }
}

type ApiClientOptions =
    RequestInit & {
        auth?: boolean
    }

export async function apiFetch<T>(
    path: string,
    options: ApiClientOptions = {}
): Promise<T> {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    const url =
        path.startsWith("http")
            ? path
            : `${API_URL}${path}`

    const headers =
        new Headers(options.headers)

    if (
        options.body &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        )
    }

    const response =
        await fetch(
            url,
            {
                ...options,
                headers,
                credentials:
                    options.credentials || "include"
            }
        )

    const contentType =
        response.headers.get("content-type") || ""

    let payload: any = null

    if (contentType.includes("application/json")) {
        payload =
            await response
                .json()
                .catch(
                    () => null
                )
    } else {
        const text =
            await response
                .text()
                .catch(
                    () => ""
                )

        payload =
            text
                ? {
                    message: text
                }
                : null
    }

    if (!response.ok) {
        throw new ApiError(
            payload?.message || defaultErrorMessage(response.status),
            response.status,
            payload
        )
    }

    return payload as T
}

export function defaultErrorMessage(
    status: number
) {
    if (status === 401) {
        return "Please login first."
    }

    if (status === 403) {
        return "You do not have permission to access this."
    }

    if (status === 404) {
        return "The requested data was not found."
    }

    if (status === 429) {
        return "Too many requests. Please slow down."
    }

    if (status >= 500) {
        return "Server is having trouble. Please try again later."
    }

    return "Request failed. Please try again."
}

export function getApiErrorMessage(
    error: unknown
) {
    if (error instanceof ApiError) {
        return error.message
    }

    if (error instanceof Error) {
        return error.message
    }

    return "Something went wrong."
}