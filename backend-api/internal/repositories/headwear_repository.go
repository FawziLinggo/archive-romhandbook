package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func headwearStatKeywords(
	value string,
) []string {
	switch value {
	case "Matk":
		return []string{
			"Matk",
			"M.Atk",
			"M ATK",
			"M. ATK",
		}

	case "Atk%/Matk%":
		return []string{
			"Atk%",
			"Atk %",
			"M.Atk%",
			"M.Atk %",
			"Matk%",
			"Matk %",
			"M. ATK%",
			"M. ATK %",
		}

	case "Ignore MDef":
		return []string{
			"Ignore MDef",
			"Ignore M. Def",
			"Ignore M DEF",
			"Ignore M. DEF",
		}

	default:
		return []string{
			value,
		}
	}
}

func appendLikeAny(
	where *string,
	args *[]any,
	column string,
	value string,
) {
	if value == "" {
		return
	}

	keywords :=
		headwearStatKeywords(value)

	*where += `
		AND (
	`

	for index, keyword := range keywords {
		if index > 0 {
			*where += `
			OR
			`
		}

		*where += `
			LOWER(COALESCE(` + column + `, ''))
			LIKE LOWER(?)
		`

		*args = append(
			*args,
			"%"+keyword+"%",
		)
	}

	*where += `
		)
	`
}

func headwearOrderBy(
	sort string,
) string {
	switch sort {
	case "Name desc":
		return `
			CASE
				WHEN name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,
			name COLLATE NOCASE DESC
		`

	default:
		return `
			CASE
				WHEN name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,
			name COLLATE NOCASE ASC
		`
	}
}

func GetHeadwears(
	db *sql.DB,
	page int,
	limit int,
	query string,
	position string,
	stat string,
	unlock string,
	depo string,
	sort string,
) (
	[]models.Headwear,
	int,
	bool,
	error,
) {
	offset :=
		(page - 1) * limit

	where :=
		"WHERE name IS NOT NULL AND name != ''"

	args :=
		[]any{}

	if query != "" {
		where += `
			AND LOWER(name)
			LIKE LOWER(?)
		`

		args = append(
			args,
			"%"+query+"%",
		)
	}

	if position != "" {
		where += `
			AND LOWER(type)
			= LOWER(?)
		`

		args = append(
			args,
			position,
		)
	}

	appendLikeAny(
		&where,
		&args,
		"effect_text",
		stat,
	)

	appendLikeAny(
		&where,
		&args,
		"unlock_text",
		unlock,
	)

	appendLikeAny(
		&where,
		&args,
		"deposit_stats",
		depo,
	)

	var total int

	totalSQL :=
		"SELECT COUNT(*) FROM headwears " + where

	err :=
		db.QueryRow(
			totalSQL,
			args...,
		).Scan(&total)

	if err != nil {
		return nil, 0, false, err
	}

	rowsArgs :=
		append([]any{}, args...)

	rowsArgs = append(
		rowsArgs,
		limit+1,
		offset,
	)

	rows, err :=
		db.Query(`

			SELECT
				id,
				detail_url,
				image,
				name,
				type,
				description,
				quality,
				effect_text,
				unlock_text,
				deposit_stats,
				unlock_stats,
				jobs,
				availability_date

			FROM headwears
		`+where+`

			ORDER BY
				`+headwearOrderBy(sort)+`

			LIMIT ?
			OFFSET ?

		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	headwears :=
		[]models.Headwear{}

	for rows.Next() {
		var headwear models.Headwear

		err := rows.Scan(
			&headwear.ID,
			&headwear.DetailURL,
			&headwear.Image,
			&headwear.Name,
			&headwear.Type,
			&headwear.Description,
			&headwear.Quality,
			&headwear.EffectText,
			&headwear.UnlockText,
			&headwear.DepositStats,
			&headwear.UnlockStats,
			&headwear.Jobs,
			&headwear.AvailabilityDate,
		)

		if err != nil {
			return nil, 0, false, err
		}

		headwears = append(
			headwears,
			headwear,
		)
	}

	hasNext :=
		len(headwears) > limit

	if hasNext {
		headwears =
			headwears[:limit]
	}

	return headwears, total, hasNext, nil
}

func SearchHeadwears(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Headwear,
	int,
	bool,
	error,
) {
	if len(query) < 4 {
		return []models.Headwear{}, 0, false, nil
	}

	return GetHeadwears(
		db,
		page,
		limit,
		query,
		"",
		"",
		"",
		"",
		"Name asc",
	)
}

func GetHeadwearByID(
	db *sql.DB,
	id string,
) (
	*models.HeadwearDetail,
	error,
) {
	var headwear models.HeadwearDetail

	err :=
		db.QueryRow(`

			SELECT
				id,
				detail_url,
				image,
				name,
				type,
				description,
				quality,
				effect_text,
				unlock_text,
				deposit_stats,
				unlock_stats,
				jobs,
				formula_id,
				availability_date,
				raw_html

			FROM headwears

			WHERE id = ?

			LIMIT 1

		`, id).Scan(
			&headwear.ID,
			&headwear.DetailURL,
			&headwear.Image,
			&headwear.Name,
			&headwear.Type,
			&headwear.Description,
			&headwear.Quality,
			&headwear.EffectText,
			&headwear.UnlockText,
			&headwear.DepositStats,
			&headwear.UnlockStats,
			&headwear.Jobs,
			&headwear.FormulaID,
			&headwear.AvailabilityDate,
			&headwear.RawHTML,
		)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	formulas, err :=
		GetHeadwearFormulas(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	headwear.Formulas =
		formulas

	return &headwear, nil
}

func GetHeadwearFormulas(
	db *sql.DB,
	headwearID string,
) (
	[]models.HeadwearFormula,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				headwear_id,
				formula_index,
				formula_json

			FROM headwear_formulas

			WHERE headwear_id = ?

			ORDER BY
				formula_index ASC

		`, headwearID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	formulas :=
		[]models.HeadwearFormula{}

	for rows.Next() {
		var formula models.HeadwearFormula

		err := rows.Scan(
			&formula.ID,
			&formula.HeadwearID,
			&formula.FormulaIndex,
			&formula.FormulaJSON,
		)

		if err != nil {
			return nil, err
		}

		formulas = append(
			formulas,
			formula,
		)
	}

	return formulas, nil
}
