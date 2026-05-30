package reports

type Report struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	UserName   *string `json:"user_name,omitempty"`
	UserEmail  *string `json:"user_email,omitempty"`
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

type CreateReportRequest struct {
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
}

type UpdateReportRequest struct {
	TargetType *string `json:"target_type"`
	TargetID   *string `json:"target_id"`
	TargetURL  *string `json:"target_url"`
	Title      string  `json:"title"`
	Body       string  `json:"body"`
}

type UpdateReportStatusRequest struct {
	Status string `json:"status"`
}

type ListAdminReportsFilter struct {
	Status string
	Limit  int
}

type CreateReportInput struct {
	ID         string
	UserID     string
	TargetType *string
	TargetID   *string
	TargetURL  *string
	Title      string
	Body       string
}

type UpdateReportInput struct {
	ID         string
	UserID     string
	TargetType *string
	TargetID   *string
	TargetURL  *string
	Title      string
	Body       string
}
