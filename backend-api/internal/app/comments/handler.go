package comments

import (
	"errors"
	"net/http"

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

func (handler *Handler) ListComments(c *gin.Context) {
	comments, err :=
		handler.Service.ListComments(
			c.Query("target_type"),
			c.Query("target_id"),
		)

	respond(c, comments, err, http.StatusOK)
}

func (handler *Handler) CreateComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	var request CreateCommentRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	comment, err :=
		handler.Service.CreateComment(userID, request)

	respond(c, comment, err, http.StatusCreated)
}

func (handler *Handler) UpdateComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	var request UpdateCommentRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		errorJSON(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	comment, err :=
		handler.Service.UpdateComment(
			userID,
			c.Param("id"),
			request,
		)

	respond(c, comment, err, http.StatusOK)
}

func (handler *Handler) DeleteComment(c *gin.Context) {
	userID, ok :=
		session.RequireUserID(c, handler.Service.Repository.DB)

	if !ok {
		return
	}

	err :=
		handler.Service.DeleteComment(
			userID,
			c.Param("id"),
		)

	if err != nil {
		respond(c, nil, err, http.StatusOK)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id": c.Param("id"),
		},
	})
}

func respond(c *gin.Context, data any, err error, status int) {
	if err != nil {
		if errors.Is(err, ErrCommentNotFound) {
			errorJSON(c, http.StatusNotFound, err.Error())
			return
		}

		if errors.Is(err, ErrForbidden) {
			errorJSON(c, http.StatusForbidden, err.Error())
			return
		}

		if errors.Is(err, ErrReplyDepthLimit) {
			errorJSON(c, http.StatusBadRequest, err.Error())
			return
		}

		errorJSON(c, http.StatusBadRequest, err.Error())
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
