package feature_requests

import "errors"

var ErrNotFound = errors.New("feature request not found")

var ErrInvalidStatus = errors.New("invalid feature request status")

var ErrOnlyOpenEditable = errors.New("only open feature requests can be edited")

type FeatureRequest struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	UserName  *string `json:"user_name,omitempty"`
	UserEmail *string `json:"user_email,omitempty"`
	Title     string  `json:"title"`
	Body      string  `json:"body"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type CreateFeatureRequestRequest struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type UpdateFeatureRequestRequest struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type UpdateFeatureRequestStatusRequest struct {
	Status string `json:"status"`
}

type ListAdminFeatureRequestsFilter struct {
	Status string
	Limit  int
}
