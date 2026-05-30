package feature_requests

import (
	"database/sql"
	"errors"
	"strings"

	"backend-api/internal/app/points"

	"github.com/google/uuid"
)

type Service struct {
	Repository    *Repository
	PointsService *points.Service
}

func NewService(repository *Repository, pointsService *points.Service) *Service {
	return &Service{
		Repository:    repository,
		PointsService: pointsService,
	}
}

func (s *Service) ListUser(userID string) ([]FeatureRequest, error) {
	return s.Repository.ListByUser(userID)
}

func (s *Service) ListAdmin(filter ListAdminFeatureRequestsFilter) ([]FeatureRequest, error) {
	if filter.Limit <= 0 {
		filter.Limit = 50
	}

	if filter.Limit > 100 {
		filter.Limit = 100
	}

	filter.Status = strings.TrimSpace(filter.Status)

	return s.Repository.ListAdmin(filter)
}

func (s *Service) Create(userID string, request CreateFeatureRequestRequest) (FeatureRequest, error) {
	title := strings.TrimSpace(request.Title)
	body := strings.TrimSpace(request.Body)

	if title == "" || body == "" {
		return FeatureRequest{}, errors.New("title and description are required")
	}

	if len(title) > 120 {
		return FeatureRequest{}, errors.New("title is too long")
	}

	if len(body) > 2000 {
		return FeatureRequest{}, errors.New("description is too long")
	}

	id := uuid.NewString()

	err := s.Repository.Create(id, userID, title, body)

	if err != nil {
		return FeatureRequest{}, err
	}

	return s.Repository.FindByUser(userID, id)
}

func (s *Service) GetUser(userID string, requestID string) (FeatureRequest, error) {
	item, err := s.Repository.FindByUser(userID, requestID)

	if err == sql.ErrNoRows {
		return FeatureRequest{}, ErrNotFound
	}

	return item, err
}

func (s *Service) Update(userID string, requestID string, request UpdateFeatureRequestRequest) (FeatureRequest, error) {
	current, err := s.GetUser(userID, requestID)

	if err != nil {
		return FeatureRequest{}, err
	}

	if current.Status != "open" {
		return FeatureRequest{}, ErrOnlyOpenEditable
	}

	title := strings.TrimSpace(request.Title)
	body := strings.TrimSpace(request.Body)

	if title == "" || body == "" {
		return FeatureRequest{}, errors.New("title and description are required")
	}

	if len(title) > 120 {
		return FeatureRequest{}, errors.New("title is too long")
	}

	if len(body) > 2000 {
		return FeatureRequest{}, errors.New("description is too long")
	}

	err = s.Repository.Update(userID, requestID, title, body)

	if err != nil {
		return FeatureRequest{}, err
	}

	return s.Repository.FindByUser(userID, requestID)
}

func (s *Service) Delete(userID string, requestID string) error {
	return s.Repository.SoftDelete(userID, requestID)
}

func (s *Service) UpdateStatus(requestID string, status string) (FeatureRequest, error) {
	status = strings.TrimSpace(strings.ToLower(status))

	if !isAllowedStatus(status) {
		return FeatureRequest{}, ErrInvalidStatus
	}

	before, err := s.Repository.FindAdmin(requestID)

	if err == sql.ErrNoRows {
		return FeatureRequest{}, ErrNotFound
	}

	if err != nil {
		return FeatureRequest{}, err
	}

	err = s.Repository.UpdateStatus(requestID, status)

	if err != nil {
		return FeatureRequest{}, err
	}

	after, err := s.Repository.FindAdmin(requestID)

	if err != nil {
		return FeatureRequest{}, err
	}

	s.syncAcceptedPoint(before, after)

	return after, nil
}

func (s *Service) syncAcceptedPoint(before FeatureRequest, after FeatureRequest) {
	if s.PointsService == nil {
		return
	}

	if before.Status == after.Status {
		return
	}

	if after.Status == "accepted" {
		_ = s.PointsService.Award(points.AwardInput{
			UserID:     after.UserID,
			RuleCode:   "feature_request_accepted",
			SourceType: "feature_request",
			SourceID:   after.ID,
		})

		return
	}

	if before.Status == "accepted" && after.Status != "accepted" {
		_ = s.PointsService.Revoke(points.AwardInput{
			UserID:     after.UserID,
			RuleCode:   "feature_request_accepted",
			SourceType: "feature_request",
			SourceID:   after.ID,
		})
	}
}

func isAllowedStatus(status string) bool {
	switch status {
	case "open", "reviewing", "accepted", "planned", "done", "rejected", "duplicate":
		return true
	default:
		return false
	}
}
