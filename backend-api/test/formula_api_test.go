package test

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"backend-api/internal/routes"

	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"
)

type formulaAPIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data"`
	Meta    json.RawMessage `json:"meta"`
}

type formulaMetaResponse struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

func setupFormulaTestRouter(t *testing.T) (*gin.Engine, *sql.DB) {
	t.Helper()

	_, file, _, ok :=
		runtime.Caller(0)

	if !ok {
		t.Fatal("failed to resolve test path")
	}

	backendRoot :=
		filepath.Dir(
			filepath.Dir(file),
		)

	dbPath :=
		filepath.Join(
			backendRoot,
			"storage",
			"rom.db",
		)

	db, err :=
		sql.Open(
			"sqlite",
			dbPath,
		)

	if err != nil {
		t.Fatal(err)
	}

	if err := db.Ping(); err != nil {
		t.Fatalf("failed to open test database %s: %v", dbPath, err)
	}

	gin.SetMode(gin.TestMode)

	router :=
		gin.New()

	routes.SetupRoutes(
		router,
		db,
	)

	return router, db
}

func requestFormulaJSON(
	t *testing.T,
	router http.Handler,
	path string,
) (
	int,
	formulaAPIResponse,
) {
	t.Helper()

	req :=
		httptest.NewRequest(
			http.MethodGet,
			path,
			nil,
		)

	rec :=
		httptest.NewRecorder()

	router.ServeHTTP(
		rec,
		req,
	)

	var response formulaAPIResponse

	if rec.Body.Len() > 0 {
		err :=
			json.Unmarshal(
				rec.Body.Bytes(),
				&response,
			)

		if err != nil {
			t.Fatalf("invalid json for %s: %v\nbody: %s", path, err, rec.Body.String())
		}
	}

	return rec.Code, response
}

func formulaDataLength(
	t *testing.T,
	response formulaAPIResponse,
) int {
	t.Helper()

	var rows []map[string]any

	err :=
		json.Unmarshal(
			response.Data,
			&rows,
		)

	if err != nil {
		t.Fatalf("data is not an array: %v", err)
	}

	return len(rows)
}

func parseFormulaMeta(
	t *testing.T,
	response formulaAPIResponse,
) formulaMetaResponse {
	t.Helper()

	var meta formulaMetaResponse

	err :=
		json.Unmarshal(
			response.Meta,
			&meta,
		)

	if err != nil {
		t.Fatalf("meta is invalid: %v", err)
	}

	return meta
}

func TestFormulaListUsesPaginationAndLimitCap(t *testing.T) {
	router, db :=
		setupFormulaTestRouter(t)

	defer db.Close()

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default limit",
			path:          "/api/v1/formulas?page=1",
			expectedLimit: 20,
		},
		{
			name:          "custom valid limit",
			path:          "/api/v1/formulas?page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large limit is capped",
			path:          "/api/v1/formulas?page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid page and limit fallback",
			path:          "/api/v1/formulas?page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestFormulaJSON(
					t,
					router,
					tt.path,
				)

			if status != http.StatusOK {
				t.Fatalf("expected status 200, got %d for %s", status, tt.path)
			}

			if !response.Success {
				t.Fatalf("expected success true for %s", tt.path)
			}

			meta :=
				parseFormulaMeta(
					t,
					response,
				)

			if meta.Page < 1 {
				t.Fatalf("expected meta.page >= 1, got %d", meta.Page)
			}

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"formula list limit mismatch\nendpoint: %s\nexpected meta.limit: %d\ngot meta.limit: %d",
					tt.path,
					tt.expectedLimit,
					meta.Limit,
				)
			}

			count :=
				formulaDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"formula list returned too many rows\nendpoint: %s\nreturned rows: %d\nexpected max rows: %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}

			if count > 24 {
				t.Fatalf(
					"formula list exceeded hard safety cap\nendpoint: %s\nreturned rows: %d\nexpected max rows: 24",
					tt.path,
					count,
				)
			}
		})
	}
}

