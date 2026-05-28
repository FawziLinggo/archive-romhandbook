package models

type Card struct {
	ID string `json:"id"`

	Name string `json:"name"`

	CardType *string `json:"card_type"`

	Quality *string `json:"quality"`

	Image *string `json:"image"`

	DetailURL  string  `json:"detail_url"`
	EffectText *string `json:"effect_text"`
}

type CardDetail struct {
	ID string `json:"id"`

	Name string `json:"name"`

	CardType *string `json:"card_type"`

	Quality *string `json:"quality"`

	Image *string `json:"image"`

	DetailURL string `json:"detail_url"`

	Description *string `json:"description"`

	EffectText *string `json:"effect_text"`

	RawHTML *string `json:"raw_html"`

	EffectTexts []string `json:"effect_texts"`

	Formulas []CardFormula `json:"formulas"`

	DepositTexts []string `json:"deposit_texts"`

	UnlockTexts []string `json:"unlock_texts"`

	CraftMaterials []CardCraftMaterial `json:"craft_materials"`

	Skills []CardSkill `json:"skills"`

	DroppedBy []CardDroppedBy `json:"dropped_by"`

	Craftable []CardCraftable `json:"craftable"`
}

type CardFormula struct {
	ID int `json:"id"`

	FormulaIndex *int `json:"formula_index"`

	FormulaJSON any `json:"formula_json"`
}

type CardCraftMaterial struct {
	ID int `json:"id"`

	MaterialName *string `json:"material_name"`

	MaterialImage *string `json:"material_image"`

	MaterialURL *string `json:"material_url"`

	MaterialType *string `json:"material_type"`
}

type CardSkill struct {
	ID int `json:"id"`

	SkillName *string `json:"skill_name"`

	SkillImage *string `json:"skill_image"`

	SkillURL *string `json:"skill_url"`
}

type CardDroppedBy struct {
	ID int `json:"id"`

	MonsterName *string `json:"monster_name"`

	MonsterImage *string `json:"monster_image"`

	MonsterURL *string `json:"monster_url"`
}

type CardCraftable struct {
	ID int `json:"id"`

	ItemName *string `json:"item_name"`

	ItemImage *string `json:"item_image"`

	ItemURL *string `json:"item_url"`
}
