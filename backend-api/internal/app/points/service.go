package points

import "database/sql"

type Service struct {
	Repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		Repository: repository,
	}
}

func (service *Service) Award(input AwardInput) error {
	if input.UserID == "" || input.RuleCode == "" || input.SourceType == "" || input.SourceID == "" {
		return nil
	}

	value, err :=
		service.Repository.GetRulePoints(input.RuleCode)

	if err == sql.ErrNoRows {
		return nil
	}

	if err != nil {
		return err
	}

	inserted, err :=
		service.Repository.InsertLedger(input, value)

	if err != nil {
		return err
	}

	if !inserted {
		return nil
	}

	return service.Repository.AddUserPoints(input.UserID, value)
}
