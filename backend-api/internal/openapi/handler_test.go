package openapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRegisterServesOpenAPIDocument(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	Register(router)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	var document map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &document); err != nil {
		t.Fatalf("invalid OpenAPI JSON: %v", err)
	}

	if document["openapi"] != "3.0.3" {
		t.Fatalf("unexpected OpenAPI version: %v", document["openapi"])
	}

	paths, ok := document["paths"].(map[string]any)
	if !ok {
		t.Fatal("OpenAPI paths are missing")
	}

	for _, path := range []string{
		"/api/v1/cards",
		"/api/v1/comments",
		"/api/v1/maps/{slug}",
		"/api/v1/ancient-equips/{slug}",
	} {
		if _, exists := paths[path]; !exists {
			t.Fatalf("documented path is missing: %s", path)
		}
	}
}

func TestRegisterServesSwaggerUI(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	Register(router)

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/swagger/", nil)
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", recorder.Code)
	}

	if recorder.Body.Len() == 0 {
		t.Fatal("Swagger UI body is empty")
	}
}
