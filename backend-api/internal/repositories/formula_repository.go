package repositories

import (
	"database/sql"
	"sort"
	"strings"

	"backend-api/internal/models"
)

func GetFormulas(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.Formula,
	int,
	bool,
	error,
) {
	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	var total int

	totalSQL := `
		SELECT
			COUNT(*)

		FROM formulas_code

		WHERE
			1 = 1
	`

	totalArgs :=
		[]any{}

	if query != "" {
		totalSQL += `
			AND (
				name LIKE ?
				OR formula_code LIKE ?
			)
		`

		totalArgs = append(
			totalArgs,
			search,
			search,
		)
	}

	err :=
		db.QueryRow(
			totalSQL,
			totalArgs...,
		).Scan(&total)

	if err != nil {
		return nil, 0, false, err
	}

	sqlQuery := `
		SELECT
			id,
			detail_url,
			name,
			formula_code

		FROM formulas_code

		WHERE
			1 = 1
	`

	args :=
		[]any{}

	if query != "" {
		sqlQuery += `
			AND (
				name LIKE ?
				OR formula_code LIKE ?
			)
		`

		args = append(
			args,
			search,
			search,
		)
	}

	sqlQuery += `
		ORDER BY
			name ASC

		LIMIT ?
		OFFSET ?
	`

	args = append(
		args,
		limit+1,
		offset,
	)

	rows, err :=
		db.Query(
			sqlQuery,
			args...,
		)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	formulas :=
		[]models.Formula{}

	for rows.Next() {
		var formula models.Formula

		err := rows.Scan(
			&formula.ID,
			&formula.DetailURL,
			&formula.Name,
			&formula.FormulaCode,
		)

		if err != nil {
			return nil, 0, false, err
		}

		formulas = append(
			formulas,
			formula,
		)
	}

	hasNext :=
		len(formulas) > limit

	if hasNext {
		formulas = formulas[:limit]
	}

	return formulas, total, hasNext, nil
}

func SearchFormulas(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Formula,
	int,
	bool,
	error,
) {
	if len(query) < 3 {
		return []models.Formula{}, 0, false, nil
	}

	return GetFormulas(
		db,
		page,
		limit,
		query,
	)
}

func GetFeaturedFormula(
	db *sql.DB,
) (
	*models.Formula,
	error,
) {
	var formula models.Formula

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			name,
			formula_code

		FROM formulas_code

		ORDER BY RANDOM()

		LIMIT 1

	`).Scan(
		&formula.ID,
		&formula.DetailURL,
		&formula.Name,
		&formula.FormulaCode,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &formula, nil
}

func GetFormulaBySlug(
	db *sql.DB,
	slug string,
) (
	*models.Formula,
	error,
) {
	var formula models.Formula

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			name,
			formula_code

		FROM formulas_code

		WHERE
			detail_url LIKE '%' || ? || '%'

		LIMIT 1

	`, slug).Scan(
		&formula.ID,
		&formula.DetailURL,
		&formula.Name,
		&formula.FormulaCode,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &formula, nil
}

func parseGraphNodeTypeFilter(
	value string,
) map[string]bool {
	result :=
		map[string]bool{}

	for _, item := range strings.Split(value, ",") {
		item =
			strings.TrimSpace(item)

		if item == "" {
			continue
		}

		result[item] = true
	}

	return result
}

func graphHasNodeTypeFilter(
	filter map[string]bool,
) bool {
	return len(filter) > 0
}

func graphPlaceholders(
	count int,
) string {
	return strings.TrimRight(
		strings.Repeat("?,", count),
		",",
	)
}

func graphKeysToSlice(
	keys map[string]bool,
) []string {
	result :=
		[]string{}

	for key := range keys {
		result = append(
			result,
			key,
		)
	}

	sort.Strings(result)

	return result
}

