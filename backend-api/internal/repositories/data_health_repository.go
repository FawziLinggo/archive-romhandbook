package repositories

import (
	"database/sql"
	"fmt"

	"backend-api/internal/models"
)

type dataHealthTableConfig struct {
	Table string

	ThingType string

	IndexedInThings bool
}

var dataHealthTables = []dataHealthTableConfig{
	{Table: "cards", ThingType: "card", IndexedInThings: true},
	{Table: "equipments", ThingType: "equipment", IndexedInThings: true},
	{Table: "headwears", ThingType: "headwear", IndexedInThings: true},
	{Table: "monsters", ThingType: "monster", IndexedInThings: true},
	{Table: "mounts", ThingType: "mount", IndexedInThings: true},
	{Table: "pet_eggs", ThingType: "pet_egg", IndexedInThings: true},
	{Table: "crafting_materials", ThingType: "crafting_material", IndexedInThings: true},
	{Table: "furnitures", ThingType: "furniture", IndexedInThings: true},
	{Table: "cooking_ingredients", ThingType: "cooking_ingredient", IndexedInThings: true},
	{Table: "pet_headwear_unlock_items", ThingType: "pet_headwear_unlock_item", IndexedInThings: true},

	{Table: "pets", ThingType: "", IndexedInThings: false},
	{Table: "skills", ThingType: "", IndexedInThings: false},
	{Table: "buffs", ThingType: "", IndexedInThings: false},
	{Table: "jobs", ThingType: "", IndexedInThings: false},
	{Table: "formulas_code", ThingType: "", IndexedInThings: false},
}

func dataHealthTableExists(
	db *sql.DB,
	table string,
) bool {
	var name string

	err := db.QueryRow(
		`
			SELECT name
			FROM sqlite_master
			WHERE type IN ('table', 'view')
			AND name = ?
			LIMIT 1
		`,
		table,
	).Scan(&name)

	return err == nil
}

func dataHealthColumnExists(
	db *sql.DB,
	table string,
	column string,
) bool {
	rows, err := db.Query(
		fmt.Sprintf(
			"PRAGMA table_info(%s)",
			table,
		),
	)

	if err != nil {
		return false
	}

	defer rows.Close()

	for rows.Next() {
		var cid int
		var name string
		var columnType string
		var notNull int
		var defaultValue sql.NullString
		var pk int

		err := rows.Scan(
			&cid,
			&name,
			&columnType,
			&notNull,
			&defaultValue,
			&pk,
		)

		if err != nil {
			return false
		}

		if name == column {
			return true
		}
	}

	return false
}

func dataHealthCount(
	db *sql.DB,
	query string,
	args ...any,
) (
	int,
	error,
) {
	var total int

	err := db.QueryRow(
		query,
		args...,
	).Scan(&total)

	if err != nil {
		return 0, err
	}

	return total, nil
}

func dataHealthCountTable(
	db *sql.DB,
	table string,
) (
	int,
	error,
) {
	return dataHealthCount(
		db,
		fmt.Sprintf(
			"SELECT COUNT(*) FROM %s",
			table,
		),
	)
}

func dataHealthCountMissingTextColumn(
	db *sql.DB,
	table string,
	column string,
) (
	int,
	error,
) {
	if !dataHealthColumnExists(db, table, column) {
		return 0, nil
	}

	return dataHealthCount(
		db,
		fmt.Sprintf(
			`
				SELECT COUNT(*)
				FROM %s
				WHERE %s IS NULL
				OR TRIM(%s) = ''
			`,
			table,
			column,
			column,
		),
	)
}

func dataHealthCountMissingThings(
	db *sql.DB,
	table string,
	thingType string,
) (
	int,
	error,
) {
	if !dataHealthTableExists(db, "things") {
		return 0, nil
	}

	if !dataHealthColumnExists(db, table, "id") {
		return 0, nil
	}

	return dataHealthCount(
		db,
		fmt.Sprintf(
			`
				SELECT COUNT(*)
				FROM %s source
				LEFT JOIN things t
					ON t.id = source.id
					AND t.type = ?
				WHERE source.id IS NOT NULL
				AND source.id != ''
				AND t.id IS NULL
			`,
			table,
		),
		thingType,
	)
}

func dataHealthCountThingConflicts(
	db *sql.DB,
	table string,
	thingType string,
) (
	int,
	error,
) {
	if !dataHealthTableExists(db, "things") {
		return 0, nil
	}

	if !dataHealthColumnExists(db, table, "id") {
		return 0, nil
	}

	return dataHealthCount(
		db,
		fmt.Sprintf(
			`
				SELECT COUNT(*)
				FROM %s source
				JOIN things t
					ON t.id = source.id
				WHERE source.id IS NOT NULL
				AND source.id != ''
				AND t.type != ?
			`,
			table,
		),
		thingType,
	)
}

