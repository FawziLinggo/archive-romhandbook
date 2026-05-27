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
