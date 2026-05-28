package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func countTable(
	db *sql.DB,
	table string,
) (
	models.CountTotal,
	error,
) {
	var count models.CountTotal

	query :=
		"SELECT COUNT(*) as total FROM " + table

	err :=
		db.QueryRow(query).Scan(
			&count.Total,
		)

	if err != nil {
		return models.CountTotal{}, err
	}

	return count, nil
}

func GetArchiveCounts(
	db *sql.DB,
) (
	*models.ArchiveCounts,
	error,
) {
	cards, err :=
		countTable(db, "cards")

	if err != nil {
		return nil, err
	}

	equipments, err :=
		countTable(db, "equipments")

	if err != nil {
		return nil, err
	}

	headwears, err :=
		countTable(db, "headwears")

	if err != nil {
		return nil, err
	}

	monsters, err :=
		countTable(db, "monsters")

	if err != nil {
		return nil, err
	}

	mounts, err :=
		countTable(db, "mounts")

	if err != nil {
		return nil, err
	}

	pets, err :=
		countTable(db, "pets")

	if err != nil {
		return nil, err
	}

	skills, err :=
		countTable(db, "skills")

	if err != nil {
		return nil, err
	}

	buffs, err :=
		countTable(db, "buffs")

	if err != nil {
		return nil, err
	}

	formulas, err :=
		countTable(db, "formulas_code")

	if err != nil {
		return nil, err
	}

	jobs, err :=
		countTable(db, "jobs")

	if err != nil {
		return nil, err
	}

	return &models.ArchiveCounts{
		Cards:      cards,
		Equipments: equipments,
		Headwears:  headwears,
		Monsters:   monsters,
		Mounts:     mounts,
		Pets:       pets,
		Skills:     skills,
		Buffs:      buffs,
		Formulas:   formulas,
		Jobs:       jobs,
	}, nil
}