func dataHealthGetThingTypeCounts(
	db *sql.DB,
) (
	[]models.DataHealthNameCount,
	error,
) {
	if !dataHealthTableExists(db, "things") {
		return []models.DataHealthNameCount{}, nil
	}

	rows, err := db.Query(`
		SELECT
			type,
			COUNT(*) AS total
		FROM things
		GROUP BY type
		ORDER BY total DESC, type ASC
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	results := []models.DataHealthNameCount{}

	for rows.Next() {
		var item models.DataHealthNameCount

		err := rows.Scan(
			&item.Name,
			&item.Total,
		)

		if err != nil {
			return nil, err
		}

		results = append(results, item)
	}

	return results, rows.Err()
}

func dataHealthGetThingConflicts(
	db *sql.DB,
) (
	[]models.DataHealthThingConflict,
	error,
) {
	results := []models.DataHealthThingConflict{}

	if !dataHealthTableExists(db, "things") {
		return results, nil
	}

	for _, config := range dataHealthTables {
		if !config.IndexedInThings {
			continue
		}

		if !dataHealthTableExists(db, config.Table) {
			continue
		}

		if !dataHealthColumnExists(db, config.Table, "id") {
			continue
		}

		rows, err := db.Query(
			fmt.Sprintf(
				`
					SELECT
						t.type,
						COUNT(*) AS total
					FROM %s source
					JOIN things t
						ON t.id = source.id
					WHERE source.id IS NOT NULL
					AND source.id != ''
					AND t.type != ?
					GROUP BY t.type
					ORDER BY total DESC, t.type ASC
				`,
				config.Table,
			),
			config.ThingType,
		)

		if err != nil {
			return nil, err
		}

		for rows.Next() {
			var item models.DataHealthThingConflict

			item.SourceTable = config.Table
			item.ExpectedType = config.ThingType

			err := rows.Scan(
				&item.ExistingType,
				&item.Total,
			)

			if err != nil {
				rows.Close()
				return nil, err
			}

			results = append(results, item)
		}

		err = rows.Close()

		if err != nil {
			return nil, err
		}
	}

	return results, nil
}

func dataHealthGetUnknownLinkTypes(
	db *sql.DB,
) (
	[]models.DataHealthUnknownLinkType,
	int,
	error,
) {
	if !dataHealthTableExists(db, "crawl_unknown_links") {
		return []models.DataHealthUnknownLinkType{}, 0, nil
	}

	total, err := dataHealthCountTable(
		db,
		"crawl_unknown_links",
	)

	if err != nil {
		return nil, 0, err
	}

	rows, err := db.Query(`
		SELECT
			COALESCE(detected_types, ''),
			COUNT(*) AS total,
			COALESCE(MIN(path), '') AS sample_path
		FROM crawl_unknown_links
		GROUP BY COALESCE(detected_types, '')
		ORDER BY total DESC, detected_types ASC
		LIMIT 30
	`)

	if err != nil {
		return nil, 0, err
	}

	defer rows.Close()

	results := []models.DataHealthUnknownLinkType{}

	for rows.Next() {
		var item models.DataHealthUnknownLinkType

		err := rows.Scan(
			&item.DetectedTypes,
			&item.Total,
			&item.SamplePath,
		)

		if err != nil {
			return nil, 0, err
		}

		results = append(results, item)
	}

	return results, total, rows.Err()
}

func dataHealthGetSearchIndex(
	db *sql.DB,
) (
	models.DataHealthSearchIndex,
	error,
) {
	result := models.DataHealthSearchIndex{
		ByType: []models.DataHealthNameCount{},
	}

	if !dataHealthTableExists(db, "archive_search_fts") {
		return result, nil
	}

	total, err := dataHealthCountTable(
		db,
		"archive_search_fts",
	)

	if err != nil {
		return result, err
	}

	result.Total = total

	rows, err := db.Query(`
		SELECT
			type,
			COUNT(*) AS total
		FROM archive_search_fts
		GROUP BY type
		ORDER BY total DESC, type ASC
	`)

	if err != nil {
		return result, err
	}

	defer rows.Close()

	for rows.Next() {
		var item models.DataHealthNameCount

		err := rows.Scan(
			&item.Name,
			&item.Total,
		)

		if err != nil {
			return result, err
		}

		result.ByType = append(
			result.ByType,
			item,
		)
	}

	return result, rows.Err()
}

func dataHealthGetFormulaGraph(
	db *sql.DB,
) (
	models.DataHealthFormulaGraph,
	error,
) {
	result := models.DataHealthFormulaGraph{
		NodesByType: []models.DataHealthNameCount{},
	}

	if dataHealthTableExists(db, "formula_graph_nodes") {
		nodes, err := dataHealthCountTable(
			db,
			"formula_graph_nodes",
		)

		if err != nil {
			return result, err
		}

		result.Nodes = nodes

		rows, err := db.Query(`
			SELECT
				node_type,
				COUNT(*) AS total
			FROM formula_graph_nodes
			GROUP BY node_type
			ORDER BY total DESC, node_type ASC
		`)

		if err != nil {
			return result, err
		}

		for rows.Next() {
			var item models.DataHealthNameCount

			err := rows.Scan(
				&item.Name,
				&item.Total,
			)

			if err != nil {
				rows.Close()
				return result, err
			}

			result.NodesByType = append(
				result.NodesByType,
				item,
			)
		}

		err = rows.Close()

		if err != nil {
			return result, err
		}
	}

	if dataHealthTableExists(db, "formula_graph_edges") {
		edges, err := dataHealthCountTable(
			db,
			"formula_graph_edges",
		)

		if err != nil {
			return result, err
		}

		result.Edges = edges
	}

	return result, nil
}

func GetDataHealthDashboard(
	db *sql.DB,
) (
	*models.DataHealthDashboard,
	error,
) {
	tables := []models.DataHealthTableMetric{}

	summary := models.DataHealthSummary{}

	for _, config := range dataHealthTables {
		if !dataHealthTableExists(db, config.Table) {
			continue
		}

		total, err := dataHealthCountTable(
			db,
			config.Table,
		)

		if err != nil {
			return nil, err
		}

		rawHTMLMissing, err := dataHealthCountMissingTextColumn(
			db,
			config.Table,
			"raw_html",
		)

		if err != nil {
			return nil, err
		}

		detailURLMissing, err := dataHealthCountMissingTextColumn(
			db,
			config.Table,
			"detail_url",
		)

		if err != nil {
			return nil, err
		}

		imageMissing, err := dataHealthCountMissingTextColumn(
			db,
			config.Table,
			"image",
		)

		if err != nil {
			return nil, err
		}

		missingThings := 0
		thingConflicts := 0

		if config.IndexedInThings {
			missingThings, err = dataHealthCountMissingThings(
				db,
				config.Table,
				config.ThingType,
			)

			if err != nil {
				return nil, err
			}

			thingConflicts, err = dataHealthCountThingConflicts(
				db,
				config.Table,
				config.ThingType,
			)

			if err != nil {
				return nil, err
			}
		}

		tables = append(
			tables,
			models.DataHealthTableMetric{
				Table:            config.Table,
				ThingType:        config.ThingType,
				Total:            total,
				RawHTMLMissing:   rawHTMLMissing,
				DetailURLMissing: detailURLMissing,
				ImageMissing:     imageMissing,
				MissingThings:    missingThings,
				ThingConflicts:   thingConflicts,
				IndexedInThings:  config.IndexedInThings,
			},
		)

		summary.TotalRows += total
		summary.RawHTMLMissing += rawHTMLMissing
		summary.MissingThings += missingThings
		summary.ThingConflicts += thingConflicts
	}

	thingsTotal := 0

	if dataHealthTableExists(db, "things") {
		total, err := dataHealthCountTable(
			db,
			"things",
		)

		if err != nil {
			return nil, err
		}

		thingsTotal = total
	}

	summary.ThingsTotal = thingsTotal

	thingTypeCounts, err := dataHealthGetThingTypeCounts(db)

	if err != nil {
		return nil, err
	}

	thingConflicts, err := dataHealthGetThingConflicts(db)

	if err != nil {
		return nil, err
	}

	unknownLinkTypes, unknownLinksTotal, err :=
		dataHealthGetUnknownLinkTypes(db)

	if err != nil {
		return nil, err
	}

	summary.UnknownLinks = unknownLinksTotal

	searchIndex, err := dataHealthGetSearchIndex(db)

	if err != nil {
		return nil, err
	}

	summary.SearchRows = searchIndex.Total

	formulaGraph, err := dataHealthGetFormulaGraph(db)

	if err != nil {
		return nil, err
	}

	summary.GraphNodes = formulaGraph.Nodes
	summary.GraphEdges = formulaGraph.Edges

	return &models.DataHealthDashboard{
		Summary:          summary,
		Tables:           tables,
		ThingTypeCounts:  thingTypeCounts,
		ThingConflicts:   thingConflicts,
		UnknownLinkTypes: unknownLinkTypes,
		SearchIndex:      searchIndex,
		FormulaGraph:     formulaGraph,
	}, nil
}
