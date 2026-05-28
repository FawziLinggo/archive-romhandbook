package test

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"runtime"
	"testing"

	"backend-api/internal/routes"

	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"
)

type cardAPIResponse struct {
	Success bool            `json:"success"`
	Type    string          `json:"type"`
	Data    json.RawMessage `json:"data"`
	Meta    json.RawMessage `json:"meta"`
}

type cardMetaResponse struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

func setupCardTestRouter(t *testing.T) (*gin.Engine, *sql.DB) {
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

func requestCardJSON(
	t *testing.T,
	router http.Handler,
	path string,
) (
	int,
	cardAPIResponse,
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

	var response cardAPIResponse

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

func cardDataLength(
	t *testing.T,
	response cardAPIResponse,
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

func parseCardMeta(
	t *testing.T,
	response cardAPIResponse,
) cardMetaResponse {
	t.Helper()

	var meta cardMetaResponse

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

func TestCardsListUsesPaginationFiltersAndLimitCap(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default limit",
			path:          "/api/v1/cards?page=1",
			expectedLimit: 24,
		},
		{
			name:          "custom valid limit",
			path:          "/api/v1/cards?page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large limit is capped",
			path:          "/api/v1/cards?page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid page and limit fallback",
			path:          "/api/v1/cards?page=-10&limit=-99",
			expectedLimit: 24,
		},
		{
			name:          "search filter with limit cap",
			path:          "/api/v1/cards?page=1&limit=999&query=card",
			expectedLimit: 24,
		},
		{
			name:          "type and quality filter with limit cap",
			path:          "/api/v1/cards?page=1&limit=999&type=Deposit&quality=Blue",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestCardJSON(
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
				parseCardMeta(
					t,
					response,
				)

			if meta.Page < 1 {
				t.Fatalf("expected meta.page >= 1, got %d", meta.Page)
			}

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"card list limit mismatch\nendpoint: %s\nexpected meta.limit: %d\ngot meta.limit: %d",
					tt.path,
					tt.expectedLimit,
					meta.Limit,
				)
			}

			count :=
				cardDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"card list returned too many rows\nendpoint: %s\nreturned rows: %d\nexpected max rows: %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}

			if count > 24 {
				t.Fatalf(
					"card list exceeded hard safety cap\nendpoint: %s\nreturned rows: %d\nexpected max rows: 24",
					tt.path,
					count,
				)
			}
		})
	}
}

func TestCardsSearchUsesPaginationAndLimitCap(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	query :=
		"card"

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default search limit",
			path:          "/api/v1/cards/search?query=" + query,
			expectedLimit: 24,
		},
		{
			name:          "custom valid search limit",
			path:          "/api/v1/cards/search?query=" + query + "&page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large search limit is capped",
			path:          "/api/v1/cards/search?query=" + query + "&page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid search page and limit fallback",
			path:          "/api/v1/cards/search?query=" + query + "&page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestCardJSON(
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
				parseCardMeta(
					t,
					response,
				)

			if meta.Page < 1 {
				t.Fatalf("expected meta.page >= 1, got %d", meta.Page)
			}

			if meta.Limit != tt.expectedLimit {
				t.Fatalf(
					"card search limit mismatch\nendpoint: %s\nexpected meta.limit: %d\ngot meta.limit: %d",
					tt.path,
					tt.expectedLimit,
					meta.Limit,
				)
			}

			count :=
				cardDataLength(
					t,
					response,
				)

			if count > tt.expectedLimit {
				t.Fatalf(
					"card search returned too many rows\nendpoint: %s\nreturned rows: %d\nexpected max rows: %d",
					tt.path,
					count,
					tt.expectedLimit,
				)
			}

			if count > 24 {
				t.Fatalf(
					"card search exceeded hard safety cap\nendpoint: %s\nreturned rows: %d\nexpected max rows: 24",
					tt.path,
					count,
				)
			}
		})
	}
}

func TestCardsSearchShortQueryReturnsEmptyResult(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	status, response :=
		requestCardJSON(
			t,
			router,
			"/api/v1/cards/search?query=ca&page=1&limit=24",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	count :=
		cardDataLength(
			t,
			response,
		)

	if count != 0 {
		t.Fatalf("expected short search query to return 0 rows, got %d", count)
	}
}

func TestCardDetailEndpointReturnsRelations(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	var cardID string

	err :=
		db.QueryRow(`

			SELECT
				id

			FROM cards

			LIMIT 1

		`).Scan(&cardID)

	if err == sql.ErrNoRows {
		t.Skip("no card data found")
	}

	if err != nil {
		t.Fatal(err)
	}

	status, response :=
		requestCardJSON(
			t,
			router,
			"/api/v1/cards/"+cardID,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	var card map[string]any

	err =
		json.Unmarshal(
			response.Data,
			&card,
		)

	if err != nil {
		t.Fatalf("expected card detail object: %v", err)
	}

	requiredFields := []string{
		"id",
		"name",
		"detail_url",
		"effect_texts",
		"formulas",
		"deposit_texts",
		"unlock_texts",
		"craft_materials",
		"skills",
		"dropped_by",
		"craftable",
	}

	for _, field := range requiredFields {
		if _, ok := card[field]; !ok {
			t.Fatalf("expected card detail to include field %q", field)
		}
	}
}

func TestCardFormulasEndpointReturnsArray(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	var cardID string

	err :=
		db.QueryRow(`

			SELECT
				card_id

			FROM card_formulas

			LIMIT 1

		`).Scan(&cardID)

	if err == sql.ErrNoRows {
		t.Skip("no card formula data found")
	}

	if err != nil {
		t.Fatal(err)
	}

	status, response :=
		requestCardJSON(
			t,
			router,
			"/api/v1/cards/"+cardID+"/formulas",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	count :=
		cardDataLength(
			t,
			response,
		)

	if count == 0 {
		t.Fatal("expected at least one card formula")
	}
}

func TestThingEndpointSupportsCard(t *testing.T) {
	router, db :=
		setupCardTestRouter(t)

	defer db.Close()

	var cardID string

	err :=
		db.QueryRow(`

			SELECT
				id

			FROM things

			WHERE type = 'card'

			LIMIT 1

		`).Scan(&cardID)

	if err == sql.ErrNoRows {
		t.Skip("no card thing data found")
	}

	if err != nil {
		t.Fatal(err)
	}

	status, response :=
		requestCardJSON(
			t,
			router,
			"/api/v1/things/"+cardID,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	if response.Type != "card" {
		t.Fatalf("expected thing type card, got %q", response.Type)
	}

	var card map[string]any

	err =
		json.Unmarshal(
			response.Data,
			&card,
		)

	if err != nil {
		t.Fatalf("expected card data object: %v", err)
	}

	if card["id"] == nil {
		t.Fatal("expected card thing data to include id")
	}
}
