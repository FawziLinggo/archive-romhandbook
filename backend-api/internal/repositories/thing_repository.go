package repositories

import (
	"database/sql"

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
