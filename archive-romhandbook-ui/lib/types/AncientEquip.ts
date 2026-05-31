export type AncientEquip = {
    id: string
    detail_url: string
    image: string | null
    name: string
    equip_type: string | null
    quality: string | null
    description: string | null
}

export type ThingFormula = {
    id: number
    formula_index: number
    formula_json: string | null
}

export type ThingRelation = {
    id: number
    relation_type: string
    related_id: string | null
    related_name: string | null
    related_image: string | null
    related_url: string | null
    quantity: string | null
    relation_index: number | null
}

export type AncientEquipDetail = AncientEquip & {
    equip_effects: string | null
    random_attributes: string | null
    unlock_text: string | null
    jobs: string | null
    raw_tags: string | null
    raw_html: string | null
    formulas: ThingFormula[]
    relations: ThingRelation[]
    materials: ThingRelation[]
    skills: ThingRelation[]
    jobs_relation: ThingRelation[]
    craftable: ThingRelation[]
    craft_materials: ThingRelation[]
}

export type PaginatedAncientEquipResponse = {
    success: boolean
    data: AncientEquip[]
    meta: {
        page: number
        limit: number
        total: number
        has_next: boolean
    }
}