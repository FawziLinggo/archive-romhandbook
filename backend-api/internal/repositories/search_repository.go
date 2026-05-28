package repositories

import (
	"backend-api/internal/models"
	"database/sql"
	"strings"
)

func buildFTSQuery(
	query string,
) string {
	parts :=
		strings.Fields(query)

	cleaned :=
		[]string{}

	for _, part := range parts {
		part = strings.Trim(
			part,
			`"'()[]{}:,.;+-*/\|&!~^`,
		)

		if part == "" {
			continue
		}

		cleaned = append(
			cleaned,
			part+"*",
		)
	}

	return strings.Join(
		cleaned,
		" ",
	)
}

func GlobalSearch(
	db *sql.DB,
	query string,
	limit int,
) (
	[]models.SearchResult,
	error,
) {
	if len(query) < 2 {
		return []models.SearchResult{}, nil
	}

	if limit <= 0 || limit > 50 {
		limit = 30
	}

	search :=
		buildFTSQuery(query)

	if search == "" {
		return []models.SearchResult{}, nil
	}

	rows, err := db.Query(`

		SELECT
			type,
			label,
			href,
			image,
			snippet(
				archive_search_fts,
				4,
				'',
				'',
				'...',
				18
			) AS description

		FROM archive_search_fts

		WHERE archive_search_fts MATCH ?

		ORDER BY
			bm25(archive_search_fts)

		LIMIT ?

	`,
		search,
		limit,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	results :=
		[]models.SearchResult{}

	for rows.Next() {
		var result models.SearchResult

		err := rows.Scan(
			&result.Type,
			&result.Label,
			&result.Href,
			&result.Image,
			&result.Description,
		)

		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	return results, nil
}
