package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetEggByID(

	db *sql.DB,

	id string,

) (

	*models.PetEgg,
	error,

) {

	query := `

		SELECT

			pe.id,
			pe.detail_url,
			pe.image,
			pe.name,
			pe.description,
			pe.effect_text,
			pe.unlock_text,
			pe.jobs_raw,
			pe.pet_url,
			pe.formulas_raw,
			pe.raw_html,

			p.name as pet_name,
			p.image as pet_image

		FROM pet_eggs pe

		LEFT JOIN pets p
			ON p.egg_id = pe.id

		WHERE pe.id = ?

		LIMIT 1
	`

	var egg models.PetEgg

	err := db.QueryRow(

		query,

		id,
	).Scan(

		&egg.ID,
		&egg.DetailURL,
		&egg.Image,
		&egg.Name,
		&egg.Description,
		&egg.EffectText,
		&egg.UnlockText,
		&egg.JobsRaw,
		&egg.PetURL,
		&egg.FormulasRaw,
		&egg.RawHTML,

		&egg.PetName,
		&egg.PetImage,
	)

	if err != nil {

		if err == sql.ErrNoRows {

			return nil, nil
		}

		return nil, err
	}

	return &egg, nil
}
