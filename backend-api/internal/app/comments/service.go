package comments

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

func (service *Service) ListComments(targetType string, targetID string) ([]Comment, error) {
	targetType =
		strings.TrimSpace(targetType)

	targetID =
		strings.TrimSpace(targetID)

	if targetType == "" || targetID == "" {
		return nil, errors.New("target_type and target_id are required")
	}

	flatComments, err :=
		service.Repository.ListByTarget(targetType, targetID)

	if err != nil {
		return nil, err
	}

	return buildNestedComments(flatComments), nil
}

func (service *Service) CreateComment(userID string, request CreateCommentRequest) (Comment, error) {
	targetType :=
		strings.TrimSpace(request.TargetType)

	targetID :=
		strings.TrimSpace(request.TargetID)

	body :=
		strings.TrimSpace(request.Body)

	if targetType == "" || targetID == "" {
		return Comment{}, errors.New("target_type and target_id are required")
	}

	if body == "" {
		return Comment{}, errors.New("comment body is required")
	}

	if len(body) > 2000 {
		return Comment{}, errors.New("comment body is too long")
	}

	parentID :=
		nullableString(request.ParentID)

	if parentID != nil {
		parent, err :=
			service.Repository.FindByID(*parentID)

		if err == sql.ErrNoRows {
			return Comment{}, ErrCommentNotFound
		}

		if err != nil {
			return Comment{}, err
		}

		if parent.TargetType != targetType || parent.TargetID != targetID {
			return Comment{}, errors.New("parent comment target mismatch")
		}

		parentDepth :=
			service.calculateDepth(parent)

		if parentDepth >= 2 {
			return Comment{}, ErrReplyDepthLimit
		}
	}

	commentID :=
		uuid.NewString()

	err :=
		service.Repository.Create(CreateCommentInput{
			ID:         commentID,
			UserID:     userID,
			TargetType: targetType,
			TargetID:   targetID,
			ParentID:   parentID,
			Body:       body,
		})

	if err != nil {
		return Comment{}, err
	}

	comment, err :=
		service.Repository.FindByID(commentID)

	if err != nil {
		return Comment{}, err
	}

	service.awardCommentPoint(comment)

	return comment, nil
}

func (service *Service) UpdateComment(userID string, commentID string, request UpdateCommentRequest) (Comment, error) {
	comment, err :=
		service.Repository.FindByID(commentID)

	if err == sql.ErrNoRows {
		return Comment{}, ErrCommentNotFound
	}

	if err != nil {
		return Comment{}, err
	}

	canModify, err :=
		service.canModify(userID, comment)

	if err != nil {
		return Comment{}, err
	}

	if !canModify {
		return Comment{}, ErrForbidden
	}

	body :=
		strings.TrimSpace(request.Body)

	if body == "" {
		return Comment{}, errors.New("comment body is required")
	}

	if len(body) > 2000 {
		return Comment{}, errors.New("comment body is too long")
	}

	err =
		service.Repository.UpdateBody(commentID, body)

	if err != nil {
		return Comment{}, err
	}

	return service.Repository.FindByID(commentID)
}

func (service *Service) DeleteComment(userID string, commentID string) error {
	comment, err :=
		service.Repository.FindByID(commentID)

	if err == sql.ErrNoRows {
		return ErrCommentNotFound
	}

	if err != nil {
		return err
	}

	canModify, err :=
		service.canModify(userID, comment)

	if err != nil {
		return err
	}

	if !canModify {
		return ErrForbidden
	}

	err =
		service.Repository.SoftDelete(commentID)

	if err != nil {
		return err
	}

	service.revokeCommentPoint(comment)

	return nil
}

func (service *Service) canModify(userID string, comment Comment) (bool, error) {
	if comment.UserID == userID {
		return true, nil
	}

	role, err :=
		service.Repository.GetUserRole(userID)

	if err != nil {
		return false, err
	}

	return role == "admin", nil
}

func (service *Service) awardCommentPoint(comment Comment) {
	if service.PointsService == nil {
		return
	}

	_ = service.PointsService.Award(points.AwardInput{
		UserID:     comment.UserID,
		RuleCode:   "comment_activity",
		SourceType: "comment",
		SourceID:   comment.ID,
	})
}

func (service *Service) revokeCommentPoint(comment Comment) {
	if service.PointsService == nil {
		return
	}

	_ = service.PointsService.Revoke(points.AwardInput{
		UserID:     comment.UserID,
		RuleCode:   "comment_activity",
		SourceType: "comment",
		SourceID:   comment.ID,
	})
}

func (service *Service) calculateDepth(comment Comment) int {
	if comment.ParentID == nil {
		return 0
	}

	parent, err :=
		service.Repository.FindByID(*comment.ParentID)

	if err != nil || parent.ParentID == nil {
		return 1
	}

	return 2
}

func buildNestedComments(flatComments []Comment) []Comment {
	byID :=
		map[string]*Comment{}

	childrenByParentID :=
		map[string][]*Comment{}

	for i := range flatComments {
		flatComments[i].Replies =
			[]Comment{}

		byID[flatComments[i].ID] =
			&flatComments[i]
	}

	for i := range flatComments {
		comment :=
			&flatComments[i]

		if comment.ParentID == nil {
			continue
		}

		parentID :=
			*comment.ParentID

		if _, exists := byID[parentID]; !exists {
			continue
		}

		childrenByParentID[parentID] =
			append(childrenByParentID[parentID], comment)
	}

	var attachReplies func(comment *Comment, depth int) Comment

	attachReplies = func(comment *Comment, depth int) Comment {
		result :=
			*comment

		result.Depth =
			depth

		result.Replies =
			[]Comment{}

		for _, child := range childrenByParentID[comment.ID] {
			result.Replies =
				append(result.Replies, attachReplies(child, depth+1))
		}

		return result
	}

	roots :=
		[]Comment{}

	for i := range flatComments {
		comment :=
			&flatComments[i]

		if comment.ParentID != nil {
			continue
		}

		roots =
			append(roots, attachReplies(comment, 0))
	}

	return roots
}

func nullableString(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed :=
		strings.TrimSpace(*value)

	if trimmed == "" {
		return nil
	}

	return &trimmed
}
