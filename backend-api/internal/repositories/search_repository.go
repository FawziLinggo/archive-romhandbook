package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

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
		"%" + query + "%"

	rows, err := db.Query(`

	WITH search_results AS (

		SELECT
			'Card' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			effect_text AS description,
			1 AS sort_order
		FROM cards
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Monster' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			location AS description,
			2 AS sort_order
		FROM monsters
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Skill' AS type,
			name AS label,
			CASE
				WHEN detail_url LIKE '/skills/%'
				THEN detail_url
				ELSE '/skills/' || detail_url
			END AS href,
			image AS image,
			description AS description,
			3 AS sort_order
		FROM skills
		WHERE
			LOWER(name) LIKE LOWER(?)
			OR LOWER(description) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Equipment' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			description AS description,
			4 AS sort_order
		FROM equipments
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Headwear' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			description AS description,
			5 AS sort_order
		FROM headwears
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Mount' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			description AS description,
			6 AS sort_order
		FROM mounts
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Pet' AS type,
			name AS label,
			CASE
				WHEN detail_url LIKE '/pets/%'
				THEN detail_url
				ELSE '/pets/' || detail_url
			END AS href,
			image AS image,
			description AS description,
			7 AS sort_order
		FROM pets
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Buff' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			description AS description,
			8 AS sort_order
		FROM buffs
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Formula' AS type,
			name AS label,
			detail_url AS href,
			NULL AS image,
			formula_code AS description,
			9 AS sort_order
		FROM formulas_code
		WHERE LOWER(name) LIKE LOWER(?)

		UNION ALL

		SELECT
			'Job' AS type,
			name AS label,
			detail_url AS href,
			image AS image,
			NULL AS description,
			10 AS sort_order
		FROM jobs
		WHERE LOWER(name) LIKE LOWER(?)

	),

	deduped AS (

		SELECT
			type,
			label,
			href,
			image,
			description,
			sort_order,
			ROW_NUMBER() OVER (
				PARTITION BY type, LOWER(label)
				ORDER BY
					sort_order ASC,
					LENGTH(href) ASC
			) AS rn

		FROM search_results

	)

	SELECT
		type,
		label,
		href,
		image,
		description

	FROM deduped

	WHERE rn = 1

	ORDER BY
		sort_order ASC,
		LOWER(label) ASC

	LIMIT ?

`,
		search,
		search,
		search,
		search,
		search,
		search,
		search,
		search,
		search,
		search,
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
