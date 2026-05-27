package repositories

import (
	"database/sql"
	"math"

	"backend-api/internal/models"
)

func GetPets(

	db *sql.DB,

	page int,
	limit int,
	query string,

) (

	[]models.Pet,
	int,
	bool,
	error,

) {

	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	// =====================
	// TOTAL
	// =====================

	var total int

	err := db.QueryRow(`

		SELECT
			COUNT(*)

		FROM pets

		WHERE name LIKE ?

	`, search).Scan(&total)

	if err != nil {

		return nil, 0, false, err
	}

	// =====================
	// ROWS
	// =====================

	rows, err := db.Query(`

		SELECT

			p.id,
			p.detail_url,
			p.image,
			p.name,

			p.race,
			p.element,
			p.size,

			p.description,
			p.unlock_text,

			p.egg_id,
			p.egg_url,

			pe.name as egg_name,
			pe.image as egg_image,

			COALESCE(
				p.skills,
				'[]'
			) as skills

		FROM pets p

		LEFT JOIN pet_eggs pe
			ON pe.id = p.egg_id

		WHERE
			p.name LIKE ?

		ORDER BY

			CASE
				WHEN p.name GLOB '[A-Za-z]*'
				THEN 0
				ELSE 1
			END,

			LOWER(p.name) ASC

		LIMIT ?
		OFFSET ?

	`, search, limit+1, offset)

	if err != nil {

		return nil, 0, false, err
	}

	defer rows.Close()

	pets := []models.Pet{}

	for rows.Next() {

		var pet models.Pet

		err := rows.Scan(

			&pet.ID,
			&pet.DetailURL,
			&pet.Image,
			&pet.Name,

			&pet.Race,
			&pet.Element,
			&pet.Size,

			&pet.Description,
			&pet.UnlockText,

			&pet.EggID,
			&pet.EggURL,

			&pet.EggName,
			&pet.EggImage,

			&pet.Skills,
		)

		if err != nil {

			return nil, 0, false, err
		}

		pets = append(
			pets,
			pet,
		)
	}

	hasNext :=
		len(pets) > limit

	if hasNext {

		pets = pets[:limit]
	}

	totalPages :=
		int(math.Ceil(
			float64(total) / float64(limit),
		))

	_ = totalPages

	return pets, total, hasNext, nil
}

func SearchPets(

	db *sql.DB,
	query string,

) (

	[]models.Pet,
	error,

) {

	search :=
		"%" + query + "%"

	rows, err := db.Query(`

		SELECT

			p.id,
			p.detail_url,
			p.image,
			p.name,

			p.race,
			p.element,
			p.size,

			p.description,
			p.unlock_text,

			p.egg_id,
			p.egg_url,

			pe.name as egg_name,
			pe.image as egg_image,

			COALESCE(
				p.skills,
				'[]'
			) as skills

		FROM pets p

		LEFT JOIN pet_eggs pe
			ON pe.id = p.egg_id

		WHERE
			LOWER(p.name)
			LIKE LOWER(?)

		ORDER BY
			LOWER(p.name) ASC

		LIMIT 24

	`, search)

	if err != nil {

		return nil, err
	}

	defer rows.Close()

	pets := []models.Pet{}

	for rows.Next() {

		var pet models.Pet

		err := rows.Scan(

			&pet.ID,
			&pet.DetailURL,
			&pet.Image,
			&pet.Name,

			&pet.Race,
			&pet.Element,
			&pet.Size,

			&pet.Description,
			&pet.UnlockText,

			&pet.EggID,
			&pet.EggURL,

			&pet.EggName,
			&pet.EggImage,

			&pet.Skills,
		)

		if err != nil {

			return nil, err
		}

		pets = append(
			pets,
			pet,
		)
	}

	return pets, nil
}

func GetPetBySlug(

	db *sql.DB,
	slug string,

) (

	*models.PetDetail,
	error,

) {

	var pet models.PetDetail

	err := db.QueryRow(`

		SELECT

			p.id,
			p.detail_url,
			p.image,
			p.name,

			p.race,
			p.element,
			p.size,

			p.description,
			p.unlock_text,

			p.skills,

			pe.formulas_raw,

			p.raw_html,

			pe.name as egg_name,
			pe.image as egg_image,
			pe.detail_url as egg_url

		FROM pets p

		LEFT JOIN pet_eggs pe
			ON pe.id = p.egg_id

		WHERE
			p.detail_url = ?

		LIMIT 1

	`, slug).Scan(

		&pet.ID,
		&pet.DetailURL,
		&pet.Image,
		&pet.Name,

		&pet.Race,
		&pet.Element,
		&pet.Size,

		&pet.Description,
		&pet.UnlockText,

		&pet.Skills,

		&pet.FormulasRaw,

		&pet.RawHTML,

		&pet.EggName,
		&pet.EggImage,
		&pet.EggURL,
	)

	if err != nil {

		if err == sql.ErrNoRows {

			return nil, nil
		}

		return nil, err
	}

	return &pet, nil
}
