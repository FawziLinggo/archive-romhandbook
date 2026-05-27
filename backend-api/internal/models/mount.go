package models

type Mount struct {
	ID string `json:"id"`

	Name string `json:"name"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	Jobs *string `json:"jobs"`
}

type MountDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	MountType *string `json:"mount_type"`

	Description *string `json:"description"`

	Quality *string `json:"quality"`

	EffectText *string `json:"effect_text"`

	UnlockText *string `json:"unlock_text"`

	Jobs *string `json:"jobs"`

	RawHTML *string `json:"raw_html"`
}
