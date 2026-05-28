package models

type Job struct {
	ID string `json:"id"`

	Slug string `json:"slug"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`
}

type JobRelation struct {
	RelatedJobID *string `json:"related_job_id"`

	RelatedSlug *string `json:"related_slug"`

	RelatedName *string `json:"related_name"`

	RelationType string `json:"relation_type"`

	RelationIndex int `json:"relation_index"`
}

type JobSkill struct {
	SkillSlug *string `json:"skill_slug"`

	SkillName *string `json:"skill_name"`

	SkillImage *string `json:"skill_image"`

	SkillURL *string `json:"skill_url"`

	Section *string `json:"section"`

	MaxLevel *string `json:"max_level"`

	TagsRaw *string `json:"tags_raw"`

	Description *string `json:"description"`

	AesirRaw *string `json:"aesir_raw"`

	SkillIndex int `json:"skill_index"`
}

type JobRune struct {
	RuneSlug *string `json:"rune_slug"`

	RuneName *string `json:"rune_name"`

	RuneImage *string `json:"rune_image"`

	RuneURL *string `json:"rune_url"`

	TagsRaw *string `json:"tags_raw"`

	EffectsRaw *string `json:"effects_raw"`

	RuneIndex int `json:"rune_index"`
}

type JobDetail struct {
	ID string `json:"id"`

	Slug string `json:"slug"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	RawHTML *string `json:"raw_html"`

	Relations []JobRelation `json:"relations"`

	Skills []JobSkill `json:"skills"`

	Runes []JobRune `json:"runes"`
}