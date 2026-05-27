package models

type Buff struct {
	ID string `json:"id"`

	Name string `json:"name"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Description *string `json:"description"`

	RawJSON *string `json:"raw_json,omitempty"`
}

type BuffDetail struct {
	ID string `json:"id"`

	Name string `json:"name"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Description *string `json:"description"`

	RawJSON *string `json:"raw_json"`

	RawHTML *string `json:"raw_html"`
}
