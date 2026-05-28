package models

type Equipment struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	Type *string `json:"type"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	DepositStats *string `json:"deposit_stats"`

	UnlockStats *string `json:"unlock_stats"`

	Jobs *string `json:"jobs"`
}

type EquipmentDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	Type *string `json:"type"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	DepositStats *string `json:"deposit_stats"`

	UnlockStats *string `json:"unlock_stats"`

	Jobs *string `json:"jobs"`

	FormulaID *string `json:"formula_id"`

	RawHTML *string `json:"raw_html"`

	Formulas []EquipmentFormula `json:"formulas"`

	Tiers []EquipmentTier `json:"tiers"`

	SynthFrom []EquipmentRelation `json:"synth_from"`

	SynthTo []EquipmentRelation `json:"synth_to"`

	CraftMaterials []EquipmentRelation `json:"craft_materials"`

	Craftable []EquipmentRelation `json:"craftable"`

	DroppedBy []EquipmentRelation `json:"dropped_by"`

	Skills []EquipmentRelation `json:"skills"`

	EquipEffects []EquipmentEquipEffect `json:"equip_effects"`
}

type EquipmentFormula struct {
	ID int `json:"id"`

	EquipmentID string `json:"equipment_id"`

	FormulaID *string `json:"formula_id"`

	FormulaIndex int `json:"formula_index"`

	FormulaJSON *string `json:"formula_json"`
}

type EquipmentRelation struct {
	ID int `json:"id"`

	EquipmentID string `json:"equipment_id"`

	RelationType string `json:"relation_type"`

	RelatedID *string `json:"related_id"`

	RelatedName *string `json:"related_name"`

	RelatedImage *string `json:"related_image"`

	RelatedURL *string `json:"related_url"`

	RelationIndex *int `json:"relation_index"`
}

type EquipmentTier struct {
	ID int `json:"id"`

	EquipmentID string `json:"equipment_id"`

	TierIndex int `json:"tier_index"`

	TierText string `json:"tier_text"`
}

type EquipmentEquipEffect struct {
	ID int `json:"id"`

	EquipmentID string `json:"equipment_id"`

	EffectIndex int `json:"effect_index"`

	EffectText *string `json:"effect_text"`

	Items []EquipmentEquipEffectItem `json:"items"`
}

type EquipmentEquipEffectItem struct {
	ID int `json:"id"`

	EquipEffectID int `json:"equip_effect_id"`

	ItemID *string `json:"item_id"`

	ItemName *string `json:"item_name"`

	ItemImage *string `json:"item_image"`

	ItemURL *string `json:"item_url"`

	ItemIndex *int `json:"item_index"`
}
