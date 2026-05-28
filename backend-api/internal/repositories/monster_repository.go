package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func monsterOrderBy(
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

	case "Level asc":
		return "level ASC"

	case "Level desc":
		return "level DESC"

	case "Hp asc":
		return "CAST(hp AS INTEGER) ASC"

	case "Hp desc":
		return "CAST(hp AS INTEGER) DESC"

	case "BaseExp asc":
		return "CAST(base_exp AS INTEGER) ASC"

	case "BaseExp desc":
		return "CAST(base_exp AS INTEGER) DESC"

	case "JobExp asc":
		return "CAST(job_exp AS INTEGER) ASC"

	case "JobExp desc":
		return "CAST(job_exp AS INTEGER) DESC"

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

func GetMonsters(
	db *sql.DB,
	page int,
	limit int,
	query string,
	size string,
	element string,
	race string,
	sort string,
) (
	[]models.Monster,
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
			AND name LIKE ?
		`

		args = append(
			args,
			"%"+query+"%",
		)
	}

	if size != "" {
		where += `
			AND size = ?
		`

		args = append(
			args,
			size,
		)
	}

	if element != "" {
		where += `
			AND element = ?
		`

		args = append(
			args,
			element,
		)
	}

	if race != "" {
		where += `
			AND race = ?
		`

		args = append(
			args,
			race,
		)
	}

	var total int

	totalSQL :=
		"SELECT COUNT(*) FROM monsters " + where

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
				race,
				element,
				size,
				location,
				level,
				hp,
				base_exp,
				job_exp

			FROM monsters
		`+where+`

			ORDER BY
				`+monsterOrderBy(sort)+`

			LIMIT ?
			OFFSET ?

		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	monsters :=
		[]models.Monster{}

	for rows.Next() {
		var monster models.Monster

		err := rows.Scan(
			&monster.ID,
			&monster.DetailURL,
			&monster.Image,
			&monster.Name,
			&monster.Race,
			&monster.Element,
			&monster.Size,
			&monster.Location,
			&monster.Level,
			&monster.HP,
			&monster.BaseEXP,
			&monster.JobEXP,
		)

		if err != nil {
			return nil, 0, false, err
		}

		monsters = append(
			monsters,
			monster,
		)
	}

	hasNext :=
		len(monsters) > limit

	if hasNext {
		monsters = monsters[:limit]
	}

	return monsters, total, hasNext, nil
}

func SearchMonsters(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Monster,
	int,
	bool,
	error,
) {
	if len(query) < 4 {
		return []models.Monster{}, 0, false, nil
	}

	return GetMonsters(
		db,
		page,
		limit,
		query,
		"",
		"",
		"",
		"Name asc",
	)
}

func GetMonsterBySlug(
	db *sql.DB,
	detailURL string,
) (
	*models.MonsterDetail,
	error,
) {
	var monster models.MonsterDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			race,
			element,
			size,
			location,
			level,
			hp,
			base_exp,
			job_exp,
			str,
			agi,
			vit,
			int_stat,
			dex,
			luk,
			atk,
			matk,
			def,
			mdef,
			hit,
			flee,
			move_speed,
			aspd,
			raw_json,
			raw_html

		FROM monsters

		WHERE detail_url like  '%' || ? || '%'

		LIMIT 1

	`, detailURL).Scan(
		&monster.ID,
		&monster.DetailURL,
		&monster.Image,
		&monster.Name,
		&monster.Race,
		&monster.Element,
		&monster.Size,
		&monster.Location,
		&monster.Level,
		&monster.HP,
		&monster.BaseEXP,
		&monster.JobEXP,
		&monster.STR,
		&monster.AGI,
		&monster.VIT,
		&monster.INTStat,
		&monster.DEX,
		&monster.LUK,
		&monster.ATK,
		&monster.MATK,
		&monster.DEF,
		&monster.MDEF,
		&monster.HIT,
		&monster.FLEE,
		&monster.MoveSpeed,
		&monster.ASPD,
		&monster.RawJSON,
		&monster.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &monster, nil
}
