package models

type Formula struct {
	ID string `json:"id"`

	DetailURL string `json:"detail_url"`

	Name string `json:"name"`

	FormulaCode string `json:"formula_code"`
}

type FormulaGraphNode struct {
	NodeKey string `json:"node_key"`

	NodeType string `json:"node_type"`

	RefID string `json:"ref_id"`

	Label *string `json:"label"`

	DetailURL *string `json:"detail_url"`

	Image *string `json:"image"`

	MetaJSON *string `json:"meta_json"`
}

type FormulaGraphEdge struct {
	ID int `json:"id"`

	FromNodeKey string `json:"from_node_key"`

	ToNodeKey string `json:"to_node_key"`

	EdgeType string `json:"edge_type"`

	Evidence *string `json:"evidence"`

	SourceTable *string `json:"source_table"`

	SourceID *string `json:"source_id"`
}

type FormulaGraph struct {
	FormulaID string `json:"formula_id"`

	Depth int `json:"depth"`

	Nodes []FormulaGraphNode `json:"nodes"`

	Edges []FormulaGraphEdge `json:"edges"`
}

type FormulaGraphSummaryItem struct {
	NodeType string `json:"node_type"`

	NodeCount int `json:"node_count"`

	EdgeCount int `json:"edge_count"`
}

type FormulaGraphSummary struct {
	FormulaID string `json:"formula_id"`

	NodeTypes []FormulaGraphSummaryItem `json:"node_types"`
}

type FormulaGraphNodeRelations struct {
	NodeType string `json:"node_type"`

	RefID string `json:"ref_id"`

	Depth int `json:"depth"`

	Center FormulaGraphNode `json:"center"`

	Nodes []FormulaGraphNode `json:"nodes"`

	Edges []FormulaGraphEdge `json:"edges"`
}
