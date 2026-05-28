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

type equipmentAPIResponse struct {
	Success bool            `json:"success"`
	Type    string          `json:"type"`
	Data    json.RawMessage `json:"data"`
	Meta    json.RawMessage `json:"meta"`
}

type equipmentMetaResponse struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

func setupEquipmentTestRouter(t *testing.T) (*gin.Engine, *sql.DB) {
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

func requestEquipmentJSON(
	t *testing.T,
	router http.Handler,
	path string,
) (
	int,
	equipmentAPIResponse,
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

	var response equipmentAPIResponse

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

func equipmentDataLength(
	t *testing.T,
	response equipmentAPIResponse,
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

func parseEquipmentMeta(
	t *testing.T,
	response equipmentAPIResponse,
) equipmentMetaResponse {
	t.Helper()

	var meta equipmentMetaResponse

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

func findAnyEquipmentID(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT id
			FROM equipments
			WHERE name IS NOT NULL
			AND name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment data available: %v", err)
	}

	return id
}

func findEquipmentIDWithFormula(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT e.id
			FROM equipments e
			INNER JOIN equipment_formulas f
				ON f.equipment_id = e.id
			WHERE e.name IS NOT NULL
			AND e.name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment formula data available: %v", err)
	}

	return id
}

func findEquipmentIDWithRelations(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT e.id
			FROM equipments e
			INNER JOIN equipment_relations r
				ON r.equipment_id = e.id
			WHERE e.name IS NOT NULL
			AND e.name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment relation data available: %v", err)
	}

	return id
}

func findEquipmentIDWithTiers(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT e.id
			FROM equipments e
			INNER JOIN equipment_tiers t
				ON t.equipment_id = e.id
			WHERE e.name IS NOT NULL
			AND e.name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment tier data available: %v", err)
	}

	return id
}

