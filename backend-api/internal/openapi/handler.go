package openapi

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const swaggerHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ROM Handbook Archive API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html {
  box-sizing: border-box;
  overflow-y: scroll;
  color-scheme: light;
}

*, *::before, *::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  background: #fafafa;
}

.swagger-ui {
  color-scheme: light;
}

.swagger-ui .topbar {
  background: #18181b;
}

.swagger-ui .topbar .download-url-wrapper {
  display: none;
}
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: "../openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        displayRequestDuration: true,
        filter: true,

        tryItOutEnabled: false,
        supportedSubmitMethods: []
      });
    };
  </script>
</body>
</html>`

// Register exposes the OpenAPI document and its Swagger UI without adding a
// runtime dependency on a Swagger generator package.
func Register(router *gin.Engine) {
	router.GET("/openapi.json", func(c *gin.Context) {
		c.Header("Cache-Control", "no-store")
		c.JSON(http.StatusOK, Document())
	})

	swaggerHandler := func(c *gin.Context) {
		c.Data(
			http.StatusOK,
			"text/html; charset=utf-8",
			[]byte(swaggerHTML),
		)
	}

	router.GET("/swagger", swaggerHandler)
	router.GET("/swagger/", swaggerHandler)
	router.GET("/docs", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/swagger/")
	})
}
