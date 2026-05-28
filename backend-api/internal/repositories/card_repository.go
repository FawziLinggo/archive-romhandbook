package repositories

import (
	"database/sql"
	"encoding/json"

	"backend-api/internal/models"
)

func parseStringArray(
	raw *string,
) []string {
	if raw == nil || *raw == "" {
		return []string{}
	}

	var result []string

	if err := json.Unmarshal([]byte(*raw), &result); err != nil {
		return []string{}
	}

	return result
}

func parseJSONList[T any](
	raw *string,
) []T {
	if raw == nil || *raw == "" {
		return []T{}
	}

	var result []T

	if err := json.Unmarshal([]byte(*raw), &result); err != nil {
		return []T{}
	}

	return result
}

func GetCards(
	db *sql.DB,
	page int,
	limit int,
	query string,
	cardType string,
	quality string,
) (
	[]models.Card,
	int,
	bool,
	error,
) {
	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	where :=
		"WHERE 1 = 1"

	args :=
		[]any{}

	if query != "" {
		where += `
			AND name LIKE ?
		`

		args = append(args, search)
	}

	if cardType != "" {
		where += `
			AND card_type = ?
		`

		args = append(args, cardType)
	}

	if quality != "" {
		where += `
			AND quality = ?
		`

		args = append(args, quality)
	}

	var total int

	totalSQL :=
		"SELECT COUNT(*) FROM cards " + where

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
				name,
				card_type,
				quality,
				image,
				detail_url,
				effect_text
			FROM cards
		`+where+`

			ORDER BY
				name ASC

			LIMIT ?
			OFFSET ?

		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	cards :=
		[]models.Card{}

	for rows.Next() {
		var card models.Card

		err := rows.Scan(
			&card.ID,
			&card.Name,
			&card.CardType,
			&card.Quality,
			&card.Image,
			&card.DetailURL,
			&card.EffectText,
		)

		if err != nil {
			return nil, 0, false, err
		}

		cards = append(cards, card)
	}

	hasNext :=
		len(cards) > limit

	if hasNext {
		cards = cards[:limit]
	}

	return cards, total, hasNext, nil
}

func SearchCards(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Card,
	int,
	bool,
	error,
) {
	if len(query) < 3 {
		return []models.Card{}, 0, false, nil
	}

	return GetCards(
		db,
		page,
		limit,
		query,
		"",
		"",
	)
}

func GetCardByID(
	db *sql.DB,
	id string,
) (
	*models.CardDetail,
	error,
) {
	var card models.CardDetail

	var effectTextRaw *string
	var formulasRaw *string
	var depositTextsRaw *string
	var unlockTextsRaw *string
	var craftMaterialsRaw *string
	var skillsRaw *string
	var droppedByRaw *string
	var craftableRaw *string

	err := db.QueryRow(`

		SELECT

			c.id,
			c.name,
			c.card_type,
			c.quality,
			c.image,
			c.detail_url,
			c.effect_text,
			c.raw_html,

			(
				SELECT json_group_array(
					json_object(
						'id', f.id,
						'formula_index', f.formula_index,
						'formula_json', f.formula_json
					)
				)
				FROM card_formulas f
				WHERE f.card_id = c.id
			) as formulas,

			(
				SELECT json_group_array(
					bonus_text
				)
				FROM card_account_bonuses b
				WHERE
					b.card_id = c.id
					AND b.bonus_type = 'deposit'
			) as deposit_texts,

			(
				SELECT json_group_array(
					bonus_text
				)
				FROM card_account_bonuses b
				WHERE
					b.card_id = c.id
					AND b.bonus_type = 'unlock'
			) as unlock_texts,

			(
				SELECT json_group_array(
					json_object(
						'id', m.id,
						'material_name', m.material_name,
						'material_image', m.material_image,
						'material_url', m.material_url,
						'material_type', m.material_type
					)
				)
				FROM card_craft_materials m
				WHERE m.card_id = c.id
			) as craft_materials,

			(
				SELECT json_group_array(
					json_object(
						'id', s.id,
						'skill_name', s.skill_name,
						'skill_image', s.skill_image,
						'skill_url', s.skill_url
					)
				)
				FROM card_skills s
				WHERE s.card_id = c.id
			) as skills,

			(
				SELECT json_group_array(
					json_object(
						'id', d.id,
						'monster_name', d.monster_name,
						'monster_image', d.monster_image,
						'monster_url', d.monster_url
					)
				)
				FROM card_dropped_by d
				WHERE d.card_id = c.id
			) as dropped_by,

			(
				SELECT json_group_array(
					json_object(
						'id', cr.id,
						'item_name', cr.item_name,
						'item_image', cr.item_image,
						'item_url', cr.item_url
					)
				)
				FROM card_craftable cr
				WHERE cr.card_id = c.id
			) as craftable

		FROM cards c

		WHERE c.id = ?

		LIMIT 1

	`, id).Scan(
		&card.ID,
		&card.Name,
		&card.CardType,
		&card.Quality,
		&card.Image,
		&card.DetailURL,
		&effectTextRaw,
		&card.RawHTML,
		&formulasRaw,
		&depositTextsRaw,
		&unlockTextsRaw,
		&craftMaterialsRaw,
		&skillsRaw,
		&droppedByRaw,
		&craftableRaw,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	card.EffectText =
		effectTextRaw

	card.EffectTexts =
		parseStringArray(effectTextRaw)

	card.Formulas =
		parseJSONList[models.CardFormula](formulasRaw)

	card.DepositTexts =
		parseStringArray(depositTextsRaw)

	card.UnlockTexts =
		parseStringArray(unlockTextsRaw)

	card.CraftMaterials =
		parseJSONList[models.CardCraftMaterial](craftMaterialsRaw)

	card.Skills =
		parseJSONList[models.CardSkill](skillsRaw)

	card.DroppedBy =
		parseJSONList[models.CardDroppedBy](droppedByRaw)

	card.Craftable =
		parseJSONList[models.CardCraftable](craftableRaw)

	return &card, nil
}

func GetCardFormulas(
	db *sql.DB,
	cardID string,
) (
	[]models.CardFormula,
	error,
) {
	rows, err :=
		db.Query(`

			SELECT
				id,
				formula_index,
				formula_json

			FROM card_formulas

			WHERE card_id = ?

			ORDER BY formula_index ASC

		`, cardID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	formulas :=
		[]models.CardFormula{}

	for rows.Next() {
		var formula models.CardFormula
		var rawJSON *string

		err := rows.Scan(
			&formula.ID,
			&formula.FormulaIndex,
			&rawJSON,
		)

		if err != nil {
			return nil, err
		}

		if rawJSON != nil && *rawJSON != "" {
			var parsed any

			if err := json.Unmarshal([]byte(*rawJSON), &parsed); err == nil {
				formula.FormulaJSON = parsed
			} else {
				formula.FormulaJSON = map[string]any{}
			}
		} else {
			formula.FormulaJSON = map[string]any{}
		}

		formulas = append(formulas, formula)
	}

	return formulas, nil
}
