export type ServerFetchError =
    | "not_found"
    | "unauthorized"
    | "forbidden"
    | "rate_limited"
    | "server_error"
    | "connection_error"
    | "invalid_response"

export type ServerFetchResult<T> =
    | {
        data: T
        error: null
        status: number
    }
    | {
        data: null
        error: ServerFetchError
        status: number | null
    }

type ServerApiResponse<T> = {
    success: boolean
    data: T
    message?: string
}

type ServerFetchOptions = RequestInit & {
    revalidate?: number
}

export async function serverApiFetch<T>(
    path: string,
    options: ServerFetchOptions = {}
): Promise<ServerFetchResult<T>> {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    if (!API_URL) {
        return {
            data: null,
            error: "connection_error",
            status: null
        }
    }

    const url =
        path.startsWith("http")
            ? path
            : `${API_URL}${path}`

    try {
        const res =
            await fetch(
                url,
                {
                    ...options,
                    next: {
                        revalidate:
                            options.revalidate ?? 60
                    }
                }
            )

        if (res.status === 404) {
            return {
                data: null,
                error: "not_found",
                status: res.status
            }
        }

        if (res.status === 401) {
            return {
                data: null,
                error: "unauthorized",
                status: res.status
            }
        }

        if (res.status === 403) {
            return {
                data: null,
                error: "forbidden",
                status: res.status
            }
        }

        if (res.status === 429) {
            return {
                data: null,
                error: "rate_limited",
                status: res.status
            }
        }

        if (!res.ok) {
            return {
                data: null,
                error: "server_error",
                status: res.status
            }
        }

        const json =
            await res.json() as ServerApiResponse<T>

        if (!json || typeof json !== "object" || !("data" in json)) {
            return {
                data: null,
                error: "invalid_response",
                status: res.status
            }
        }

        return {
            data: json.data,
            error: null,
            status: res.status
        }
    } catch {
        return {
            data: null,
            error: "connection_error",
            status: null
        }
    }
}

export async function serverApiFetchEnvelope<T>(
    path: string,
    options: ServerFetchOptions = {}
): Promise<ServerFetchResult<T>> {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL

    if (!API_URL) {
        return {
            data: null,
            error: "connection_error",
            status: null
        }
    }

    const url =
        path.startsWith("http")
            ? path
            : `${API_URL}${path}`

    try {
        const res =
            await fetch(
                url,
                {
                    ...options,
                    next: {
                        revalidate:
                            options.revalidate ?? 60
                    }
                }
            )

        if (res.status === 404) {
            return {
                data: null,
                error: "not_found",
                status: res.status
            }
        }

        if (res.status === 401) {
            return {
                data: null,
                error: "unauthorized",
                status: res.status
            }
        }

        if (res.status === 403) {
            return {
                data: null,
                error: "forbidden",
                status: res.status
            }
        }

        if (res.status === 429) {
            return {
                data: null,
                error: "rate_limited",
                status: res.status
            }
        }

        if (!res.ok) {
            return {
                data: null,
                error: "server_error",
                status: res.status
            }
        }

        const json =
            await res.json() as T

        if (!json || typeof json !== "object") {
            return {
                data: null,
                error: "invalid_response",
                status: res.status
            }
        }

        return {
            data: json,
            error: null,
            status: res.status
        }
    } catch {
        return {
            data: null,
            error: "connection_error",
            status: null
        }
    }
}