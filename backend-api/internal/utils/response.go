package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Success(

	c *gin.Context,

	status int,

	data interface{},

	meta interface{},

) {

	c.JSON(

		status,

		gin.H{

			"success": true,
			"data":    data,
			"meta":    meta,
		},
	)
}

func Error(

	c *gin.Context,

	status int,

	message string,

) {

	c.JSON(

		status,

		gin.H{

			"success": false,
			"message": message,
		},
	)
}

func InternalServerError(
	c *gin.Context,
) {

	Error(

		c,

		http.StatusInternalServerError,

		"Internal server error",
	)
}
