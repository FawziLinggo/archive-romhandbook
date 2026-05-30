package reports

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"backend-api/internal/app/admin"
	"backend-api/internal/app/session"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (handler *Handler) ListReports(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	reports, err :=
		handler.Service.ListUserReports(userID)

	respond(c, reports, err, http.StatusOK)
}

func (handler *Handler) CreateReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	var request CreateReportRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	report, err :=
		handler.Service.CreateReport(userID, request)

	respond(c, report, err, http.StatusCreated)
}

func (handler *Handler) GetReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	report, err :=
		handler.Service.GetUserReport(userID, c.Param("id"))

	respond(c, report, err, http.StatusOK)
}

func (handler *Handler) UpdateReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	var request UpdateReportRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	report, err :=
		handler.Service.UpdateReport(userID, c.Param("id"), request)

	respond(c, report, err, http.StatusOK)
}

func (handler *Handler) DeleteReport(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	err :=
		handler.Service.DeleteReport(userID, c.Param("id"))

	if err != nil {
		errorJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Report deleted",
	})
}

func (handler *Handler) ListAdminReports(c *gin.Context) {
	_, ok :=
		admin.RequireAdmin(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	limit, _ :=
		strconv.Atoi(c.Query("limit"))

	reports, err :=
		handler.Service.ListAdminReports(ListAdminReportsFilter{
			Status: strings.TrimSpace(c.Query("status")),
			Limit:  limit,
		})

	respond(c, reports, err, http.StatusOK)
}

func (handler *Handler) UpdateAdminReportStatus(c *gin.Context) {
	_, ok :=
		admin.RequireAdmin(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	var request UpdateReportStatusRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	report, err :=
		handler.Service.UpdateReportStatus(c.Param("id"), request.Status)

	respond(c, report, err, http.StatusOK)
}

func respond(c *gin.Context, data any, err error, status int) {
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			errorJSON(c, http.StatusNotFound, err.Error())
			return
		}

		if errors.Is(err, ErrInvalidStatus) ||
			errors.Is(err, ErrOnlyOpenEditable) {
			errorJSON(c, http.StatusBadRequest, err.Error())
			return
		}

		errorJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(status, gin.H{
		"success": true,
		"data":    data,
	})
}

func errorJSON(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"message": message,
	})
}
