export function slugify(text: string) {

    return text
        .toLowerCase()
        .replace(/★/g, "star")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

}