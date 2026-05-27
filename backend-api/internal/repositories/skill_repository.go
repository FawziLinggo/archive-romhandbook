package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetSkills(

	db *sql.DB,

	page int,
	limit int,

	query string,

) ([]models.Skill, int, error) {

	offset := (page - 1) * limit

	search := "%" + query + "%"

	// =====================
	// TOTAL
	// =====================

	var total int

	totalQuery := `
		SELECT COUNT(DISTINCT detail_url)

		FROM skills

		WHERE
			name LIKE ?
			OR
			description LIKE ?
	`

	err := db.QueryRow(

		totalQuery,

		search,
		search,
	).Scan(&total)

	if err != nil {

		return nil, 0, err
	}

	// =====================
	// MAIN QUERY
	// =====================

	querySQL := `
		SELECT

			s.id,
			s.detail_url,
			s.image,
			s.name,

			MAX(s.max_level) as max_level,

			s.skill_type,
			s.damage_type,

			s.cooldown,
			s.range_value,
			s.cast_time,

			s.description

		FROM skills s

		WHERE
			s.name LIKE ?
			OR
			s.description LIKE ?

		GROUP BY s.detail_url

		ORDER BY

			CASE
				WHEN s.name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,

			s.name COLLATE NOCASE ASC

		LIMIT ?
		OFFSET ?
	`

	rows, err := db.Query(

		querySQL,

		search,
		search,

		limit,
		offset,
	)

	if err != nil {

		return nil, 0, err
	}

	defer rows.Close()

	// =====================
	// PARSE ROWS
	// =====================

	skills := []models.Skill{}

	for rows.Next() {

		var skill models.Skill

		err := rows.Scan(

			&skill.ID,
			&skill.DetailURL,
			&skill.Image,
			&skill.Name,

			&skill.MaxLevel,

			&skill.SkillType,
			&skill.DamageType,

			&skill.Cooldown,
			&skill.RangeValue,
			&skill.CastTime,

			&skill.Description,
		)

		if err != nil {

			return nil, 0, err
		}

		skills = append(
			skills,
			skill,
		)
	}

	return skills, total, nil
}

func SearchSkills(

	db *sql.DB,
	query string,

) ([]models.Skill, error) {

	search := "%" + query + "%"

	querySQL := `

		SELECT

			s.id,
			s.detail_url,
			s.image,
			s.name,

			MAX(s.max_level) as max_level,

			s.skill_type,
			s.damage_type,

			s.cooldown,
			s.range_value,
			s.cast_time,

			s.description

		FROM skills s

		WHERE

			LOWER(s.name)
			LIKE LOWER(?)

			OR

			LOWER(s.description)
			LIKE LOWER(?)

		GROUP BY s.detail_url

		ORDER BY

			CASE
				WHEN s.name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,

			s.name COLLATE NOCASE ASC

		LIMIT 10
	`

	rows, err := db.Query(

		querySQL,

		search,
		search,
	)

	if err != nil {

		return nil, err
	}

	defer rows.Close()

	skills := []models.Skill{}

	for rows.Next() {

		var skill models.Skill

		err := rows.Scan(

			&skill.ID,
			&skill.DetailURL,
			&skill.Image,
			&skill.Name,

			&skill.MaxLevel,

			&skill.SkillType,
			&skill.DamageType,

			&skill.Cooldown,
			&skill.RangeValue,
			&skill.CastTime,

			&skill.Description,
		)

		if err != nil {

			return nil, err
		}

		skills = append(
			skills,
			skill,
		)
	}

	return skills, nil
}

func GetSkillBySlug(

	db *sql.DB,

	slug string,

) (

	*models.SkillDetail,
	error,

) {

	query := `

		SELECT

			id,
			detail_url,
			image,
			name,
			max_level,

			skill_type,
			damage_type,

			cooldown,
			range_value,
			cast_time,
			fixed_cast_time,

			description,

			formula_raw,
			aesir_raw,
			raw_html

		FROM skills

		WHERE detail_url = ?

		LIMIT 1
	`

	var skill models.SkillDetail

	err := db.QueryRow(

		query,

		slug,
	).Scan(

		&skill.ID,
		&skill.DetailURL,
		&skill.Image,
		&skill.Name,
		&skill.MaxLevel,

		&skill.SkillType,
		&skill.DamageType,

		&skill.Cooldown,
		&skill.RangeValue,
		&skill.CastTime,
		&skill.FixedCastTime,

		&skill.Description,

		&skill.FormulaRaw,
		&skill.AesirRaw,
		&skill.RawHTML,
	)

	if err != nil {

		if err == sql.ErrNoRows {

			return nil, nil
		}

		return nil, err
	}

	// =====================
	// LEVELS
	// =====================

	levelQuery := `

		SELECT

			level,
			description,
			raw_tags

		FROM skill_levels

		WHERE skill_id = ?

		ORDER BY level DESC
	`

	rows, err := db.Query(

		levelQuery,

		skill.ID,
	)

	if err != nil {

		return nil, err
	}

	defer rows.Close()

	levels := []models.SkillLevel{}

	for rows.Next() {

		var level models.SkillLevel

		err := rows.Scan(

			&level.Level,
			&level.Description,
			&level.RawTags,
		)

		if err != nil {

			return nil, err
		}

		levels = append(
			levels,
			level,
		)
	}

	skill.Levels = levels

	return &skill, nil
}
