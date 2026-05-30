export function slugify(text: string) {

    return text
        .toLowerCase()
        .replace(/★/g, "star")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

}

export function assetUrl(
    path?: string | null
) {
    if (!path) {
        return ""
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:") ||
        path.startsWith("blob:")
    ) {
        return path
    }

    const baseUrl =
        process.env.NEXT_PUBLIC_ASSET_BASE_URL

    if (!baseUrl) {
        return path
    }

    if (path.startsWith("/assets/")) {
        return `${baseUrl}${path}`
    }

    if (path.startsWith("assets/")) {
        return `${baseUrl}/${path}`
    }

    return path
}