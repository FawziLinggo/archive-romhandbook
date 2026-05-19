export function parseJsonArray(
    value?: string
) {

    try {

        return JSON.parse(
            value || "[]"
        )

    } catch {

        return []

    }

}