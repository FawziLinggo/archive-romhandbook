export type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown

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

export type Equipment = {

    id: string

    detail_url: string

    image: string | null

    name: string

    type: string | null

    description: string | null

    quality: string | null

    effect_text: string | null

    unlock_text: string | null

    deposit_stats: string | null

    unlock_stats: string | null

    jobs: string | null

}

export type EquipmentFormula = {

    id: number

    equipment_id: string

    formula_id: string | null

    formula_index: number

    formula_json: string | null

}

export type EquipmentRelation = {

    id: number

    equipment_id: string

    relation_type: string

    related_id: string | null

    related_name: string | null

    related_image: string | null

    related_url: string | null

    relation_index: number | null

}

export type EquipmentTier = {

    id: number

    equipment_id: string

    tier_index: number

    tier_text: string

}

export type EquipmentEquipEffectItem = {

    id: number

    equip_effect_id: number

    item_id: string | null

    item_name: string | null

    item_image: string | null

    item_url: string | null

    item_index: number | null

}

export type EquipmentEquipEffect = {

    id: number

    equipment_id: string

    effect_index: number

    effect_text: string | null

    items: EquipmentEquipEffectItem[]

}

export type EquipmentDetail = Equipment & {

    formula_id: string | null

    raw_html: string | null

    formulas: EquipmentFormula[]

    tiers: EquipmentTier[]

    synth_from: EquipmentRelation[]

    synth_to: EquipmentRelation[]

    craft_materials: EquipmentRelation[]

    craftable: EquipmentRelation[]

    dropped_by: EquipmentRelation[]

    skills: EquipmentRelation[]

    equip_effects: EquipmentEquipEffect[]

}