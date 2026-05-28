package models

type Headwear struct {
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

	AvailabilityDate *string `json:"availability_date"`
}

type HeadwearDetail struct {
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

	AvailabilityDate *string `json:"availability_date"`

	RawHTML *string `json:"raw_html"`

	Formulas []HeadwearFormula `json:"formulas"`
}

type HeadwearFormula struct {
	ID int `json:"id"`

	HeadwearID string `json:"headwear_id"`

	FormulaIndex *int `json:"formula_index"`

	FormulaJSON *string `json:"formula_json"`
}