func TestFormulaSearchUsesPaginationAndLimitCap(t *testing.T) {
	router, db :=
		setupFormulaTestRouter(t)

	defer db.Close()

	query :=
		"atk"

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default search limit",
			path:          "/api/v1/formulas/search?query=" + query,
			expectedLimit: 20,
		},
		{
			name:          "custom valid search limit",
			path:          "/api/v1/formulas/search?query=" + query + "&page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large search limit is capped",
			path:          "/api/v1/formulas/search?query=" + query + "&page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid search page and limit fallback",
			path:          "/api/v1/formulas/search?query=" + query + "&page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestFormulaJSON(
					t,
					router,
					tt.path,
				)

			if status != http.StatusOK {
				t.Fatalf("expected status 200, got %d for %s", status, tt.path)
			}

			if !response.Success {
				t.Fatalf("expected success true for %s", tt.path)
			}

			meta :=
				parseFormulaMeta(
					t,
					response,
				)

			if meta.Page < 1 {
				t.Fatalf("expected meta.page >= 1, got %d", meta.Page)
			}

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"formula search limit mismatch\nendpoint: %s\nexpected meta.limit: %d\ngot meta.limit: %d",
					tt.path,
					tt.expectedLimit,
					meta.Limit,
				)
			}

			count :=
				formulaDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"formula search returned too many rows\nendpoint: %s\nreturned rows: %d\nexpected max rows: %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}

			if count > 24 {
				t.Fatalf(
					"formula search exceeded hard safety cap\nendpoint: %s\nreturned rows: %d\nexpected max rows: 24",
					tt.path,
					count,
				)
			}
		})
	}
}

func TestFormulaSearchShortQueryReturnsEmptyResult(t *testing.T) {
	router, db :=
		setupFormulaTestRouter(t)

	defer db.Close()

	status, response :=
		requestFormulaJSON(
			t,
			router,
			"/api/v1/formulas/search?query=at&page=1&limit=24",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	count :=
		formulaDataLength(
			t,
			response,
		)

	if count != 0 {
		t.Fatalf("expected short search query to return 0 rows, got %d", count)
	}
}

func TestFeaturedFormulaEndpointReturnsObject(t *testing.T) {
	router, db :=
		setupFormulaTestRouter(t)

	defer db.Close()

	status, response :=
		requestFormulaJSON(
			t,
			router,
			"/api/v1/formulas/featured",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	var formula map[string]any

	err :=
		json.Unmarshal(
			response.Data,
			&formula,
		)

	if err != nil {
		t.Fatalf("expected featured formula object: %v", err)
	}

	if formula["id"] == nil {
		t.Fatal("expected featured formula to include id")
	}

	if formula["name"] == nil {
		t.Fatal("expected featured formula to include name")
	}

	if formula["formula_code"] == nil {
		t.Fatal("expected featured formula to include formula_code")
	}
}

func TestFormulaDetailEndpointReturnsObject(t *testing.T) {
	router, db :=
		setupFormulaTestRouter(t)

	defer db.Close()

	var detailURL string

	err :=
		db.QueryRow(`

			SELECT
				detail_url

			FROM formulas_code

			WHERE
				detail_url IS NOT NULL
				AND detail_url != ''

			LIMIT 1

		`).Scan(&detailURL)

	if err == sql.ErrNoRows {
		t.Skip("no formula detail URL found")
	}

	if err != nil {
		t.Fatal(err)
	}

	slug :=
		strings.TrimPrefix(
			detailURL,
			"/formulas/",
		)

	status, response :=
		requestFormulaJSON(
			t,
			router,
			"/api/v1/formulas/"+slug,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	var formula map[string]any

	err =
		json.Unmarshal(
			response.Data,
			&formula,
		)

	if err != nil {
		t.Fatalf("expected formula detail object: %v", err)
	}

	if formula["id"] == nil {
		t.Fatal("expected formula detail to include id")
	}

	if formula["detail_url"] == nil {
		t.Fatal("expected formula detail to include detail_url")
	}

	if formula["formula_code"] == nil {
		t.Fatal("expected formula detail to include formula_code")
	}
}
