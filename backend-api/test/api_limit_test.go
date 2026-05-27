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

type apiResponse struct {
	Success bool            `json:"success"`
	Type    string          `json:"type"`
	Data    json.RawMessage `json:"data"`
	Meta    json.RawMessage `json:"meta"`
}

type metaResponse struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

func setupTestRouter(t *testing.T) (*gin.Engine, *sql.DB) {
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

func requestJSON(
	t *testing.T,
	router http.Handler,
	method string,
	path string,
) (
	int,
	apiResponse,
) {
	t.Helper()

	req :=
		httptest.NewRequest(
			method,
			path,
			nil,
		)

	rec :=
		httptest.NewRecorder()

	router.ServeHTTP(
		rec,
		req,
	)

	var response apiResponse

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

func dataLength(
	t *testing.T,
	response apiResponse,
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

func parseMeta(
	t *testing.T,
	response apiResponse,
) metaResponse {
	t.Helper()

	var meta metaResponse

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

func assertSearchLimit(
	t *testing.T,
	router http.Handler,
	path string,
	minQueryLength int,
) {
	t.Helper()

	query :=
		strings.Repeat("a", minQueryLength)

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default limit is capped at 24",
			path:          path + "?query=" + query,
			expectedLimit: 24,
		},
		{
			name:          "large limit is capped at 24",
			path:          path + "?query=" + query + "&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "valid custom limit is respected",
			path:          path + "?query=" + query + "&page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "invalid page and limit fallback safely",
			path:          path + "?query=" + query + "&page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(path+" "+tt.name, func(t *testing.T) {
			status, response :=
				requestJSON(
					t,
					router,
					http.MethodGet,
					tt.path,
				)

			if status != http.StatusOK {
				t.Fatalf("expected status 200, got %d for %s", status, tt.path)
			}

			if !response.Success {
				t.Fatalf("expected success true for %s", tt.path)
			}

			meta :=
				parseMeta(
					t,
					response,
				)

			if meta.Limit != tt.expectedLimit {
				t.Fatalf("expected meta.limit %d, got %d", tt.expectedLimit, meta.Limit)
			}

			if meta.Page < 1 {
				t.Fatalf("expected page >= 1, got %d", meta.Page)
			}

			count :=
				dataLength(
					t,
					response,
				)

			if count > 24 {
				t.Fatalf("search returned %d rows, expected <= 24", count)
			}

			if count > meta.Limit {
				t.Fatalf("search returned %d rows, expected <= meta.limit %d", count, meta.Limit)
			}
		})
	}
}

func TestSearchEndpointsArePaginatedAndCapped(t *testing.T) {
	router, db :=
		setupTestRouter(t)

	defer db.Close()

	assertSearchLimit(
		t,
		router,
		"/api/v1/pets/search",
		4,
	)

	assertSearchLimit(
		t,
		router,
		"/api/v1/mounts/search",
		4,
	)

	assertSearchLimit(
		t,
		router,
		"/api/v1/buffs/search",
		3,
	)
}

func TestListEndpointsAreCappedAt24(t *testing.T) {
	router, db :=
		setupTestRouter(t)

	defer db.Close()

	endpoints := []string{
		"/api/v1/pets?page=1&limit=999",
		"/api/v1/mounts?page=1&limit=999",
		"/api/v1/buffs?page=1&limit=999",
		"/api/v1/skills?page=1&limit=999",
	}

	for _, endpoint := range endpoints {
		t.Run(endpoint, func(t *testing.T) {
			status, response :=
				requestJSON(
					t,
					router,
					http.MethodGet,
					endpoint,
				)

			if status != http.StatusOK {
				t.Fatalf("expected status 200, got %d for %s", status, endpoint)
			}

			if !response.Success {
				t.Fatalf("expected success true for %s", endpoint)
			}

			count :=
				dataLength(
					t,
					response,
				)

			if count > 24 {
				t.Fatalf("%s returned %d rows, expected <= 24", endpoint, count)
			}
		})
	}
}

func TestDetailEndpointsReturnData(t *testing.T) {
	router, db :=
		setupTestRouter(t)

	defer db.Close()

	tests := []struct {
		name  string
		query string
		path  func(string) string
	}{
		{
			name: "pet egg detail",
			query: `
				SELECT id
				FROM pet_eggs
				LIMIT 1
			`,
			path: func(id string) string {
				return "/api/v1/pet-eggs/" + id
			},
		},
		{
			name: "thing detail",
			query: `
				SELECT id
				FROM things
				WHERE type IN ('pet_egg', 'mount')
				LIMIT 1
			`,
			path: func(id string) string {
				return "/api/v1/things/" + id
			},
		},
		{
			name: "mount detail",
			query: `
				SELECT id
				FROM mounts
				LIMIT 1
			`,
			path: func(id string) string {
				return "/api/v1/mounts/" + id
			},
		},
		{
			name: "buff detail",
			query: `
				SELECT detail_url
				FROM buffs
				WHERE detail_url IS NOT NULL
				AND detail_url != ''
				LIMIT 1
			`,
			path: func(detailURL string) string {
				slug :=
					strings.TrimPrefix(
						detailURL,
						"/buffs/",
					)

				return "/api/v1/buffs/" + slug
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var value string

			err :=
				db.QueryRow(tt.query).Scan(&value)

			if err == sql.ErrNoRows {
				t.Skip("no sample data found")
			}

			if err != nil {
				t.Fatal(err)
			}

			endpoint :=
				tt.path(value)

			status, response :=
				requestJSON(
					t,
					router,
					http.MethodGet,
					endpoint,
				)

			if status != http.StatusOK {
				t.Fatalf("expected status 200, got %d for %s", status, endpoint)
			}

			if !response.Success {
				t.Fatalf("expected success true for %s", endpoint)
			}

			if len(response.Data) == 0 || string(response.Data) == "null" {
				t.Fatalf("expected detail data for %s", endpoint)
			}
		})
	}
}
