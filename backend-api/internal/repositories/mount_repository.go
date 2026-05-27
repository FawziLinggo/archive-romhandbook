package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetMounts(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.Mount,
	int,
	bool,
	error,
) {
	offset :=
		(page - 1) * limit

	search :=
		"%" + query + "%"

	var total int

	err := db.QueryRow(`

		SELECT
			COUNT(*)

		FROM mounts

		WHERE
			LOWER(name)
			LIKE LOWER(?)

	`, search).Scan(&total)

	if err != nil {
		return nil, 0, false, err
	}

	rows, err := db.Query(`

		SELECT
			id,
			name,
			detail_url,
			image,
			description,
			quality,
			effect_text,
			unlock_text,
			jobs

		FROM mounts

		WHERE
			LOWER(name)
			LIKE LOWER(?)

		ORDER BY
			LOWER(name) ASC

		LIMIT ?
		OFFSET ?

	`, search, limit+1, offset)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	mounts :=
		[]models.Mount{}

	for rows.Next() {
		var mount models.Mount

		err := rows.Scan(
			&mount.ID,
			&mount.Name,
			&mount.DetailURL,
			&mount.Image,
			&mount.Description,
			&mount.Quality,
			&mount.EffectText,
			&mount.UnlockText,
			&mount.Jobs,
		)

		if err != nil {
			return nil, 0, false, err
		}

		mounts = append(mounts, mount)
	}

	hasNext :=
		len(mounts) > limit

	if hasNext {
		mounts = mounts[:limit]
	}

	return mounts, total, hasNext, nil
}

func SearchMounts(
	db *sql.DB,
	query string,
) (
	[]models.Mount,
	error,
) {
	if len(query) < 4 {
		return []models.Mount{}, nil
	}

	search :=
		"%" + query + "%"

	rows, err := db.Query(`

		SELECT
			id,
			name,
			detail_url,
			image,
			description,
			quality,
			effect_text,
			unlock_text,
			jobs

		FROM mounts

		WHERE
			LOWER(name)
			LIKE LOWER(?)

		ORDER BY
			LOWER(name) ASC

	`, search)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	mounts :=
		[]models.Mount{}

	for rows.Next() {
		var mount models.Mount

		err := rows.Scan(
			&mount.ID,
			&mount.Name,
			&mount.DetailURL,
			&mount.Image,
			&mount.Description,
			&mount.Quality,
			&mount.EffectText,
			&mount.UnlockText,
			&mount.Jobs,
		)

		if err != nil {
			return nil, err
		}

		mounts = append(mounts, mount)
	}

	return mounts, nil
}

func GetMountByID(
	db *sql.DB,
	id string,
) (
	*models.MountDetail,
	error,
) {
	var mount models.MountDetail

	err := db.QueryRow(`

		SELECT
			id,
			detail_url,
			image,
			name,
			mount_type,
			description,
			quality,
			effect_text,
			unlock_text,
			jobs,
			raw_html

		FROM mounts

		WHERE id = ?

		LIMIT 1

	`, id).Scan(
		&mount.ID,
		&mount.DetailURL,
		&mount.Image,
		&mount.Name,
		&mount.MountType,
		&mount.Description,
		&mount.Quality,
		&mount.EffectText,
		&mount.UnlockText,
		&mount.Jobs,
		&mount.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	return &mount, nil
}
