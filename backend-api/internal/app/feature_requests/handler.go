package feature_requests

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

func (h *Handler) ListUser(c *gin.Context) {
	userID, ok := session.RequireUserID(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	items, err := h.Service.ListUser(userID)

	respond(c, items, err, http.StatusOK)
}

func (h *Handler) Create(c *gin.Context) {
	userID, ok := session.RequireUserID(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	var request CreateFeatureRequestRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	item, err := h.Service.Create(userID, request)

	respond(c, item, err, http.StatusCreated)
}

func (h *Handler) GetUser(c *gin.Context) {
	userID, ok := session.RequireUserID(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	item, err := h.Service.GetUser(userID, c.Param("id"))

	respond(c, item, err, http.StatusOK)
}

func (h *Handler) Update(c *gin.Context) {
	userID, ok := session.RequireUserID(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	var request UpdateFeatureRequestRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	item, err := h.Service.Update(userID, c.Param("id"), request)

	respond(c, item, err, http.StatusOK)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, ok := session.RequireUserID(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	err := h.Service.Delete(userID, c.Param("id"))

	if err != nil {
		respond(c, nil, err, http.StatusOK)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Feature request deleted",
	})
}

func (h *Handler) ListAdmin(c *gin.Context) {
	_, ok := admin.RequireAdmin(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	limit, _ := strconv.Atoi(c.Query("limit"))

	items, err := h.Service.ListAdmin(ListAdminFeatureRequestsFilter{
		Status: strings.TrimSpace(c.Query("status")),
		Limit:  limit,
	})

	respond(c, items, err, http.StatusOK)
}

func (h *Handler) UpdateAdminStatus(c *gin.Context) {
	_, ok := admin.RequireAdmin(c, h.Service.Repository.DB)

	if !ok {
		return
	}

	var request UpdateFeatureRequestStatusRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	item, err := h.Service.UpdateStatus(c.Param("id"), request.Status)

	respond(c, item, err, http.StatusOK)
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
