package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func equipmentOrderBy(
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

func equipmentStatKeywords(
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

	default:
		return []string{
			value,
		}
	}
}

func appendEquipmentLikeAny(
	where *string,
	args *[]any,
	column string,
	value string,
) {
	if value == "" {
		return
	}

	keywords :=
		equipmentStatKeywords(value)

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

func GetEquipments(
	db *sql.DB,
	page int,
	limit int,
	query string,
	equipmentType string,
	quality string,
	stat string,
	unlock string,
	depo string,
	sort string,
) (
	[]models.Equipment,
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

	if equipmentType != "" {
		where += `
			AND LOWER(type)
			= LOWER(?)
		`

		args = append(
			args,
			equipmentType,
		)
	}

	if quality != "" {
		where += `
			AND LOWER(quality)
			= LOWER(?)
		`

		args = append(
			args,
			quality,
		)
	}

	appendEquipmentLikeAny(
		&where,
		&args,
		"effect_text",
		stat,
	)

	appendEquipmentLikeAny(
		&where,
		&args,
		"unlock_text",
		unlock,
	)

	appendEquipmentLikeAny(
		&where,
		&args,
		"deposit_stats",
		depo,
	)

	var total int

	totalSQL :=
		"SELECT COUNT(*) FROM equipments " + where

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
				jobs

			FROM equipments
		`+where+`

			ORDER BY
				`+equipmentOrderBy(sort)+`

			LIMIT ?
			OFFSET ?

		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	equipments :=
		[]models.Equipment{}

	for rows.Next() {
		var equipment models.Equipment

		err := rows.Scan(
			&equipment.ID,
			&equipment.DetailURL,
			&equipment.Image,
			&equipment.Name,
			&equipment.Type,
			&equipment.Description,
			&equipment.Quality,
			&equipment.EffectText,
			&equipment.UnlockText,
			&equipment.DepositStats,
			&equipment.UnlockStats,
			&equipment.Jobs,
		)

		if err != nil {
			return nil, 0, false, err
		}

		equipments = append(
			equipments,
			equipment,
		)
	}

	hasNext :=
		len(equipments) > limit

	if hasNext {
		equipments =
			equipments[:limit]
	}

	return equipments, total, hasNext, nil
}

func SearchEquipments(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Equipment,
	int,
	bool,
	error,
) {
	if len(query) < 4 {
		return []models.Equipment{}, 0, false, nil
	}

	return GetEquipments(
		db,
		page,
		limit,
		query,
		"",
		"",
		"",
		"",
		"",
		"Name asc",
	)
}

func GetEquipmentByID(
	db *sql.DB,
	id string,
) (
	*models.EquipmentDetail,
	error,
) {
	var equipment models.EquipmentDetail

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
				raw_html

			FROM equipments

			WHERE id = ?

			LIMIT 1

		`, id).Scan(
			&equipment.ID,
			&equipment.DetailURL,
			&equipment.Image,
			&equipment.Name,
			&equipment.Type,
			&equipment.Description,
			&equipment.Quality,
			&equipment.EffectText,
			&equipment.UnlockText,
			&equipment.DepositStats,
			&equipment.UnlockStats,
			&equipment.Jobs,
			&equipment.FormulaID,
			&equipment.RawHTML,
		)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	formulas, err :=
		GetEquipmentFormulas(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	tiers, err :=
		GetEquipmentTiers(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	synthFrom, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"synth_from",
		)

	if err != nil {
		return nil, err
	}

	synthTo, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"synth_to",
		)

	if err != nil {
		return nil, err
	}

	craftMaterials, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"craft_material",
		)

	if err != nil {
		return nil, err
	}

	craftable, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"craftable",
		)

	if err != nil {
		return nil, err
	}

	droppedBy, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"dropped_by",
		)

	if err != nil {
		return nil, err
	}

	skills, err :=
		GetEquipmentRelationsByType(
			db,
			id,
			"skill",
		)

	if err != nil {
		return nil, err
	}

	equipEffects, err :=
		GetEquipmentEquipEffects(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	equipment.Formulas =
		formulas

	equipment.Tiers =
		tiers

	equipment.SynthFrom =
		synthFrom

	equipment.SynthTo =
		synthTo

	equipment.CraftMaterials =
		craftMaterials

	equipment.Craftable =
		craftable

	equipment.DroppedBy =
		droppedBy

	equipment.Skills =
		skills

	equipment.EquipEffects =
		equipEffects

	return &equipment, nil
}

func GetEquipmentFormulas(
	db *sql.DB,
	equipmentID string,
) (
	[]models.EquipmentFormula,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				equipment_id,
				formula_id,
				formula_index,
				formula_json

			FROM equipment_formulas

			WHERE equipment_id = ?

			ORDER BY
				formula_index ASC

		`, equipmentID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	formulas :=
		[]models.EquipmentFormula{}

	for rows.Next() {
		var formula models.EquipmentFormula

		err := rows.Scan(
			&formula.ID,
			&formula.EquipmentID,
			&formula.FormulaID,
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

func GetEquipmentRelationsByType(
	db *sql.DB,
	equipmentID string,
	relationType string,
) (
	[]models.EquipmentRelation,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				equipment_id,
				relation_type,
				related_id,
				related_name,
				related_image,
				related_url,
				relation_index

			FROM equipment_relations

			WHERE equipment_id = ?
			AND relation_type = ?

			ORDER BY
				relation_index ASC,
				id ASC

		`, equipmentID, relationType)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	relations :=
		[]models.EquipmentRelation{}

	for rows.Next() {
		var relation models.EquipmentRelation

		err := rows.Scan(
			&relation.ID,
			&relation.EquipmentID,
			&relation.RelationType,
			&relation.RelatedID,
			&relation.RelatedName,
			&relation.RelatedImage,
			&relation.RelatedURL,
			&relation.RelationIndex,
		)

		if err != nil {
			return nil, err
		}

		relations = append(
			relations,
			relation,
		)
	}

	return relations, nil
}

func GetEquipmentTiers(
	db *sql.DB,
	equipmentID string,
) (
	[]models.EquipmentTier,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				equipment_id,
				tier_index,
				tier_text

			FROM equipment_tiers

			WHERE equipment_id = ?

			ORDER BY
				tier_index ASC

		`, equipmentID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	tiers :=
		[]models.EquipmentTier{}

	for rows.Next() {
		var tier models.EquipmentTier

		err := rows.Scan(
			&tier.ID,
			&tier.EquipmentID,
			&tier.TierIndex,
			&tier.TierText,
		)

		if err != nil {
			return nil, err
		}

		tiers = append(
			tiers,
			tier,
		)
	}

	return tiers, nil
}

func GetEquipmentEquipEffects(
	db *sql.DB,
	equipmentID string,
) (
	[]models.EquipmentEquipEffect,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				equipment_id,
				effect_index,
				effect_text

			FROM equipment_equip_effects

			WHERE equipment_id = ?

			ORDER BY
				effect_index ASC

		`, equipmentID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	effects :=
		[]models.EquipmentEquipEffect{}

	for rows.Next() {
		var effect models.EquipmentEquipEffect

		err := rows.Scan(
			&effect.ID,
			&effect.EquipmentID,
			&effect.EffectIndex,
			&effect.EffectText,
		)

		if err != nil {
			return nil, err
		}

		items, err :=
			GetEquipmentEquipEffectItems(
				db,
				effect.ID,
			)

		if err != nil {
			return nil, err
		}

		effect.Items =
			items

		effects = append(
			effects,
			effect,
		)
	}

	return effects, nil
}

func GetEquipmentEquipEffectItems(
	db *sql.DB,
	equipEffectID int,
) (
	[]models.EquipmentEquipEffectItem,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				equip_effect_id,
				item_id,
				item_name,
				item_image,
				item_url,
				item_index

			FROM equipment_equip_effect_items

			WHERE equip_effect_id = ?

			ORDER BY
				item_index ASC,
				id ASC

		`, equipEffectID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items :=
		[]models.EquipmentEquipEffectItem{}

	for rows.Next() {
		var item models.EquipmentEquipEffectItem

		err := rows.Scan(
			&item.ID,
			&item.EquipEffectID,
			&item.ItemID,
			&item.ItemName,
			&item.ItemImage,
			&item.ItemURL,
			&item.ItemIndex,
		)

		if err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	return items, nil
}
