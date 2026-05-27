package models

type CountTotal struct {
	Total int `json:"total"`
}

type ArchiveCounts struct {
	Cards CountTotal `json:"cards"`

	Equipments CountTotal `json:"equipments"`

	Headwears CountTotal `json:"headwears"`

	Monsters CountTotal `json:"monsters"`

	Mounts CountTotal `json:"mounts"`

	Pets CountTotal `json:"pets"`

	Skills CountTotal `json:"skills"`

	Buffs CountTotal `json:"buffs"`

	Formulas CountTotal `json:"formulas"`
}