func findEquipmentIDWithEquipEffects(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var id string

	err :=
		db.QueryRow(`
			SELECT e.id
			FROM equipments e
			INNER JOIN equipment_equip_effects ef
				ON ef.equipment_id = e.id
			WHERE e.name IS NOT NULL
			AND e.name != ''
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment equip effect data available: %v", err)
	}

	return id
}

func findEquipmentSearchQuery(
	t *testing.T,
	db *sql.DB,
) string {
	t.Helper()

	var name string

	err :=
		db.QueryRow(`
			SELECT name
			FROM equipments
			WHERE name IS NOT NULL
			AND LENGTH(name) >= 4
			LIMIT 1
		`).Scan(&name)

	if err != nil {
		t.Skipf("no searchable equipment data available: %v", err)
	}

	name =
		strings.TrimSpace(name)

	if len(name) < 4 {
		t.Skip("equipment search seed is too short")
	}

	return name[:4]
}

func TestEquipmentsListUsesPaginationFiltersAndLimitCap(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	tests := []struct {
		name          string
		path          string
		expectedLimit int
	}{
		{
			name:          "default limit",
			path:          "/api/v1/equipments?page=1",
			expectedLimit: 24,
		},
		{
			name:          "custom valid limit",
			path:          "/api/v1/equipments?page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large limit is capped",
			path:          "/api/v1/equipments?page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid page and limit fallback",
			path:          "/api/v1/equipments?page=-10&limit=-99",
			expectedLimit: 24,
		},
		{
			name:          "type filter with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&type=Weapon%20Dagger",
			expectedLimit: 24,
		},
		{
			name:          "quality filter with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&quality=Blue",
			expectedLimit: 24,
		},
		{
			name:          "stat filter with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&stat=Matk",
			expectedLimit: 24,
		},
		{
			name:          "unlock filter with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&unlock=Atk",
			expectedLimit: 24,
		},
		{
			name:          "deposit filter with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&depo=HP",
			expectedLimit: 24,
		},
		{
			name:          "sort desc with limit cap",
			path:          "/api/v1/equipments?page=1&limit=999&sort=Name%20desc",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestEquipmentJSON(
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
				parseEquipmentMeta(
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
				equipmentDataLength(
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

func TestEquipmentSearchUsesPaginationAndLimitCap(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	query :=
		findEquipmentSearchQuery(
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
			path:          "/api/v1/equipments/search?query=" + query,
			expectedLimit: 24,
		},
		{
			name:          "custom search limit",
			path:          "/api/v1/equipments/search?query=" + query + "&page=1&limit=5",
			expectedLimit: 5,
		},
		{
			name:          "large search limit is capped",
			path:          "/api/v1/equipments/search?query=" + query + "&page=1&limit=999",
			expectedLimit: 24,
		},
		{
			name:          "invalid search pagination fallback",
			path:          "/api/v1/equipments/search?query=" + query + "&page=-10&limit=-99",
			expectedLimit: 24,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, response :=
				requestEquipmentJSON(
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
				parseEquipmentMeta(
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
				equipmentDataLength(
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

func TestEquipmentSearchShortQueryReturnsEmptyData(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/search?query=abc&page=1&limit=24",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	count :=
		equipmentDataLength(
			t,
			response,
		)

	if count != 0 {
		t.Fatalf("expected short search query to return 0 rows, got %d", count)
	}
}

func TestEquipmentDetailEndpointIncludesNestedData(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	id :=
		findAnyEquipmentID(
			t,
			db,
		)

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/"+id,
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

	expectedKeys := []string{
		"formulas",
		"tiers",
		"synth_from",
		"synth_to",
		"craft_materials",
		"craftable",
		"dropped_by",
		"skills",
		"equip_effects",
	}

	for _, key := range expectedKeys {
		if _, ok := data[key]; !ok {
			t.Fatalf("expected detail response to include %s", key)
		}
	}
}

func TestEquipmentFormulasEndpoint(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	id :=
		findEquipmentIDWithFormula(
			t,
			db,
		)

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/"+id+"/formulas",
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	if !response.Success {
		t.Fatal("expected success true")
	}

	count :=
		equipmentDataLength(
			t,
			response,
		)

	if count == 0 {
		t.Fatal("expected at least one formula")
	}
}

func TestEquipmentDetailWithRelations(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	id :=
		findEquipmentIDWithRelations(
			t,
			db,
		)

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/"+id,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	var data map[string]json.RawMessage

	err :=
		json.Unmarshal(
			response.Data,
			&data,
		)

	if err != nil {
		t.Fatalf("invalid detail data: %v", err)
	}

	hasAnyRelation := false

	for _, key := range []string{
		"synth_from",
		"synth_to",
		"craft_materials",
		"craftable",
		"dropped_by",
		"skills",
	} {
		var rows []map[string]any

		err :=
			json.Unmarshal(
				data[key],
				&rows,
			)

		if err != nil {
			t.Fatalf("%s is not an array: %v", key, err)
		}

		if len(rows) > 0 {
			hasAnyRelation = true
		}
	}

	if !hasAnyRelation {
		t.Fatal("expected at least one relation array to have data")
	}
}

func TestEquipmentDetailWithTiers(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	id :=
		findEquipmentIDWithTiers(
			t,
			db,
		)

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/"+id,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	var data map[string]json.RawMessage

	err :=
		json.Unmarshal(
			response.Data,
			&data,
		)

	if err != nil {
		t.Fatalf("invalid detail data: %v", err)
	}

	var tiers []map[string]any

	err =
		json.Unmarshal(
			data["tiers"],
			&tiers,
		)

	if err != nil {
		t.Fatalf("tiers is not an array: %v", err)
	}

	if len(tiers) == 0 {
		t.Fatal("expected at least one tier")
	}
}

func TestEquipmentDetailWithEquipEffects(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	id :=
		findEquipmentIDWithEquipEffects(
			t,
			db,
		)

	status, response :=
		requestEquipmentJSON(
			t,
			router,
			"/api/v1/equipments/"+id,
		)

	if status != http.StatusOK {
		t.Fatalf("expected status 200, got %d", status)
	}

	var data map[string]json.RawMessage

	err :=
		json.Unmarshal(
			response.Data,
			&data,
		)

	if err != nil {
		t.Fatalf("invalid detail data: %v", err)
	}

	var effects []map[string]any

	err =
		json.Unmarshal(
			data["equip_effects"],
			&effects,
		)

	if err != nil {
		t.Fatalf("equip_effects is not an array: %v", err)
	}

	if len(effects) == 0 {
		t.Fatal("expected at least one equip effect")
	}

	if _, ok := effects[0]["items"]; !ok {
		t.Fatal("expected equip effect to include items")
	}
}

func TestThingEndpointSupportsEquipment(t *testing.T) {
	router, db :=
		setupEquipmentTestRouter(t)

	defer db.Close()

	var id string

	err :=
		db.QueryRow(`
			SELECT t.id
			FROM things t
			INNER JOIN equipments e
				ON e.id = t.id
			WHERE t.type = 'equipment'
			LIMIT 1
		`).Scan(&id)

	if err != nil {
		t.Skipf("no equipment thing data available: %v", err)
	}

	status, response :=
		requestEquipmentJSON(
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

	if response.Type != "equipment" {
		t.Fatalf("expected type equipment, got %s", response.Type)
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
