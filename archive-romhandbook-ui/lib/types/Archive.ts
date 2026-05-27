export type CountTotal = {

    total: number
}

export type ArchiveCounts = {

    cards: CountTotal

    equipments: CountTotal

    headwears: CountTotal

    monsters: CountTotal

    mounts: CountTotal

    pets: CountTotal

    skills: CountTotal

    buffs: CountTotal

    formulas: CountTotal
}

export type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown
}