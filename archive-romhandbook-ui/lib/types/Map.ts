export type ROMMap = {
    id: string
    detail_url: string
    image: string | null
    name: string
    monster_count: number
}

export type ROMMapMonster = {
    id: number
    map_id: string
    monster_id: string | null
    monster_name: string | null
    monster_image: string | null
    monster_url: string | null
    level: string | null
    race: string | null
    element: string | null
    size: string | null
    relation_index: number
}

export type ROMMapDetail = {
    id: string
    detail_url: string
    image: string | null
    name: string
    raw_html: string | null
    monsters: ROMMapMonster[]
}

export type PaginatedMapResponse = {
    success: boolean
    data: ROMMap[]
    meta: {
        page: number
        limit: number
        total: number
        has_next: boolean
    }
}