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
