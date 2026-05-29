package repositories

import (
	"database/sql"
	"encoding/json"

	"backend-api/internal/models"
)

func GetThingTypeByID(
	db *sql.DB,
	id string,
) (
	*models.ThingType,
	error,
) {
	var thing models.ThingType

	err := db.QueryRow(`

		SELECT
			id,
			type

		FROM things

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&thing.ID,
		&thing.Type,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &thing, nil
}

func GetRandomSnapshotCard(
	db *sql.DB,
) (
	*models.RandomSnapshotCard,
	error,
) {
	var card models.RandomSnapshotCard

	err := db.QueryRow(`

		SELECT

			c.id,
			c.name,
			c.image,
			c.detail_url,
			c.raw_html,
			c.card_type,
			c.quality,
			c.effect_text,

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

			) as dropped_by

		FROM cards c

		WHERE c.raw_html IS NOT NULL

		ORDER BY RANDOM()

		LIMIT 1

	`).Scan(
		&card.ID,
		&card.Name,
		&card.Image,
		&card.DetailURL,
		&card.RawHTML,
		&card.CardType,
		&card.Quality,
		&card.EffectText,
		&card.DroppedBy,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	if card.EffectText != nil && *card.EffectText != "" {
		var effects []string

		err :=
			json.Unmarshal(
				[]byte(*card.EffectText),
				&effects,
			)

		if err == nil {
			card.EffectTexts = effects
		}
	}

	if card.DroppedBy == "" {
		card.DroppedBy = "[]"
	}

	return &card, nil
}

func getThingFormulas(
	db *sql.DB,
	table string,
	ownerColumn string,
	ownerID string,
) (
	[]models.ThingFormula,
	error,
) {
	rows, err := db.Query(`

		SELECT
			id,
			formula_index,
			formula_json

		FROM `+table+`

		WHERE `+ownerColumn+` = ?

		ORDER BY formula_index ASC

	`, ownerID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	formulas :=
		[]models.ThingFormula{}

	for rows.Next() {
		var formula models.ThingFormula

		err := rows.Scan(
			&formula.ID,
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

	return formulas, rows.Err()
}

func getThingRelations(
	db *sql.DB,
	table string,
	ownerColumn string,
	ownerID string,
	hasQuantity bool,
) (
	[]models.ThingRelation,
	error,
) {
	quantityColumn :=
		"NULL AS quantity"

	if hasQuantity {
		quantityColumn = "quantity"
	}

	rows, err := db.Query(`

		SELECT
			id,
			relation_type,
			related_id,
			related_name,
			related_image,
			related_url,
			`+quantityColumn+`,
			relation_index

		FROM `+table+`

		WHERE `+ownerColumn+` = ?

		ORDER BY relation_index ASC

	`, ownerID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	relations :=
		[]models.ThingRelation{}

	for rows.Next() {
		var relation models.ThingRelation

		err := rows.Scan(
			&relation.ID,
			&relation.RelationType,
			&relation.RelatedID,
			&relation.RelatedName,
			&relation.RelatedImage,
			&relation.RelatedURL,
			&relation.Quantity,
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

	return relations, rows.Err()
}

func filterThingRelations(
	relations []models.ThingRelation,
	relationType string,
) []models.ThingRelation {
	filtered :=
		[]models.ThingRelation{}

	for _, relation := range relations {
		if relation.RelationType == relationType {
			filtered = append(
				filtered,
				relation,
			)
		}
	}

	return filtered
}

func GetFurnitureByID(
	db *sql.DB,
	id string,
) (
	*models.FurnitureDetail,
	error,
) {
	var furniture models.FurnitureDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			furniture_type,
			furniture_subtype,
			is_blueprint,
			description,
			quality,
			effect_text,
			unlock_text,
			deposit_stats,
			raw_tags,
			raw_html

		FROM furnitures

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&furniture.ID,
		&furniture.DetailURL,
		&furniture.Image,
		&furniture.Name,
		&furniture.FurnitureType,
		&furniture.FurnitureSubtype,
		&furniture.IsBlueprint,
		&furniture.Description,
		&furniture.Quality,
		&furniture.EffectText,
		&furniture.UnlockText,
		&furniture.DepositStats,
		&furniture.RawTags,
		&furniture.RawHTML,
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
			"furniture_formulas",
			"furniture_id",
			id,
		)

	if err != nil {
		return nil, err
	}

	relations, err :=
		getThingRelations(
			db,
			"furniture_relations",
			"furniture_id",
			id,
			true,
		)

	if err != nil {
		return nil, err
	}

	furniture.Formulas = formulas
	furniture.Relations = relations
	furniture.CraftMaterials =
		filterThingRelations(relations, "craft_materials")
	furniture.Craftable =
		filterThingRelations(relations, "craftable")
	furniture.DroppedBy =
		filterThingRelations(relations, "dropped_by")

	return &furniture, nil
}

func GetCookingIngredientByID(
	db *sql.DB,
	id string,
) (
	*models.CookingIngredientDetail,
	error,
) {
	var ingredient models.CookingIngredientDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			ingredient_type,
			description,
			quality,
			raw_tags,
			raw_html

		FROM cooking_ingredients

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&ingredient.ID,
		&ingredient.DetailURL,
		&ingredient.Image,
		&ingredient.Name,
		&ingredient.IngredientType,
		&ingredient.Description,
		&ingredient.Quality,
		&ingredient.RawTags,
		&ingredient.RawHTML,
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
			"cooking_ingredient_formulas",
			"ingredient_id",
			id,
		)

	if err != nil {
		return nil, err
	}

	relations, err :=
		getThingRelations(
			db,
			"cooking_ingredient_relations",
			"ingredient_id",
			id,
			false,
		)

	if err != nil {
		return nil, err
	}

	ingredient.Formulas = formulas
	ingredient.Relations = relations
	ingredient.DroppedBy =
		filterThingRelations(relations, "dropped_by")

	return &ingredient, nil
}

func GetPetHeadwearUnlockItemByID(
	db *sql.DB,
	id string,
) (
	*models.PetHeadwearUnlockItemDetail,
	error,
) {
	var item models.PetHeadwearUnlockItemDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			item_type,
			pet_headwear_name,
			pet_name,
			description,
			quality,
			formula_id,
			compose_id,
			unlock_item_id,
			unlock_effect_type,
			unlock_body_ids,
			raw_tags,
			raw_formula,
			raw_html

		FROM pet_headwear_unlock_items

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&item.ID,
		&item.DetailURL,
		&item.Image,
		&item.Name,
		&item.ItemType,
		&item.PetHeadwearName,
		&item.PetName,
		&item.Description,
		&item.Quality,
		&item.FormulaID,
		&item.ComposeID,
		&item.UnlockItemID,
		&item.UnlockEffectType,
		&item.UnlockBodyIDs,
		&item.RawTags,
		&item.RawFormula,
		&item.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	relations, err :=
		getThingRelations(
			db,
			"pet_headwear_unlock_item_relations",
			"item_id",
			id,
			true,
		)

	if err != nil {
		return nil, err
	}

	item.Relations = relations
	item.CraftMaterials =
		filterThingRelations(relations, "craft_materials")
	item.Craftable =
		filterThingRelations(relations, "craftable")

	return &item, nil
}
func getCraftingMaterialCraftables(
	db *sql.DB,
	materialID string,
) (
	[]models.CraftingMaterialCraftable,
	error,
) {
	rows, err := db.Query(`

		SELECT
			id,
			material_id,
			item_name,
			item_image,
			item_url

		FROM crafting_material_craftables

		WHERE material_id = ?

		ORDER BY id ASC

	`, materialID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items :=
		[]models.CraftingMaterialCraftable{}

	for rows.Next() {
		var item models.CraftingMaterialCraftable

		err := rows.Scan(
			&item.ID,
			&item.MaterialID,
			&item.ItemName,
			&item.ItemImage,
			&item.ItemURL,
		)

		if err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	return items, rows.Err()
}

func getCraftingMaterialDroppedBy(
	db *sql.DB,
	materialID string,
) (
	[]models.CraftingMaterialDroppedBy,
	error,
) {
	rows, err := db.Query(`

		SELECT
			id,
			material_id,
			monster_name,
			monster_image,
			monster_url

		FROM crafting_material_dropped_by

		WHERE material_id = ?

		ORDER BY id ASC

	`, materialID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items :=
		[]models.CraftingMaterialDroppedBy{}

	for rows.Next() {
		var item models.CraftingMaterialDroppedBy

		err := rows.Scan(
			&item.ID,
			&item.MaterialID,
			&item.MonsterName,
			&item.MonsterImage,
			&item.MonsterURL,
		)

		if err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	return items, rows.Err()
}

func GetCraftingMaterialByID(
	db *sql.DB,
	id string,
) (
	*models.CraftingMaterialDetail,
	error,
) {
	var material models.CraftingMaterialDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			material_type,
			quality,
			description,
			raw_html

		FROM crafting_materials

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&material.ID,
		&material.DetailURL,
		&material.Image,
		&material.Name,
		&material.MaterialType,
		&material.Quality,
		&material.Description,
		&material.RawHTML,
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
			"crafting_material_formulas",
			"material_id",
			id,
		)

	if err != nil {
		return nil, err
	}

	craftable, err :=
		getCraftingMaterialCraftables(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	droppedBy, err :=
		getCraftingMaterialDroppedBy(
			db,
			id,
		)

	if err != nil {
		return nil, err
	}

	material.Formulas = formulas
	material.Craftable = craftable
	material.DroppedBy = droppedBy

	return &material, nil
}
