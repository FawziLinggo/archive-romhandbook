package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetBuffs(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.Buff,
	int,
	bool,
	error,
) {
	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	var total int

	err := db.QueryRow(`

		SELECT
			COUNT(*)

		FROM buffs

		WHERE
			name LIKE ?
			AND name IS NOT NULL
			AND name != ''

	`, search).Scan(&total)

	if err != nil {
		return nil, 0, false, err
	}

	rows, err := db.Query(`

		SELECT
			id,
			name,
			detail_url,
			image,
			description,
			raw_json

		FROM buffs

		WHERE
			name LIKE ?
			AND name IS NOT NULL
			AND name != ''

		ORDER BY
			CASE
				WHEN name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,

			LOWER(name) ASC

		LIMIT ?
		OFFSET ?

	`, search, limit+1, offset)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	buffs :=
		[]models.Buff{}

	for rows.Next() {
		var buff models.Buff

		err := rows.Scan(
			&buff.ID,
			&buff.Name,
			&buff.DetailURL,
			&buff.Image,
			&buff.Description,
			&buff.RawJSON,
		)

		if err != nil {
			return nil, 0, false, err
		}

		buffs = append(buffs, buff)
	}

	hasNext :=
		len(buffs) > limit

	if hasNext {
		buffs = buffs[:limit]
	}

	return buffs, total, hasNext, nil
}

func SearchBuffs(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Buff,
	int,
	bool,
	error,
) {
	if len(query) < 3 {
		return []models.Buff{}, 0, false, nil
	}

	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	var total int

	err := db.QueryRow(`

		SELECT
			COUNT(*)

		FROM buffs

		WHERE
			name LIKE ?
			AND name IS NOT NULL
			AND name != ''

	`, search).Scan(&total)

	if err != nil {
		return nil, 0, false, err
	}

	rows, err := db.Query(`

		SELECT
			id,
			name,
			detail_url,
			image,
			description,
			raw_json

		FROM buffs

		WHERE
			name LIKE ?
			AND name IS NOT NULL
			AND name != ''

		ORDER BY
			CASE
				WHEN name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,

			LOWER(name) ASC

		LIMIT ?
		OFFSET ?

	`, search, limit+1, offset)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	buffs :=
		[]models.Buff{}

	for rows.Next() {
		var buff models.Buff

		err := rows.Scan(
			&buff.ID,
			&buff.Name,
			&buff.DetailURL,
			&buff.Image,
			&buff.Description,
			&buff.RawJSON,
		)

		if err != nil {
			return nil, 0, false, err
		}

		buffs = append(buffs, buff)
	}

	hasNext :=
		len(buffs) > limit

	if hasNext {
		buffs = buffs[:limit]
	}

	return buffs, total, hasNext, nil
}

func GetBuffBySlug(
	db *sql.DB,
	slug string,
) (
	*models.BuffDetail,
	error,
) {
	var buff models.BuffDetail

	detailURL :=
		"/buffs/" + slug

	err := db.QueryRow(`

		SELECT
			id,
			name,
			detail_url,
			image,
			description,
			raw_json,
			raw_html

		FROM buffs

		WHERE detail_url = ?

		LIMIT 1

	`, detailURL).Scan(
		&buff.ID,
		&buff.Name,
		&buff.DetailURL,
		&buff.Image,
		&buff.Description,
		&buff.RawJSON,
		&buff.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &buff, nil
}
