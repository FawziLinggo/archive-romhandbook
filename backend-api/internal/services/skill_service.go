package services

import (
	"database/sql"
	"math"

	"backend-api/internal/models"
	"backend-api/internal/repositories"
)

func GetSkillsService(

	db *sql.DB,

	page int,
	limit int,

	query string,

) (*models.SkillListResponse, error) {

	skills, total, err :=
		repositories.GetSkills(

			db,

			page,
			limit,

			query,
		)

	if err != nil {

		return nil, err
	}

	totalPages :=
		int(math.Ceil(
			float64(total) /
				float64(limit),
		))

	response :=
		&models.SkillListResponse{

			Success: true,

			Data: skills,

			Meta: models.Meta{

				Page:  page,
				Limit: limit,
				Total: total,

				TotalPages: totalPages,

				HasNext: page < totalPages,
			},
		}

	return response, nil
}
