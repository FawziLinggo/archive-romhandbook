package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetAncientEquips(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.AncientEquip,
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
			AND (
				name LIKE ?
				OR equip_type LIKE ?
				OR detail_url LIKE ?
			)
		`

		like :=
			"%" + query + "%"

		args = append(
			args,
			like,
			like,
			like,
		)
	}

	var total int

	err :=
		db.QueryRow(
			"SELECT COUNT(*) FROM ancient_equips "+where,
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
				equip_type,
				quality,
				description

			FROM ancient_equips
		`+where+`

			ORDER BY
				name COLLATE NOCASE ASC

			LIMIT ?
			OFFSET ?
		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	items :=
		[]models.AncientEquip{}

	for rows.Next() {
		var item models.AncientEquip

		err := rows.Scan(
			&item.ID,
			&item.DetailURL,
			&item.Image,
			&item.Name,
			&item.EquipType,
			&item.Quality,
			&item.Description,
		)

		if err != nil {
			return nil, 0, false, err
		}

		items = append(
			items,
			item,
		)
	}

	hasNext :=
		len(items) > limit

	if hasNext {
		items =
			items[:limit]
	}

	return items, total, hasNext, rows.Err()
}

func GetAncientEquipBySlug(
	db *sql.DB,
	value string,
) (
	*models.AncientEquipDetail,
	error,
) {
	var item models.AncientEquipDetail

	err := db.QueryRow(`
		SELECT
			id,
			detail_url,
			image,
			name,
			equip_type,
			quality,
			description,
			equip_effects,
			random_attributes,
			unlock_text,
			jobs,
			raw_tags,
			raw_html

		FROM ancient_equips

		WHERE id = ?
		OR detail_url = ?
		OR detail_url LIKE '%' || ? || '%'

		LIMIT 1
	`,
		value,
		"/things/"+value,
		value,
	).Scan(
		&item.ID,
		&item.DetailURL,
		&item.Image,
		&item.Name,
		&item.EquipType,
		&item.Quality,
		&item.Description,
		&item.EquipEffects,
		&item.RandomAttributes,
		&item.UnlockText,
		&item.JobsText,
		&item.RawTags,
		&item.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	formulas, err :=
		getThingFormulas(
			db,
			"ancient_equip_formulas",
			"ancient_equip_id",
			item.ID,
		)

	if err != nil {
		return nil, err
	}

	relations, err :=
		getThingRelations(
			db,
			"ancient_equip_relations",
			"ancient_equip_id",
			item.ID,
			true,
		)

	if err != nil {
		return nil, err
	}

	item.Formulas = formulas
	item.Relations = relations
	item.Materials = filterThingRelations(relations, "materials")
	item.Skills = filterThingRelations(relations, "skills")
	item.Jobs = filterThingRelations(relations, "jobs")
	item.Craftable = filterThingRelations(relations, "craftable")
	item.CraftMaterials = filterThingRelations(relations, "craft_materials")

	return &item, nil
}
