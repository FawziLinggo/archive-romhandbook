package models

type ROMMap struct {
	ID           string  `json:"id"`
	DetailURL    string  `json:"detail_url"`
	Image        *string `json:"image"`
	Name         string  `json:"name"`
	MonsterCount int     `json:"monster_count"`
}

type ROMMapMonster struct {
	ID            int     `json:"id"`
	MapID         string  `json:"map_id"`
	MonsterID     *string `json:"monster_id"`
	MonsterName   *string `json:"monster_name"`
	MonsterImage  *string `json:"monster_image"`
	MonsterURL    *string `json:"monster_url"`
	Level         *string `json:"level"`
	Race          *string `json:"race"`
	Element       *string `json:"element"`
	Size          *string `json:"size"`
	RelationIndex int     `json:"relation_index"`
}

type ROMMapDetail struct {
	ID        string          `json:"id"`
	DetailURL string          `json:"detail_url"`
	Image     *string         `json:"image"`
	Name      string          `json:"name"`
	RawHTML   *string         `json:"raw_html"`
	Monsters  []ROMMapMonster `json:"monsters"`
}
