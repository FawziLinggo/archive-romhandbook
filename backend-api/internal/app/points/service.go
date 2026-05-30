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

func (service *Service) Revoke(input AwardInput) error {
	if input.UserID == "" || input.RuleCode == "" || input.SourceType == "" || input.SourceID == "" {
		return nil
	}

	alreadyAwarded, err :=
		service.Repository.HasLedger(
			input.UserID,
			input.RuleCode,
			input.SourceType,
			input.SourceID,
		)

	if err != nil {
		return err
	}

	if !alreadyAwarded {
		return nil
	}

	revokeReason :=
		input.RuleCode + "_revoked"

	alreadyRevoked, err :=
		service.Repository.HasLedger(
			input.UserID,
			revokeReason,
			input.SourceType,
			input.SourceID,
		)

	if err != nil {
		return err
	}

	if alreadyRevoked {
		return nil
	}

	value, err :=
		service.Repository.GetRulePoints(input.RuleCode)

	if err != nil {
		return err
	}

	inserted, err :=
		service.Repository.InsertLedgerWithReason(
			input.UserID,
			revokeReason,
			input.SourceType,
			input.SourceID,
			-value,
		)

	if err != nil {
		return err
	}

	if !inserted {
		return nil
	}

	return service.Repository.AddUserPoints(input.UserID, -value)
}
