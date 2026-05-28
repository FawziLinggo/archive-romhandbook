package models

type Monster struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	Race *string `json:"race"`

	Element *string `json:"element"`

	Size *string `json:"size"`

	Location *string `json:"location"`

	Level *int `json:"level"`

	HP *string `json:"hp"`

	BaseEXP *string `json:"base_exp"`

	JobEXP *string `json:"job_exp"`
}

type MonsterDetail struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Image *string `json:"image"`

	Name string `json:"name"`

	Race *string `json:"race"`

	Element *string `json:"element"`

	Size *string `json:"size"`

	Location *string `json:"location"`

	Level *int `json:"level"`

	HP *string `json:"hp"`

	BaseEXP *string `json:"base_exp"`

	JobEXP *string `json:"job_exp"`

	STR *int `json:"str"`

	AGI *int `json:"agi"`

	VIT *int `json:"vit"`

	INTStat *int `json:"int_stat"`

	DEX *int `json:"dex"`

	LUK *int `json:"luk"`

	ATK *string `json:"atk"`

	MATK *string `json:"matk"`

	DEF *string `json:"def"`

	MDEF *string `json:"mdef"`

	HIT *string `json:"hit"`

	FLEE *string `json:"flee"`

	MoveSpeed *string `json:"move_speed"`

	ASPD *string `json:"aspd"`

	RawJSON *string `json:"raw_json"`

	RawHTML *string `json:"raw_html"`
}
