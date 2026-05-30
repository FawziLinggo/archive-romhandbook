package reports

import (
	"database/sql"
	"errors"
	"strings"

	"backend-api/internal/app/points"

	"github.com/google/uuid"
)

var ErrNotFound = errors.New("report not found")

var ErrInvalidStatus = errors.New("invalid report status")

var ErrOnlyOpenEditable = errors.New("only open reports can be edited")

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

func (service *Service) ListUserReports(userID string) ([]Report, error) {
	return service.Repository.ListByUser(userID)
}

func (service *Service) ListAdminReports(filter ListAdminReportsFilter) ([]Report, error) {
	if filter.Limit <= 0 {
		filter.Limit = 50
	}

	if filter.Limit > 100 {
		filter.Limit = 100
	}

	filter.Status =
		strings.TrimSpace(filter.Status)

	return service.Repository.ListAdmin(filter)
}

func (service *Service) CreateReport(userID string, request CreateReportRequest) (Report, error) {
	title :=
		strings.TrimSpace(request.Title)

	body :=
		strings.TrimSpace(request.Body)

	if title == "" || body == "" {
		return Report{}, errors.New("title and description are required")
	}

	if len(title) > 120 {
		return Report{}, errors.New("title is too long")
	}

	if len(body) > 2000 {
		return Report{}, errors.New("description is too long")
	}

	reportID :=
		uuid.NewString()

	err :=
		service.Repository.Create(CreateReportInput{
			ID:         reportID,
			UserID:     userID,
			TargetType: request.TargetType,
			TargetID:   request.TargetID,
			TargetURL:  request.TargetURL,
			Title:      title,
			Body:       body,
		})

	if err != nil {
		return Report{}, err
	}

	return service.Repository.FindByUser(userID, reportID)
}

func (service *Service) GetUserReport(userID string, reportID string) (Report, error) {
	report, err :=
		service.Repository.FindByUser(userID, reportID)

	if err == sql.ErrNoRows {
		return Report{}, ErrNotFound
	}

	return report, err
}

func (service *Service) UpdateReport(userID string, reportID string, request UpdateReportRequest) (Report, error) {
	current, err :=
		service.GetUserReport(userID, reportID)

	if err != nil {
		return Report{}, err
	}

	if current.Status != "open" {
		return Report{}, ErrOnlyOpenEditable
	}

	title :=
		strings.TrimSpace(request.Title)

	body :=
		strings.TrimSpace(request.Body)

	if title == "" || body == "" {
		return Report{}, errors.New("title and description are required")
	}

	if len(title) > 120 {
		return Report{}, errors.New("title is too long")
	}

	if len(body) > 2000 {
		return Report{}, errors.New("description is too long")
	}

	err =
		service.Repository.Update(UpdateReportInput{
			ID:         reportID,
			UserID:     userID,
			TargetType: request.TargetType,
			TargetID:   request.TargetID,
			TargetURL:  request.TargetURL,
			Title:      title,
			Body:       body,
		})

	if err != nil {
		return Report{}, err
	}

	return service.Repository.FindByUser(userID, reportID)
}

func (service *Service) DeleteReport(userID string, reportID string) error {
	return service.Repository.SoftDelete(userID, reportID)
}

func (service *Service) UpdateReportStatus(reportID string, status string) (Report, error) {
	status =
		strings.TrimSpace(
			strings.ToLower(status),
		)

	if !isAllowedReportStatus(status) {
		return Report{}, ErrInvalidStatus
	}

	before, err :=
		service.Repository.FindAdmin(reportID)

	if err == sql.ErrNoRows {
		return Report{}, ErrNotFound
	}

	if err != nil {
		return Report{}, err
	}

	err =
		service.Repository.UpdateStatus(reportID, status)

	if err != nil {
		return Report{}, err
	}

	after, err :=
		service.Repository.FindAdmin(reportID)

	if err != nil {
		return Report{}, err
	}

	service.awardReportPoints(before, after)

	return after, nil
}

func (service *Service) awardReportPoints(before Report, after Report) {
	if service.PointsService == nil {
		return
	}

	if before.Status == after.Status {
		return
	}

	if after.Status == "reviewing" {
		_ = service.PointsService.Award(points.AwardInput{
			UserID:     after.UserID,
			RuleCode:   "bug_report_accepted",
			SourceType: "report",
			SourceID:   after.ID,
		})
	}

	if after.Status == "resolved" {
		_ = service.PointsService.Award(points.AwardInput{
			UserID:     after.UserID,
			RuleCode:   "bug_report_fixed",
			SourceType: "report",
			SourceID:   after.ID,
		})
	}
}

func isAllowedReportStatus(status string) bool {
	switch status {
	case "open", "reviewing", "resolved", "rejected", "duplicate":
		return true
	default:
		return false
	}
}
