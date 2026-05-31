package repositories

import (
	"database/sql"
	"strings"

	"backend-api/internal/models"
)

func GetMaps(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.ROMMap,
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

	query =
		strings.TrimSpace(query)

	if query != "" {
		where += `
			AND (
				LOWER(name) LIKE ?
				OR LOWER(id) LIKE ?
				OR LOWER(detail_url) LIKE ?
			)
		`

		like :=
			"%" + strings.ToLower(query) + "%"

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
			"SELECT COUNT(*) FROM maps "+where,
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
				m.id,
				m.detail_url,
				m.image,
				m.name,
				(
					SELECT COUNT(*)
					FROM map_monsters mm
					WHERE mm.map_id = m.id
				) AS monster_count

			FROM maps m
		`+where+`

			ORDER BY
				m.name COLLATE NOCASE ASC

			LIMIT ?
			OFFSET ?
		`, rowsArgs...)

	if err != nil {
		return nil, 0, false, err
	}

	defer rows.Close()

	items :=
		[]models.ROMMap{}

	for rows.Next() {
		var item models.ROMMap

		err := rows.Scan(
			&item.ID,
			&item.DetailURL,
			&item.Image,
			&item.Name,
			&item.MonsterCount,
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

	return items, total, hasNext, nil
}

func GetMapBySlug(
	db *sql.DB,
	slug string,
) (
	*models.ROMMapDetail,
	error,
) {
	var item models.ROMMapDetail

	err :=
		db.QueryRow(`
			SELECT
				id,
				detail_url,
				image,
				name,
				raw_html

			FROM maps

			WHERE id = ?
			OR detail_url = ?
			OR detail_url LIKE '%' || ? || '%'

			LIMIT 1
		`,
			slug,
			"/maps/"+slug,
			slug,
		).Scan(
			&item.ID,
			&item.DetailURL,
			&item.Image,
			&item.Name,
			&item.RawHTML,
		)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	monsters, err :=
		GetMapMonsters(
			db,
			item.ID,
		)

	if err != nil {
		return nil, err
	}

	item.Monsters =
		monsters

	return &item, nil
}

func GetMapMonsters(
	db *sql.DB,
	mapID string,
) (
	[]models.ROMMapMonster,
	error,
) {
	rows, err :=
		db.Query(`
			SELECT
				id,
				map_id,
				monster_id,
				monster_name,
				monster_image,
				monster_url,
				level,
				race,
				element,
				size,
				relation_index

			FROM map_monsters

			WHERE map_id = ?

			ORDER BY
				relation_index ASC,
				id ASC
		`, mapID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items :=
		[]models.ROMMapMonster{}

	for rows.Next() {
		var item models.ROMMapMonster

		err := rows.Scan(
			&item.ID,
			&item.MapID,
			&item.MonsterID,
			&item.MonsterName,
			&item.MonsterImage,
			&item.MonsterURL,
			&item.Level,
			&item.Race,
			&item.Element,
			&item.Size,
			&item.RelationIndex,
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
