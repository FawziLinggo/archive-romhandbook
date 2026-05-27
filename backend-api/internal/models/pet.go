package models

type Pet struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image string `json:"image"`

	Name string `json:"name"`

	Race *string `json:"race"`

	Element *string `json:"element"`

	Size *string `json:"size"`

	Description *string `json:"description"`

	UnlockText *string `json:"unlock_text"`

	EggID *string `json:"egg_id"`

	EggURL *string `json:"egg_url"`

	EggName *string `json:"egg_name"`

	EggImage *string `json:"egg_image"`

	Skills string `json:"skills"`
}

type PetDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image string `json:"image"`

	Name string `json:"name"`

	Race *string `json:"race"`

	Element *string `json:"element"`

	Size *string `json:"size"`

	Description *string `json:"description"`

	UnlockText *string `json:"unlock_text"`

	Skills string `json:"skills"`

	FormulasRaw *string `json:"formulas_raw"`

	RawHTML *string `json:"raw_html"`

	EggName *string `json:"egg_name"`

	EggImage *string `json:"egg_image"`

	EggURL *string `json:"egg_url"`
}
