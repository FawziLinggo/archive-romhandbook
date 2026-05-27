package models

type Skill struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image string `json:"image"`

	Name string `json:"name"`

	MaxLevel int `json:"max_level"`

	SkillType  *string `json:"skill_type"`
	DamageType *string `json:"damage_type"`

	Cooldown   *string `json:"cooldown"`
	RangeValue *string `json:"range_value"`
	CastTime   *string `json:"cast_time"`

	Description *string `json:"description"`
}

type SkillListResponse struct {
	Success bool    `json:"success"`
	Data    []Skill `json:"data"`
	Meta    Meta    `json:"meta"`
}

type Meta struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`

	TotalPages int `json:"total_pages"`

	HasNext bool `json:"has_next"`
}

type SkillLevel struct {
	Level int `json:"level"`

	Description *string `json:"description"`

	RawTags *string `json:"raw_tags"`
}

type SkillDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image string `json:"image"`

	Name string `json:"name"`

	MaxLevel int `json:"max_level"`

	SkillType  *string `json:"skill_type"`
	DamageType *string `json:"damage_type"`

	Cooldown   *string `json:"cooldown"`
	RangeValue *string `json:"range_value"`

	CastTime *string `json:"cast_time"`

	FixedCastTime *string `json:"fixed_cast_time"`

	Description *string `json:"description"`

	FormulaRaw *string `json:"formula_raw"`

	AesirRaw *string `json:"aesir_raw"`

	RawHTML *string `json:"raw_html"`

	Levels []SkillLevel `json:"levels"`
}
