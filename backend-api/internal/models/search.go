package models

type SearchResult struct {
	Type string `json:"type"`

	Label string `json:"label"`

	Href string `json:"href"`

	Image *string `json:"image"`

	Description *string `json:"description"`
}
