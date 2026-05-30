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

type headwearAPIResponse struct {
	Success bool            `json:"success"`
	Type    string          `json:"type"`
	Data    json.RawMessage `json:"data"`
	Meta    json.RawMessage `json:"meta"`
}

type headwearMetaResponse struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

func setupHeadwearTestRouter(t *testing.T) (*gin.Engine, *sql.DB) {
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

	appDBPath :=
		filepath.Join(
			backendRoot,
			"storage",
			"app.db",
		)

	dbapp, err :=
		sql.Open(
			"sqlite",
			appDBPath,
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
		dbapp,
		nil,
	)

	return router, db
}

func requestHeadwearJSON(
	t *testing.T,
	router http.Handler,
	path string,
) (
	int,
	headwearAPIResponse,
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

	var response headwearAPIResponse

	if rec.Body.Len() > 0 {
		err :=
			json.Unmarshal(
				rec.Body.Bytes(),
				&response,
			)

		if err != nil {
			t.Fatalf(
				"invalid json for %s: %v\nbody: %s",
				path,
				err,
				rec.Body.String(),
			)
		}
	}

	return rec.Code, response
}

func headwearDataLength(
	t *testing.T,
	response headwearAPIResponse,
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

func parseHeadwearMeta(
	t *testing.T,
	response headwearAPIResponse,
) headwearMetaResponse {
	t.Helper()

	var meta headwearMetaResponse

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

func findAnyHeadwearID(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT id
			FROM headwears
			WHERE name IS NOT NULL
			AND name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no headwear data available: %v", err)
	}

	return id
}

func findHeadwearIDWithFormula(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT h.id
			FROM headwears h
			INNER JOIN headwear_formulas f
				ON f.headwear_id = h.id
			WHERE h.name IS NOT NULL
			AND h.name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no headwear formula data available: %v", err)
	}

	return id
}

func findHeadwearSearchQuery(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var name string

	err :=
		db.QueryRow(`
			SELECT name
			FROM headwears
			WHERE name IS NOT NULL
			AND LENGTH(name) >= 4
			LIMIT 1
		`).Scan(&name)

	if err != nil {
		t.Skipf("no searchable headwear data available: %v", err)
	}

	name =
		strings.TrimSpace(name)

	if len(name) < 4 {
		t.Skip("headwear search seed is too short")
	}

	return name[:4]
}

func TestHeadwearsListUsesPaginationFiltersAndLimitCap(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default limit",
			path:          "/api/v1/headwears?page=1",
			expectedLimit: 24,
		},
		{
			name:          "custom valid limit",
			path:          "/api/v1/headwears?page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large limit is capped",
			path:          "/api/v1/headwears?page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid page and limit fallback",
			path:          "/api/v1/headwears?page=-10&limit=-99",
			expectedLimit: 24,
		},
		{
			name:          "position filter with limit cap",
			path:          "/api/v1/headwears?page=1&limit=999&position=Face",
			expectedLimit: 24,
		},
		{
			name:          "stat filter with limit cap",
			path:          "/api/v1/headwears?page=1&limit=999&stat=Atk",
			expectedLimit: 24,
		},
		{
			name:          "unlock filter with limit cap",
			path:          "/api/v1/headwears?page=1&limit=999&unlock=Atk",
			expectedLimit: 24,
		},
		{
			name:          "deposit filter with limit cap",
			path:          "/api/v1/headwears?page=1&limit=999&depo=HP",
			expectedLimit: 24,
		},
		{
			name:          "sort desc with limit cap",
			path:          "/api/v1/headwears?page=1&limit=999&sort=Name%20desc",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestHeadwearJSON(
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
				parseHeadwearMeta(
					t,
					response,
				)

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"expected meta.limit %d, got %d for %s",
					tt.expectedLimit,
					meta.Limit,
					tt.path,
				)
			}

			count :=
				headwearDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"%s returned %d rows, expected <= %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}
		})
	}
}

func TestHeadwearSearchUsesPaginationAndLimitCap(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	query :=
		findHeadwearSearchQuery(
			t,
			db,
		)

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default search limit",
			path:          "/api/v1/headwears/search?query=" + query,
			expectedLimit: 24,
		},
		{
			name:          "custom search limit",
			path:          "/api/v1/headwears/search?query=" + query + "&page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large search limit is capped",
			path:          "/api/v1/headwears/search?query=" + query + "&page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid search pagination fallback",
			path:          "/api/v1/headwears/search?query=" + query + "&page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestHeadwearJSON(
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
				parseHeadwearMeta(
					t,
					response,
				)

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"expected meta.limit %d, got %d for %s",
					tt.expectedLimit,
					meta.Limit,
					tt.path,
				)
			}

			count :=
				headwearDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"%s returned %d rows, expected <= %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}
		})
	}
}

func TestHeadwearSearchShortQueryReturnsEmptyData(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	status, response :=
		requestHeadwearJSON(
			t,
			router,
			"/api/v1/headwears/search?query=abc&page=1&limit=24",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	count :=
		headwearDataLength(
			t,
			response,
		)

	if count != 0 {
		t.Fatalf("expected short search query to return 0 rows, got %d", count)
	}
}

func TestHeadwearDetailEndpoint(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	id :=
		findAnyHeadwearID(
			t,
			db,
		)

	status, response :=
		requestHeadwearJSON(
			t,
			router,
			"/api/v1/headwears/"+id,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	var data map[string]any

	err :=
		json.Unmarshal(
			response.Data,
			&data,
		)

	if err != nil {
		t.Fatalf("invalid detail data: %v", err)
	}

	if data["id"] != id {
		t.Fatalf("expected id %s, got %v", id, data["id"])
	}

	if _, ok := data["formulas"]; !ok {
		t.Fatal("expected detail response to include formulas")
	}
}

func TestHeadwearFormulasEndpoint(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	id :=
		findHeadwearIDWithFormula(
			t,
			db,
		)

	status, response :=
		requestHeadwearJSON(
			t,
			router,
			"/api/v1/headwears/"+id+"/formulas",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	count :=
		headwearDataLength(
			t,
			response,
		)

	if count == 0 {
		t.Fatal("expected at least one formula")
	}
}

func TestThingEndpointSupportsHeadwear(t *testing.T) {
	router, db :=
		setupHeadwearTestRouter(t)

	defer db.Close()

	var id string

	err :=
		db.QueryRow(`
			SELECT t.id
			FROM things t
			INNER JOIN headwears h
				ON h.id = t.id
			WHERE t.type = 'headwear'
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no headwear thing data available: %v", err)
	}

	status, response :=
		requestHeadwearJSON(
			t,
			router,
			"/api/v1/things/"+id,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	if response.Type != "headwear" {
		t.Fatalf("expected type headwear, got %s", response.Type)
	}

	var data map[string]any

	err =
		json.Unmarshal(
			response.Data,
			&data,
		)

	if err != nil {
		t.Fatalf("invalid thing data: %v", err)
	}

	if data["id"] != id {
		t.Fatalf("expected id %s, got %v", id, data["id"])
	}
}
