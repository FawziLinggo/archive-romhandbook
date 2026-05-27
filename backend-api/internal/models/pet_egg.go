package models

type PetEgg struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image string `json:"image"`

	Name string `json:"name"`

	Description *string `json:"description"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	JobsRaw *string `json:"jobs_raw"`

	PetURL *string `json:"pet_url"`

	FormulasRaw *string `json:"formulas_raw"`

	RawHTML *string `json:"raw_html"`

	PetName *string `json:"pet_name"`

	PetImage *string `json:"pet_image"`
}