func getFormulaGraphCenterNodes(
	db *sql.DB,
	formulaID string,
) (
	[]models.FormulaGraphNode,
	error,
) {
	candidates :=
		[]string{
			formulaID,
			"formula_code:" + formulaID,
			"formula_id:" + formulaID,
			"formula_json:" + formulaID,
			"buff_json:" + formulaID,
		}

	args :=
		[]any{}

	for _, candidate := range candidates {
		args = append(
			args,
			candidate,
		)
	}

	args = append(
		args,
		formulaID,
	)

	rows, err :=
		db.Query(`

			SELECT
				node_key,
				node_type,
				ref_id,
				label,
				detail_url,
				image,
				meta_json

			FROM formula_graph_nodes

			WHERE node_key IN (`+graphPlaceholders(len(candidates))+`)
			   OR ref_id = ?

			ORDER BY
				CASE node_type
					WHEN 'formula_code' THEN 0
					WHEN 'formula_id' THEN 1
					WHEN 'formula_json' THEN 2
					WHEN 'buff_json' THEN 3
					ELSE 9
				END,
				label COLLATE NOCASE ASC

		`, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	nodes :=
		[]models.FormulaGraphNode{}

	for rows.Next() {
		var node models.FormulaGraphNode

		err := rows.Scan(
			&node.NodeKey,
			&node.NodeType,
			&node.RefID,
			&node.Label,
			&node.DetailURL,
			&node.Image,
			&node.MetaJSON,
		)

		if err != nil {
			return nil, err
		}

		nodes = append(
			nodes,
			node,
		)
	}

	return nodes, rows.Err()
}

func getFormulaGraphNodesByKeys(
	db *sql.DB,
	keys map[string]bool,
) (
	[]models.FormulaGraphNode,
	error,
) {
	keyList :=
		graphKeysToSlice(keys)

	if len(keyList) == 0 {
		return []models.FormulaGraphNode{}, nil
	}

	args :=
		[]any{}

	for _, key := range keyList {
		args = append(
			args,
			key,
		)
	}

	rows, err :=
		db.Query(`

			SELECT
				node_key,
				node_type,
				ref_id,
				label,
				detail_url,
				image,
				meta_json

			FROM formula_graph_nodes

			WHERE node_key IN (`+graphPlaceholders(len(keyList))+`)

		`, args...)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	nodes :=
		[]models.FormulaGraphNode{}

	for rows.Next() {
		var node models.FormulaGraphNode

		err := rows.Scan(
			&node.NodeKey,
			&node.NodeType,
			&node.RefID,
			&node.Label,
			&node.DetailURL,
			&node.Image,
			&node.MetaJSON,
		)

		if err != nil {
			return nil, err
		}

		nodes = append(
			nodes,
			node,
		)
	}

	return nodes, rows.Err()
}

func getFormulaGraphEdgesForKeys(
	db *sql.DB,
	keys map[string]bool,
	limit int,
	edgeType string,
	nodeTypeFilter map[string]bool,
) (
	[]models.FormulaGraphEdge,
	error,
) {
	keyList :=
		graphKeysToSlice(keys)

	if len(keyList) == 0 || limit <= 0 {
		return []models.FormulaGraphEdge{}, nil
	}

	args :=
		[]any{}

	for _, key := range keyList {
		args = append(
			args,
			key,
		)
	}

	for _, key := range keyList {
		args = append(
			args,
			key,
		)
	}

	sqlQuery := `

		SELECT
			e.id,
			e.from_node_key,
			e.to_node_key,
			e.edge_type,
			e.evidence,
			e.source_table,
			e.source_id

		FROM formula_graph_edges e

		JOIN formula_graph_nodes from_node
			ON from_node.node_key = e.from_node_key

		JOIN formula_graph_nodes to_node
			ON to_node.node_key = e.to_node_key

		WHERE (
			e.from_node_key IN (` + graphPlaceholders(len(keyList)) + `)
			OR e.to_node_key IN (` + graphPlaceholders(len(keyList)) + `)
		)
	`

	if edgeType != "" {
		sqlQuery += `
			AND e.edge_type = ?
		`

		args = append(
			args,
			edgeType,
		)
	}

	if graphHasNodeTypeFilter(nodeTypeFilter) {
		nodeTypeList :=
			graphKeysToSlice(nodeTypeFilter)

		sqlQuery += `
			AND (
				from_node.node_type IN (` + graphPlaceholders(len(nodeTypeList)) + `)
				OR to_node.node_type IN (` + graphPlaceholders(len(nodeTypeList)) + `)
			)
		`

		for _, nodeType := range nodeTypeList {
			args = append(
				args,
				nodeType,
			)
		}

		for _, nodeType := range nodeTypeList {
			args = append(
				args,
				nodeType,
			)
		}
	}

	sqlQuery += `
		ORDER BY
			CASE e.edge_type
				WHEN 'CODE_REFERENCES_CARD_FORMULA' THEN 0
				WHEN 'CODE_REFERENCES_EQUIPMENT_FORMULA' THEN 1
				WHEN 'CODE_REFERENCES_HEADWEAR_FORMULA' THEN 2
				WHEN 'CODE_CHECKS_BUFF' THEN 3
				WHEN 'RESOLVES_TO_FORMULA_CODE' THEN 4
				WHEN 'HAS_FORMULA_ID' THEN 5
				WHEN 'HAS_FORMULA_JSON' THEN 6
				WHEN 'JSON_REFERENCES_BUFF' THEN 7
				WHEN 'CODE_MENTIONS_ID' THEN 9
				ELSE 8
			END,
			e.id ASC

		LIMIT ?
	`

	args = append(
		args,
		limit,
	)

	rows, err :=
		db.Query(
			sqlQuery,
			args...,
		)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	edges :=
		[]models.FormulaGraphEdge{}

	for rows.Next() {
		var edge models.FormulaGraphEdge

		err := rows.Scan(
			&edge.ID,
			&edge.FromNodeKey,
			&edge.ToNodeKey,
			&edge.EdgeType,
			&edge.Evidence,
			&edge.SourceTable,
			&edge.SourceID,
		)

		if err != nil {
			return nil, err
		}

		edges = append(
			edges,
			edge,
		)
	}

	return edges, rows.Err()
}

func GetFormulaGraphByID(
	db *sql.DB,
	formulaID string,
	depth int,
	limit int,
	edgeType string,
	nodeType string,
) (
	*models.FormulaGraph,
	error,
) {
	if formulaID == "" {
		return nil, nil
	}

	if depth < 0 {
		depth = 0
	}

	if depth > 3 {
		depth = 3
	}

	if limit <= 0 {
		limit = 250
	}

	if limit > 1000 {
		limit = 1000
	}

	nodeTypeFilter :=
		parseGraphNodeTypeFilter(
			nodeType,
		)

	centerNodes, err :=
		getFormulaGraphCenterNodes(
			db,
			formulaID,
		)

	if err != nil {
		return nil, err
	}

	if len(centerNodes) == 0 {
		return nil, nil
	}

	nodesByKey :=
		map[string]models.FormulaGraphNode{}

	edgesByID :=
		map[int]models.FormulaGraphEdge{}

	frontier :=
		map[string]bool{}

	expanded :=
		map[string]bool{}

	for _, node := range centerNodes {
		nodesByKey[node.NodeKey] = node
		frontier[node.NodeKey] = true
	}

	for level := 0; level < depth; level++ {
		if len(frontier) == 0 {
			break
		}

		active :=
			map[string]bool{}

		for key := range frontier {
			if !expanded[key] {
				active[key] = true
				expanded[key] = true
			}
		}

		if len(active) == 0 {
			break
		}

		remaining :=
			limit - len(edgesByID)

		if remaining <= 0 {
			break
		}

		edges, err :=
			getFormulaGraphEdgesForKeys(
				db,
				active,
				remaining,
				edgeType,
				nodeTypeFilter,
			)

		if err != nil {
			return nil, err
		}

		missingNodes :=
			map[string]bool{}

		nextFrontier :=
			map[string]bool{}

		for _, edge := range edges {
			edgesByID[edge.ID] = edge

			endpoints :=
				[]string{
					edge.FromNodeKey,
					edge.ToNodeKey,
				}

			for _, endpoint := range endpoints {
				if _, exists := nodesByKey[endpoint]; !exists {
					missingNodes[endpoint] = true
				}

				if !expanded[endpoint] {
					nextFrontier[endpoint] = true
				}
			}
		}

		nodes, err :=
			getFormulaGraphNodesByKeys(
				db,
				missingNodes,
			)

		if err != nil {
			return nil, err
		}

		for _, node := range nodes {
			nodesByKey[node.NodeKey] = node
		}

		frontier = nextFrontier
	}

	if graphHasNodeTypeFilter(nodeTypeFilter) {
		filteredEdgesByID :=
			map[int]models.FormulaGraphEdge{}

		filteredNodeKeys :=
			map[string]bool{}

		for _, node := range centerNodes {
			filteredNodeKeys[node.NodeKey] = true
		}

		for id, edge := range edgesByID {
			fromNode, hasFrom :=
				nodesByKey[edge.FromNodeKey]

			toNode, hasTo :=
				nodesByKey[edge.ToNodeKey]

			if !hasFrom || !hasTo {
				continue
			}

			fromMatches :=
				nodeTypeFilter[fromNode.NodeType]

			toMatches :=
				nodeTypeFilter[toNode.NodeType]

			if !fromMatches && !toMatches {
				continue
			}

			filteredEdgesByID[id] = edge

			filteredNodeKeys[edge.FromNodeKey] = true
			filteredNodeKeys[edge.ToNodeKey] = true
		}

		filteredNodesByKey :=
			map[string]models.FormulaGraphNode{}

		for key := range filteredNodeKeys {
			if node, exists := nodesByKey[key]; exists {
				filteredNodesByKey[key] = node
			}
		}

		nodesByKey = filteredNodesByKey
		edgesByID = filteredEdgesByID
	}

	nodes :=
		[]models.FormulaGraphNode{}

	for _, node := range nodesByKey {
		nodes = append(
			nodes,
			node,
		)
	}

	sort.Slice(
		nodes,
		func(i int, j int) bool {
			if nodes[i].NodeType == nodes[j].NodeType {
				return nodes[i].NodeKey < nodes[j].NodeKey
			}

			return nodes[i].NodeType < nodes[j].NodeType
		},
	)

	edges :=
		[]models.FormulaGraphEdge{}

	for _, edge := range edgesByID {
		edges = append(
			edges,
			edge,
		)
	}

	sort.Slice(
		edges,
		func(i int, j int) bool {
			return edges[i].ID < edges[j].ID
		},
	)

	return &models.FormulaGraph{
		FormulaID: formulaID,
		Depth:     depth,
		Nodes:     nodes,
		Edges:     edges,
	}, nil
}

func GetFormulaGraphSummaryByID(
	db *sql.DB,
	formulaID string,
	edgeType string,
) (
	*models.FormulaGraphSummary,
	error,
) {
	if formulaID == "" {
		return nil, nil
	}

	centerNodes, err :=
		getFormulaGraphCenterNodes(
			db,
			formulaID,
		)

	if err != nil {
		return nil, err
	}

	if len(centerNodes) == 0 {
		return nil, nil
	}

	centerKeys :=
		map[string]bool{}

	for _, node := range centerNodes {
		centerKeys[node.NodeKey] = true
	}

	centerKeyList :=
		graphKeysToSlice(centerKeys)

	args :=
		[]any{}

	for _, key := range centerKeyList {
		args = append(args, key)
	}

	for _, key := range centerKeyList {
		args = append(args, key)
	}

	for _, key := range centerKeyList {
		args = append(args, key)
	}

	sqlQuery := `

		WITH neighbor_edges AS (
			SELECT
				e.id,
				CASE
					WHEN e.from_node_key IN (` + graphPlaceholders(len(centerKeyList)) + `)
						THEN e.to_node_key
					ELSE e.from_node_key
				END AS node_key

			FROM formula_graph_edges e

			WHERE (
				e.from_node_key IN (` + graphPlaceholders(len(centerKeyList)) + `)
				OR e.to_node_key IN (` + graphPlaceholders(len(centerKeyList)) + `)
			)
	`

	if edgeType != "" {
		sqlQuery += `
			AND e.edge_type = ?
		`

		args = append(args, edgeType)
	}

	sqlQuery += `
		),

		neighbor_nodes AS (
			SELECT
				ne.id AS edge_id,
				n.node_key,
				n.node_type

			FROM neighbor_edges ne

			JOIN formula_graph_nodes n
				ON n.node_key = ne.node_key

			WHERE n.node_key NOT IN (` + graphPlaceholders(len(centerKeyList)) + `)
		)

		SELECT
			node_type,
			COUNT(DISTINCT node_key) AS node_count,
			COUNT(DISTINCT edge_id) AS edge_count

		FROM neighbor_nodes

		GROUP BY node_type

		ORDER BY
			node_count DESC,
			edge_count DESC,
			node_type ASC
	`

	for _, key := range centerKeyList {
		args = append(args, key)
	}

	rows, err :=
		db.Query(
			sqlQuery,
			args...,
		)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items :=
		[]models.FormulaGraphSummaryItem{}

	for rows.Next() {
		var item models.FormulaGraphSummaryItem

		err := rows.Scan(
			&item.NodeType,
			&item.NodeCount,
			&item.EdgeCount,
		)

		if err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &models.FormulaGraphSummary{
		FormulaID: formulaID,
		NodeTypes: items,
	}, nil
}

func getFormulaGraphNodeByKey(
	db *sql.DB,
	nodeKey string,
) (
	*models.FormulaGraphNode,
	error,
) {
	var node models.FormulaGraphNode

	err := db.QueryRow(`

		SELECT
			node_key,
			node_type,
			ref_id,
			label,
			detail_url,
			image,
			meta_json

		FROM formula_graph_nodes

		WHERE node_key = ?

		LIMIT 1

	`, nodeKey).Scan(
		&node.NodeKey,
		&node.NodeType,
		&node.RefID,
		&node.Label,
		&node.DetailURL,
		&node.Image,
		&node.MetaJSON,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &node, nil
}

func GetFormulaGraphNodeRelations(
	db *sql.DB,
	nodeType string,
	refID string,
	depth int,
	limit int,
	edgeType string,
	nodeTypeFilter string,
) (
	*models.FormulaGraphNodeRelations,
	error,
) {
	if nodeType == "" || refID == "" {
		return nil, nil
	}

	if depth < 0 {
		depth = 0
	}

	if depth > 3 {
		depth = 3
	}

	if limit <= 0 {
		limit = 30
	}

	if limit > 500 {
		limit = 500
	}

	centerKey :=
		nodeType + ":" + refID

	centerNode, err :=
		getFormulaGraphNodeByKey(
			db,
			centerKey,
		)

	if err != nil {
		return nil, err
	}

	if centerNode == nil {
		return nil, nil
	}

	filter :=
		parseGraphNodeTypeFilter(
			nodeTypeFilter,
		)

	nodesByKey :=
		map[string]models.FormulaGraphNode{
			centerNode.NodeKey: *centerNode,
		}

	edgesByID :=
		map[int]models.FormulaGraphEdge{}

	frontier :=
		map[string]bool{
			centerNode.NodeKey: true,
		}

	expanded :=
		map[string]bool{}

	for level := 0; level < depth; level++ {
		if len(frontier) == 0 {
			break
		}

		active :=
			map[string]bool{}

		for key := range frontier {
			if !expanded[key] {
				active[key] = true
				expanded[key] = true
			}
		}

		if len(active) == 0 {
			break
		}

		remaining :=
			limit - len(edgesByID)

		if remaining <= 0 {
			break
		}

		edges, err :=
			getFormulaGraphEdgesForKeys(
				db,
				active,
				remaining,
				edgeType,
				filter,
			)

		if err != nil {
			return nil, err
		}

		missingNodes :=
			map[string]bool{}

		nextFrontier :=
			map[string]bool{}

		for _, edge := range edges {
			edgesByID[edge.ID] = edge

			endpoints :=
				[]string{
					edge.FromNodeKey,
					edge.ToNodeKey,
				}

			for _, endpoint := range endpoints {
				if _, exists := nodesByKey[endpoint]; !exists {
					missingNodes[endpoint] = true
				}

				if !expanded[endpoint] {
					nextFrontier[endpoint] = true
				}
			}
		}

		nodes, err :=
			getFormulaGraphNodesByKeys(
				db,
				missingNodes,
			)

		if err != nil {
			return nil, err
		}

		for _, node := range nodes {
			nodesByKey[node.NodeKey] = node
		}

		frontier = nextFrontier
	}

	nodes :=
		[]models.FormulaGraphNode{}

	for _, node := range nodesByKey {
		nodes = append(
			nodes,
			node,
		)
	}

	sort.Slice(
		nodes,
		func(i int, j int) bool {
			if nodes[i].NodeKey == centerNode.NodeKey {
				return true
			}

			if nodes[j].NodeKey == centerNode.NodeKey {
				return false
			}

			if nodes[i].NodeType == nodes[j].NodeType {
				return nodes[i].NodeKey < nodes[j].NodeKey
			}

			return nodes[i].NodeType < nodes[j].NodeType
		},
	)

	edges :=
		[]models.FormulaGraphEdge{}

	for _, edge := range edgesByID {
		edges = append(
			edges,
			edge,
		)
	}

	sort.Slice(
		edges,
		func(i int, j int) bool {
			return edges[i].ID < edges[j].ID
		},
	)

	return &models.FormulaGraphNodeRelations{
		NodeType: nodeType,
		RefID:    refID,
		Depth:    depth,
		Center:   *centerNode,
		Nodes:    nodes,
		Edges:    edges,
	}, nil
}

func GetFormulaGraphMeta(
	db *sql.DB,
) (
	*models.FormulaGraphMeta,
	error,
) {
	nodeRows, err :=
		db.Query(`

			SELECT
				node_type,
				COUNT(*) AS total

			FROM formula_graph_nodes

			GROUP BY node_type

			ORDER BY
				total DESC,
				node_type ASC

		`)

	if err != nil {
		return nil, err
	}

	defer nodeRows.Close()

	nodeTypes :=
		[]models.FormulaGraphNodeTypeCount{}

	for nodeRows.Next() {
		var item models.FormulaGraphNodeTypeCount

		err := nodeRows.Scan(
			&item.NodeType,
			&item.Total,
		)

		if err != nil {
			return nil, err
		}

		nodeTypes = append(
			nodeTypes,
			item,
		)
	}

	if err := nodeRows.Err(); err != nil {
		return nil, err
	}

	edgeRows, err :=
		db.Query(`

			SELECT
				edge_type,
				COUNT(*) AS total

			FROM formula_graph_edges

			GROUP BY edge_type

			ORDER BY
				total DESC,
				edge_type ASC

		`)

	if err != nil {
		return nil, err
	}

	defer edgeRows.Close()

	edgeTypes :=
		[]models.FormulaGraphEdgeTypeCount{}

	for edgeRows.Next() {
		var item models.FormulaGraphEdgeTypeCount

		err := edgeRows.Scan(
			&item.EdgeType,
			&item.Total,
		)

		if err != nil {
			return nil, err
		}

		edgeTypes = append(
			edgeTypes,
			item,
		)
	}

	if err := edgeRows.Err(); err != nil {
		return nil, err
	}

	return &models.FormulaGraphMeta{
		NodeTypes: nodeTypes,
		EdgeTypes: edgeTypes,
	}, nil
}

func SearchFormulaGraphNodes(
	db *sql.DB,
	query string,
	nodeTypeFilter string,
	limit int,
) (
	[]models.FormulaGraphNode,
	error,
) {
	query =
		strings.TrimSpace(query)

	if len(query) < 2 {
		return []models.FormulaGraphNode{}, nil
	}

	if limit <= 0 {
		limit = 20
	}

	if limit > 50 {
		limit = 50
	}

	filter :=
		parseGraphNodeTypeFilter(
			nodeTypeFilter,
		)

	search :=
		"%" + query + "%"

	prefix :=
		query + "%"

	args :=
		[]any{
			search,
			search,
			search,
			search,
		}

	sqlQuery := `

		SELECT
			node_key,
			node_type,
			ref_id,
			label,
			detail_url,
			image,
			meta_json

		FROM formula_graph_nodes

		WHERE (
			LOWER(node_key) LIKE LOWER(?)
			OR LOWER(ref_id) LIKE LOWER(?)
			OR LOWER(COALESCE(label, '')) LIKE LOWER(?)
			OR LOWER(COALESCE(detail_url, '')) LIKE LOWER(?)
		)
	`

	if graphHasNodeTypeFilter(filter) {
		nodeTypes :=
			graphKeysToSlice(
				filter,
			)

		sqlQuery += `
			AND node_type IN (` + graphPlaceholders(len(nodeTypes)) + `)
		`

		for _, nodeType := range nodeTypes {
			args = append(
				args,
				nodeType,
			)
		}
	}

	sqlQuery += `

		ORDER BY
			CASE
				WHEN LOWER(ref_id) = LOWER(?) THEN 0
				WHEN LOWER(COALESCE(label, '')) = LOWER(?) THEN 1
				WHEN LOWER(ref_id) LIKE LOWER(?) THEN 2
				WHEN LOWER(COALESCE(label, '')) LIKE LOWER(?) THEN 3
				ELSE 4
			END,
			CASE node_type
				WHEN 'formula_code' THEN 0
				WHEN 'skill' THEN 1
				WHEN 'card' THEN 2
				WHEN 'equipment' THEN 3
				WHEN 'headwear' THEN 4
				WHEN 'buff' THEN 5
				WHEN 'formula_json' THEN 6
				WHEN 'buff_json' THEN 7
				ELSE 9
			END,
			LOWER(COALESCE(label, ref_id)) ASC

		LIMIT ?
	`

	args = append(
		args,
		query,
		query,
		prefix,
		prefix,
		limit,
	)

	rows, err :=
		db.Query(
			sqlQuery,
			args...,
		)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	nodes :=
		[]models.FormulaGraphNode{}

	for rows.Next() {
		var node models.FormulaGraphNode

		err := rows.Scan(
			&node.NodeKey,
			&node.NodeType,
			&node.RefID,
			&node.Label,
			&node.DetailURL,
			&node.Image,
			&node.MetaJSON,
		)

		if err != nil {
			return nil, err
		}

		nodes = append(
			nodes,
			node,
		)
	}

	return nodes, rows.Err()
}
