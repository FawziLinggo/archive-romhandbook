export type RandomSnapshotCard = {

    id: string

    name: string

    image: string | null

    detail_url: string

    raw_html: string | null

    card_type: string | null

    quality: string | null

    effect_text: string | null

    dropped_by: string

    effect_texts: string[]
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

export type FurnitureDetail = {
    id: string
    detail_url: string
    image: string | null
    name: string
    furniture_type: string | null
    furniture_subtype: string | null
    is_blueprint: number | boolean
    description: string | null
    quality: string | null
    effect_text: string | null
    unlock_text: string | null
    deposit_stats: string | null
    raw_tags: string | null
    raw_html: string | null
    formulas: ThingFormula[]
    relations: ThingRelation[]
    craft_materials: ThingRelation[]
    craftable: ThingRelation[]
}

export type CookingIngredientDetail = {
    id: string
    detail_url: string
    image: string | null
    name: string
    ingredient_type: string | null
    description: string | null
    quality: string | null
    raw_tags: string | null
    raw_html: string | null
    formulas: ThingFormula[]
    relations: ThingRelation[]
    dropped_by: ThingRelation[]
}

export type PetHeadwearUnlockItemDetail = {
    id: string
    detail_url: string
    image: string | null
    name: string
    item_type: string | null
    pet_headwear_name: string | null
    pet_name: string | null
    description: string | null
    quality: string | null
    formula_id: string | null
    compose_id: string | null
    unlock_item_id: string | null
    unlock_effect_type: string | null
    unlock_body_ids: string | null
    raw_tags: string | null
    raw_formula: string | null
    raw_html: string | null
    relations: ThingRelation[]
    craft_materials: ThingRelation[]
}