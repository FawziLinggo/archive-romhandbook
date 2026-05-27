const API_URL =
    process.env.NEXT_PUBLIC_API_URL

export async function apiFetch<T>(

    endpoint: string

): Promise<T> {

    const res =
        await fetch(

            `${API_URL}${endpoint}`,

            {
                cache: "no-store"
            }
        )

    if (!res.ok) {

        throw new Error(
            "API Error"
        )

    }

    return res.json()
}