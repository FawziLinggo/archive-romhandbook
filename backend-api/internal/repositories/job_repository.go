package repositories

import (
	"database/sql"

	"backend-api/internal/models"
)

func GetJobs(
	db *sql.DB,
	page int,
	limit int,
	query string,
) (
	[]models.Job,
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

		FROM jobs

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
			slug,
			detail_url,
			image,
			name

		FROM jobs

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

	jobs :=
		[]models.Job{}

	for rows.Next() {
		var job models.Job

		err := rows.Scan(
			&job.ID,
			&job.Slug,
			&job.DetailURL,
			&job.Image,
			&job.Name,
		)

		if err != nil {
			return nil, 0, false, err
		}

		jobs = append(jobs, job)
	}

	hasNext :=
		len(jobs) > limit

	if hasNext {
		jobs = jobs[:limit]
	}

	return jobs, total, hasNext, nil
}

func SearchJobs(
	db *sql.DB,
	query string,
	page int,
	limit int,
) (
	[]models.Job,
	int,
	bool,
	error,
) {
	if len(query) < 3 {
		return []models.Job{}, 0, false, nil
	}

	return GetJobs(
		db,
		page,
		limit,
		query,
	)
}

func GetJobBySlug(
	db *sql.DB,
	slug string,
) (
	*models.JobDetail,
	error,
) {
	var job models.JobDetail

	err := db.QueryRow(`

		SELECT
			id,
			slug,
			detail_url,
			image,
			name,
			raw_html

		FROM jobs

		WHERE slug = ?

		LIMIT 1

	`, slug).Scan(
		&job.ID,
		&job.Slug,
		&job.DetailURL,
		&job.Image,
		&job.Name,
		&job.RawHTML,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}

		return nil, err
	}

	relations, err :=
		GetJobRelations(
			db,
			job.ID,
		)

	if err != nil {
		return nil, err
	}

	skills, err :=
		GetJobSkills(
			db,
			job.ID,
		)

	if err != nil {
		return nil, err
	}

	runes, err :=
		GetJobRunes(
			db,
			job.ID,
		)

	if err != nil {
		return nil, err
	}

	job.Relations = relations
	job.Skills = skills
	job.Runes = runes

	return &job, nil
}

func GetJobRelations(
	db *sql.DB,
	jobID string,
) (
	[]models.JobRelation,
	error,
) {
	rows, err := db.Query(`

		SELECT
			related_job_id,
			related_slug,
			related_name,
			relation_type,
			relation_index

		FROM job_relations

		WHERE job_id = ?

		ORDER BY
			relation_type ASC,
			relation_index ASC

	`, jobID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	relations :=
		[]models.JobRelation{}

	for rows.Next() {
		var relation models.JobRelation

		err := rows.Scan(
			&relation.RelatedJobID,
			&relation.RelatedSlug,
			&relation.RelatedName,
			&relation.RelationType,
			&relation.RelationIndex,
		)

		if err != nil {
			return nil, err
		}

		relations = append(relations, relation)
	}

	return relations, nil
}

func GetJobSkills(
	db *sql.DB,
	jobID string,
) (
	[]models.JobSkill,
	error,
) {
	rows, err := db.Query(`

		SELECT
			skill_slug,
			skill_name,
			skill_image,
			skill_url,
			section,
			max_level,
			tags_raw,
			description,
			aesir_raw,
			skill_index

		FROM job_skills

		WHERE job_id = ?

		ORDER BY
			skill_index ASC

	`, jobID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	skills :=
		[]models.JobSkill{}

	for rows.Next() {
		var skill models.JobSkill

		err := rows.Scan(
			&skill.SkillSlug,
			&skill.SkillName,
			&skill.SkillImage,
			&skill.SkillURL,
			&skill.Section,
			&skill.MaxLevel,
			&skill.TagsRaw,
			&skill.Description,
			&skill.AesirRaw,
			&skill.SkillIndex,
		)

		if err != nil {
			return nil, err
		}

		skills = append(skills, skill)
	}

	return skills, nil
}

func GetJobRunes(
	db *sql.DB,
	jobID string,
) (
	[]models.JobRune,
	error,
) {
	rows, err := db.Query(`

		SELECT
			rune_slug,
			rune_name,
			rune_image,
			rune_url,
			tags_raw,
			effects_raw,
			rune_index

		FROM job_runes

		WHERE job_id = ?

		ORDER BY
			rune_index ASC

	`, jobID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	runes :=
		[]models.JobRune{}

	for rows.Next() {
		var rune models.JobRune

		err := rows.Scan(
			&rune.RuneSlug,
			&rune.RuneName,
			&rune.RuneImage,
			&rune.RuneURL,
			&rune.TagsRaw,
			&rune.EffectsRaw,
			&rune.RuneIndex,
		)

		if err != nil {
			return nil, err
		}

		runes = append(runes, rune)
	}

	return runes, nil
}
