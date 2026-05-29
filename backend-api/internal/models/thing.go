package models

type ThingType struct {
	ID string `json:"id"`

	Type string `json:"type"`
}

type RandomSnapshotCard struct {
	ID string `json:"id"`

	Name string `json:"name"`

	Image *string `json:"image"`

	DetailURL string `json:"detail_url"`

	RawHTML *string `json:"raw_html"`

	CardType *string `json:"card_type"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	DroppedBy string `json:"dropped_by"`

	EffectTexts []string `json:"effect_texts"`
}

type ThingFormula struct {
	ID int `json:"id"`

	FormulaIndex int `json:"formula_index"`

	FormulaJSON *string `json:"formula_json"`
}

type ThingRelation struct {
	ID int `json:"id"`

	RelationType string `json:"relation_type"`

	RelatedID *string `json:"related_id"`

	RelatedName *string `json:"related_name"`

	RelatedImage *string `json:"related_image"`

	RelatedURL *string `json:"related_url"`

	Quantity *string `json:"quantity"`

	RelationIndex *int `json:"relation_index"`
}

type FurnitureDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	FurnitureType *string `json:"furniture_type"`

	FurnitureSubtype *string `json:"furniture_subtype"`

	IsBlueprint int `json:"is_blueprint"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	DepositStats *string `json:"deposit_stats"`

	RawTags *string `json:"raw_tags"`

	RawHTML *string `json:"raw_html"`

	Formulas []ThingFormula `json:"formulas"`

	Relations []ThingRelation `json:"relations"`

	CraftMaterials []ThingRelation `json:"craft_materials"`

	Craftable []ThingRelation `json:"craftable"`

	DroppedBy []ThingRelation `json:"dropped_by"`
}

type CookingIngredientDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	IngredientType *string `json:"ingredient_type"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	RawTags *string `json:"raw_tags"`

	RawHTML *string `json:"raw_html"`

	Formulas []ThingFormula `json:"formulas"`

	Relations []ThingRelation `json:"relations"`

	DroppedBy []ThingRelation `json:"dropped_by"`
}

type PetHeadwearUnlockItemDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	ItemType *string `json:"item_type"`

	PetHeadwearName *string `json:"pet_headwear_name"`

	PetName *string `json:"pet_name"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	FormulaID *string `json:"formula_id"`

	ComposeID *string `json:"compose_id"`

	UnlockItemID *string `json:"unlock_item_id"`

	UnlockEffectType *string `json:"unlock_effect_type"`

	UnlockBodyIDs *string `json:"unlock_body_ids"`

	RawTags *string `json:"raw_tags"`

	RawFormula *string `json:"raw_formula"`

	RawHTML *string `json:"raw_html"`

	Relations []ThingRelation `json:"relations"`

	CraftMaterials []ThingRelation `json:"craft_materials"`

	Craftable []ThingRelation `json:"craftable"`
}

type CraftingMaterialCraftable struct {
	ID int `json:"id"`

	MaterialID string `json:"material_id"`

	ItemName *string `json:"item_name"`

	ItemImage *string `json:"item_image"`

	ItemURL *string `json:"item_url"`
}

type CraftingMaterialDroppedBy struct {
	ID int `json:"id"`

	MaterialID string `json:"material_id"`

	MonsterName *string `json:"monster_name"`

	MonsterImage *string `json:"monster_image"`

	MonsterURL *string `json:"monster_url"`
}

type CraftingMaterialDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	MaterialType *string `json:"material_type"`

	Quality *string `json:"quality"`

	Description *string `json:"description"`

	RawHTML *string `json:"raw_html"`

	Formulas []ThingFormula `json:"formulas"`

	Craftable []CraftingMaterialCraftable `json:"craftable"`

	DroppedBy []CraftingMaterialDroppedBy `json:"dropped_by"`
}
