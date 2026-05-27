package repositories

import (
	"database/sql"

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
