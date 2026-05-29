package models

type DataHealthDashboard struct {
	Summary DataHealthSummary `json:"summary"`

	Tables []DataHealthTableMetric `json:"tables"`

	ThingTypeCounts []DataHealthNameCount `json:"thing_type_counts"`

	ThingConflicts []DataHealthThingConflict `json:"thing_conflicts"`

	UnknownLinkTypes []DataHealthUnknownLinkType `json:"unknown_link_types"`

	SearchIndex DataHealthSearchIndex `json:"search_index"`

	FormulaGraph DataHealthFormulaGraph `json:"formula_graph"`
}

type DataHealthSummary struct {
	TotalRows int `json:"total_rows"`

	ThingsTotal int `json:"things_total"`

	MissingThings int `json:"missing_things"`

	ThingConflicts int `json:"thing_conflicts"`

	RawHTMLMissing int `json:"raw_html_missing"`

	UnknownLinks int `json:"unknown_links"`

	SearchRows int `json:"search_rows"`

	GraphNodes int `json:"graph_nodes"`

	GraphEdges int `json:"graph_edges"`
}

type DataHealthTableMetric struct {
	Table string `json:"table"`

	ThingType string `json:"thing_type"`

	Total int `json:"total"`

	RawHTMLMissing int `json:"raw_html_missing"`

	DetailURLMissing int `json:"detail_url_missing"`

	ImageMissing int `json:"image_missing"`

	MissingThings int `json:"missing_things"`

	ThingConflicts int `json:"thing_conflicts"`

	IndexedInThings bool `json:"indexed_in_things"`
}

type DataHealthNameCount struct {
	Name string `json:"name"`

	Total int `json:"total"`
}

type DataHealthThingConflict struct {
	SourceTable string `json:"source_table"`

	ExpectedType string `json:"expected_type"`

	ExistingType string `json:"existing_type"`

	Total int `json:"total"`
}

type DataHealthUnknownLinkType struct {
	DetectedTypes string `json:"detected_types"`

	Total int `json:"total"`

	SamplePath string `json:"sample_path"`
}

type DataHealthSearchIndex struct {
	Total int `json:"total"`

	ByType []DataHealthNameCount `json:"by_type"`
}

type DataHealthFormulaGraph struct {
	Nodes int `json:"nodes"`

	Edges int `json:"edges"`

	NodesByType []DataHealthNameCount `json:"nodes_by_type"`
}
