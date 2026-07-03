package openapi

import "strings"

type parameter struct {
	Name        string
	In          string
	Description string
	Required    bool
	Schema      map[string]any
}

type route struct {
	Method      string
	Path        string
	Tag         string
	Summary     string
	OperationID string
	Auth        bool
	Admin       bool
	Parameters  []parameter
	RequestRef  string
	SuccessCode string
}

func Document() map[string]any {
	paths := map[string]any{}

	for _, item := range routes() {
		pathItem, _ := paths[item.Path].(map[string]any)
		if pathItem == nil {
			pathItem = map[string]any{}
			paths[item.Path] = pathItem
		}

		pathItem[strings.ToLower(item.Method)] = operation(item)
	}

	return map[string]any{
		"openapi": "3.0.3",
		"info": map[string]any{
			"title":       "ROM Handbook Archive API",
			"version":     "1.0.0",
			"description": "Archive and community API for preserved ROM Handbook data. Authenticated endpoints use the rom_session HTTP-only cookie created by Discord OAuth.",
			"license": map[string]any{
				"name": "Archive and educational use",
			},
		},
		"servers": []any{
			map[string]any{"url": "/", "description": "Current server"},
		},
		"tags":  tags(),
		"paths": paths,
		"components": map[string]any{
			"securitySchemes": map[string]any{
				"cookieAuth": map[string]any{
					"type":        "apiKey",
					"in":          "cookie",
					"name":        "rom_session",
					"description": "Session cookie issued after Discord OAuth login.",
				},
			},
			"schemas": schemas(),
		},
	}
}

func operation(item route) map[string]any {
	successCode := item.SuccessCode
	if successCode == "" {
		successCode = "200"
	}

	op := map[string]any{
		"tags":        []string{item.Tag},
		"summary":     item.Summary,
		"operationId": item.OperationID,
		"responses": map[string]any{
			successCode: response("Successful response", "SuccessResponse"),
			"400":       response("Invalid request", "ErrorResponse"),
			"429":       response("Rate limit exceeded", "ErrorResponse"),
			"500":       response("Internal server error", "ErrorResponse"),
		},
	}

	if item.Auth || item.Admin {
		op["security"] = []any{map[string]any{"cookieAuth": []string{}}}
		responses := op["responses"].(map[string]any)
		responses["401"] = response("Authentication required", "ErrorResponse")
	}

	if item.Admin {
		op["description"] = "Requires an authenticated user with the admin role."
		op["responses"].(map[string]any)["403"] = response("Admin access required", "ErrorResponse")
	}

	if len(item.Parameters) > 0 {
		params := make([]any, 0, len(item.Parameters))
		for _, p := range item.Parameters {
			params = append(params, map[string]any{
				"name":        p.Name,
				"in":          p.In,
				"description": p.Description,
				"required":    p.Required,
				"schema":      p.Schema,
			})
		}
		op["parameters"] = params
	}

	if item.RequestRef != "" {
		op["requestBody"] = map[string]any{
			"required": true,
			"content": map[string]any{
				"application/json": map[string]any{
					"schema": ref(item.RequestRef),
				},
			},
		}
	}

	return op
}

func response(description string, schema string) map[string]any {
	return map[string]any{
		"description": description,
		"content": map[string]any{
			"application/json": map[string]any{
				"schema": ref(schema),
			},
		},
	}
}

func ref(name string) map[string]any {
	return map[string]any{"$ref": "#/components/schemas/" + name}
}

func tags() []any {
	names := []string{
		"Authentication", "Profile", "Archive", "Search", "Things", "Skills",
		"Pets", "Pet Eggs", "Mounts", "Buffs", "Formulas", "Graph", "Cards",
		"Monsters", "Headwears", "Equipments", "Jobs", "Maps", "Ancient Equipment",
		"Comments", "Reports", "Feature Requests", "Admin", "Data Health",
	}

	result := make([]any, 0, len(names))
	for _, name := range names {
		result = append(result, map[string]any{"name": name})
	}
	return result
}

func routes() []route {
	page := queryInt("page", "Page number", 1, 1, 0)
	limit24 := queryInt("limit", "Rows per page", 24, 1, 24)
	limit48 := queryInt("limit", "Rows per page", 24, 1, 48)
	query := queryString("query", "Case-insensitive search text", false)

	return []route{
		{Method: "GET", Path: "/api/v1/auth/discord/login", Tag: "Authentication", Summary: "Start Discord OAuth login", OperationID: "discordLogin"},
		{Method: "GET", Path: "/api/v1/auth/discord/callback", Tag: "Authentication", Summary: "Complete Discord OAuth login", OperationID: "discordCallback", Parameters: []parameter{queryString("code", "Discord authorization code", true), queryString("state", "OAuth state value", true)}},
		{Method: "GET", Path: "/api/v1/auth/me", Tag: "Authentication", Summary: "Get the current session user", OperationID: "getCurrentUser", Auth: true},
		{Method: "POST", Path: "/api/v1/auth/logout", Tag: "Authentication", Summary: "Revoke the current session", OperationID: "logout", Auth: true},

		{Method: "GET", Path: "/api/v1/me/profile", Tag: "Profile", Summary: "Get the current user profile", OperationID: "getProfile", Auth: true},
		{Method: "PATCH", Path: "/api/v1/me/profile", Tag: "Profile", Summary: "Update the current user profile", OperationID: "updateProfile", Auth: true, RequestRef: "UpdateProfileRequest"},

		{Method: "GET", Path: "/api/v1/archive/counts", Tag: "Archive", Summary: "Get archive totals by type", OperationID: "getArchiveCounts"},
		{Method: "GET", Path: "/api/v1/search", Tag: "Search", Summary: "Search across the archive", OperationID: "globalSearch", Parameters: []parameter{query, queryInt("limit", "Maximum results", 30, 1, 100)}},
		{Method: "GET", Path: "/api/v1/things/random-snapshot-card", Tag: "Things", Summary: "Get a random archived snapshot card", OperationID: "getRandomSnapshotCard"},
		{Method: "GET", Path: "/api/v1/things/{id}", Tag: "Things", Summary: "Get a unified archive item", OperationID: "getThing", Parameters: []parameter{pathString("id", "Archive item ID")}},

		listRoute("Skills", "/api/v1/skills", "listSkills", page, limit24, query),
		detailRoute("Skills", "/api/v1/skills/{slug}", "getSkill", "slug"),
		listRoute("Pets", "/api/v1/pets", "listPets", page, limit24, query),
		searchRoute("Pets", "/api/v1/pets/search", "searchPets", page, limit24, query),
		detailRoute("Pets", "/api/v1/pets/{slug}", "getPet", "slug"),
		detailRoute("Pet Eggs", "/api/v1/pet-eggs/{id}", "getPetEgg", "id"),
		listRoute("Mounts", "/api/v1/mounts", "listMounts", page, limit24, query),
		searchRoute("Mounts", "/api/v1/mounts/search", "searchMounts", page, limit24, query),
		detailRoute("Mounts", "/api/v1/mounts/{id}", "getMount", "id"),
		listRoute("Buffs", "/api/v1/buffs", "listBuffs", page, limit24, query),
		searchRoute("Buffs", "/api/v1/buffs/search", "searchBuffs", page, limit24, query),
		detailRoute("Buffs", "/api/v1/buffs/{slug}", "getBuff", "slug"),

		listRoute("Formulas", "/api/v1/formulas", "listFormulas", page, queryInt("limit", "Rows per page", 20, 1, 24), query),
		searchRoute("Formulas", "/api/v1/formulas/search", "searchFormulas", page, queryInt("limit", "Rows per page", 20, 1, 24), query),
		{Method: "GET", Path: "/api/v1/formulas/featured", Tag: "Formulas", Summary: "Get the featured formula", OperationID: "getFeaturedFormula"},
		{Method: "GET", Path: "/api/v1/formulas/{slug}/graph/summary", Tag: "Graph", Summary: "Get a formula graph summary", OperationID: "getFormulaGraphSummary", Parameters: []parameter{pathString("slug", "Formula slug")}},
		{Method: "GET", Path: "/api/v1/formulas/{slug}/graph", Tag: "Graph", Summary: "Get a formula relation graph", OperationID: "getFormulaGraph", Parameters: []parameter{pathString("slug", "Formula slug"), queryString("node_type", "Filter nodes by type", false), queryString("edge_type", "Filter edges by type", false), queryInt("depth", "Graph traversal depth", 1, 1, 5), queryInt("limit", "Maximum graph nodes", 250, 1, 500)}},
		detailRoute("Formulas", "/api/v1/formulas/{slug}", "getFormula", "slug"),
		{Method: "GET", Path: "/api/v1/graph/meta", Tag: "Graph", Summary: "Get formula graph metadata", OperationID: "getGraphMeta", Auth: true},
		{Method: "GET", Path: "/api/v1/graph/search/nodes", Tag: "Graph", Summary: "Search graph nodes", OperationID: "searchGraphNodes", Auth: true, Parameters: []parameter{query, queryString("node_type", "Filter by node type", false), queryInt("limit", "Maximum results", 20, 1, 100)}},
		{Method: "GET", Path: "/api/v1/graph/nodes/{node_type}/{ref_id}/relations", Tag: "Graph", Summary: "Get relations for a graph node", OperationID: "getGraphNodeRelations", Parameters: []parameter{pathString("node_type", "Graph node type"), pathString("ref_id", "Referenced archive ID"), queryString("edge_type", "Filter by edge type", false), queryInt("depth", "Traversal depth", 1, 1, 5), queryInt("limit", "Maximum relations", 30, 1, 250)}},

		{Method: "GET", Path: "/api/v1/cards", Tag: "Cards", Summary: "List cards", OperationID: "listCards", Parameters: []parameter{page, limit24, query, queryString("type", "Card type", false), queryString("quality", "Card quality", false)}},
		searchRoute("Cards", "/api/v1/cards/search", "searchCards", page, limit24, query),
		{Method: "GET", Path: "/api/v1/cards/{id}/formulas", Tag: "Cards", Summary: "List formulas for a card", OperationID: "getCardFormulas", Parameters: []parameter{pathString("id", "Card ID")}},
		detailRoute("Cards", "/api/v1/cards/{id}", "getCard", "id"),
		{Method: "GET", Path: "/api/v1/monsters", Tag: "Monsters", Summary: "List monsters", OperationID: "listMonsters", Parameters: []parameter{page, limit24, query, queryString("size", "Monster size", false), queryString("element", "Monster element", false), queryString("race", "Monster race", false), queryString("sort", "Sort expression", false)}},
		searchRoute("Monsters", "/api/v1/monsters/search", "searchMonsters", page, limit24, query),
		detailRoute("Monsters", "/api/v1/monsters/{slug}", "getMonster", "slug"),
		{Method: "GET", Path: "/api/v1/headwears", Tag: "Headwears", Summary: "List headwears", OperationID: "listHeadwears", Parameters: []parameter{page, limit24, query, queryString("position", "Equipment position", false), queryString("stat", "Required stat text", false), queryString("unlock", "Unlock text", false), queryString("depo", "Deposit text", false), queryString("sort", "Sort expression", false)}},
		searchRoute("Headwears", "/api/v1/headwears/search", "searchHeadwears", page, limit24, query),
		{Method: "GET", Path: "/api/v1/headwears/{id}/formulas", Tag: "Headwears", Summary: "List formulas for a headwear", OperationID: "getHeadwearFormulas", Parameters: []parameter{pathString("id", "Headwear ID")}},
		detailRoute("Headwears", "/api/v1/headwears/{id}", "getHeadwear", "id"),
		{Method: "GET", Path: "/api/v1/equipments", Tag: "Equipments", Summary: "List equipment", OperationID: "listEquipment", Parameters: []parameter{page, limit24, query, queryString("type", "Equipment type", false), queryString("quality", "Equipment quality", false), queryString("stat", "Required stat text", false), queryString("unlock", "Unlock text", false), queryString("depo", "Deposit text", false), queryString("sort", "Sort expression", false)}},
		searchRoute("Equipments", "/api/v1/equipments/search", "searchEquipment", page, limit24, query),
		{Method: "GET", Path: "/api/v1/equipments/{id}/formulas", Tag: "Equipments", Summary: "List formulas for equipment", OperationID: "getEquipmentFormulas", Parameters: []parameter{pathString("id", "Equipment ID")}},
		detailRoute("Equipments", "/api/v1/equipments/{id}", "getEquipment", "id"),
		listRoute("Jobs", "/api/v1/jobs", "listJobs", page, limit24, query),
		searchRoute("Jobs", "/api/v1/jobs/search", "searchJobs", page, limit24, query),
		detailRoute("Jobs", "/api/v1/jobs/{slug}", "getJob", "slug"),
		listRoute("Maps", "/api/v1/maps", "listMaps", page, limit48, query),
		detailRoute("Maps", "/api/v1/maps/{slug}", "getMap", "slug"),
		listRoute("Ancient Equipment", "/api/v1/ancient-equips", "listAncientEquipment", page, limit48, query),
		detailRoute("Ancient Equipment", "/api/v1/ancient-equips/{slug}", "getAncientEquipment", "slug"),

		{Method: "GET", Path: "/api/v1/comments", Tag: "Comments", Summary: "List comments for an archive item", OperationID: "listComments", Parameters: []parameter{queryString("target_type", "Archive target type", true), queryString("target_id", "Archive target ID", true)}},
		{Method: "POST", Path: "/api/v1/comments", Tag: "Comments", Summary: "Create a comment or reply", OperationID: "createComment", Auth: true, RequestRef: "CreateCommentRequest", SuccessCode: "201"},
		{Method: "PATCH", Path: "/api/v1/comments/{id}", Tag: "Comments", Summary: "Update a comment", OperationID: "updateComment", Auth: true, Parameters: []parameter{pathString("id", "Comment ID")}, RequestRef: "UpdateCommentRequest"},
		{Method: "DELETE", Path: "/api/v1/comments/{id}", Tag: "Comments", Summary: "Soft-delete a comment", OperationID: "deleteComment", Auth: true, Parameters: []parameter{pathString("id", "Comment ID")}},

		{Method: "GET", Path: "/api/v1/me/reports", Tag: "Reports", Summary: "List the current user's reports", OperationID: "listMyReports", Auth: true},
		{Method: "POST", Path: "/api/v1/me/reports", Tag: "Reports", Summary: "Create a report", OperationID: "createReport", Auth: true, RequestRef: "ReportRequest", SuccessCode: "201"},
		{Method: "GET", Path: "/api/v1/me/reports/{id}", Tag: "Reports", Summary: "Get one of the current user's reports", OperationID: "getMyReport", Auth: true, Parameters: []parameter{pathString("id", "Report ID")}},
		{Method: "PATCH", Path: "/api/v1/me/reports/{id}", Tag: "Reports", Summary: "Update an open report", OperationID: "updateMyReport", Auth: true, Parameters: []parameter{pathString("id", "Report ID")}, RequestRef: "ReportRequest"},
		{Method: "DELETE", Path: "/api/v1/me/reports/{id}", Tag: "Reports", Summary: "Delete an open report", OperationID: "deleteMyReport", Auth: true, Parameters: []parameter{pathString("id", "Report ID")}},
		{Method: "GET", Path: "/api/v1/admin/reports", Tag: "Admin", Summary: "List reports for moderation", OperationID: "listAdminReports", Admin: true, Parameters: []parameter{queryString("status", "Filter by report status", false), queryInt("limit", "Maximum reports", 50, 1, 100)}},
		{Method: "PATCH", Path: "/api/v1/admin/reports/{id}/status", Tag: "Admin", Summary: "Update report moderation status", OperationID: "updateReportStatus", Admin: true, Parameters: []parameter{pathString("id", "Report ID")}, RequestRef: "StatusRequest"},

		{Method: "GET", Path: "/api/v1/me/feature-requests", Tag: "Feature Requests", Summary: "List the current user's feature requests", OperationID: "listMyFeatureRequests", Auth: true},
		{Method: "POST", Path: "/api/v1/me/feature-requests", Tag: "Feature Requests", Summary: "Create a feature request", OperationID: "createFeatureRequest", Auth: true, RequestRef: "FeatureRequest", SuccessCode: "201"},
		{Method: "GET", Path: "/api/v1/me/feature-requests/{id}", Tag: "Feature Requests", Summary: "Get one of the current user's feature requests", OperationID: "getMyFeatureRequest", Auth: true, Parameters: []parameter{pathString("id", "Feature request ID")}},
		{Method: "PATCH", Path: "/api/v1/me/feature-requests/{id}", Tag: "Feature Requests", Summary: "Update an open feature request", OperationID: "updateMyFeatureRequest", Auth: true, Parameters: []parameter{pathString("id", "Feature request ID")}, RequestRef: "FeatureRequest"},
		{Method: "DELETE", Path: "/api/v1/me/feature-requests/{id}", Tag: "Feature Requests", Summary: "Delete an open feature request", OperationID: "deleteMyFeatureRequest", Auth: true, Parameters: []parameter{pathString("id", "Feature request ID")}},
		{Method: "GET", Path: "/api/v1/admin/feature-requests", Tag: "Admin", Summary: "List feature requests for moderation", OperationID: "listAdminFeatureRequests", Admin: true, Parameters: []parameter{queryString("status", "Filter by request status", false), queryInt("limit", "Maximum feature requests", 50, 1, 100)}},
		{Method: "PATCH", Path: "/api/v1/admin/feature-requests/{id}/status", Tag: "Admin", Summary: "Update feature request status", OperationID: "updateFeatureRequestStatus", Admin: true, Parameters: []parameter{pathString("id", "Feature request ID")}, RequestRef: "StatusRequest"},
		{Method: "GET", Path: "/api/v1/data-health/dashboard", Tag: "Data Health", Summary: "Get archive integrity metrics", OperationID: "getDataHealth", Auth: true},
	}
}

func listRoute(tag, path, operationID string, params ...parameter) route {
	return route{Method: "GET", Path: path, Tag: tag, Summary: "List " + strings.ToLower(tag), OperationID: operationID, Parameters: params}
}

func searchRoute(tag, path, operationID string, params ...parameter) route {
	return route{Method: "GET", Path: path, Tag: tag, Summary: "Search " + strings.ToLower(tag), OperationID: operationID, Parameters: params}
}

func detailRoute(tag, path, operationID, paramName string) route {
	return route{Method: "GET", Path: path, Tag: tag, Summary: "Get " + strings.ToLower(tag) + " detail", OperationID: operationID, Parameters: []parameter{pathString(paramName, tag+" identifier")}}
}

func pathString(name, description string) parameter {
	return parameter{Name: name, In: "path", Description: description, Required: true, Schema: map[string]any{"type": "string"}}
}

func queryString(name, description string, required bool) parameter {
	return parameter{Name: name, In: "query", Description: description, Required: required, Schema: map[string]any{"type": "string"}}
}

func queryInt(name, description string, defaultValue, minimum, maximum int) parameter {
	schema := map[string]any{"type": "integer", "default": defaultValue, "minimum": minimum}
	if maximum > 0 {
		schema["maximum"] = maximum
	}
	return parameter{Name: name, In: "query", Description: description, Schema: schema}
}

func schemas() map[string]any {
	stringProperty := map[string]any{"type": "string"}
	nullableString := map[string]any{"type": "string", "nullable": true}

	return map[string]any{
		"SuccessResponse": map[string]any{
			"type":     "object",
			"required": []string{"success", "data"},
			"properties": map[string]any{
				"success": map[string]any{"type": "boolean", "example": true},
				"type":    map[string]any{"type": "string", "description": "Present on unified thing responses."},
				"data":    map[string]any{"description": "Endpoint-specific object or array."},
				"meta":    map[string]any{"nullable": true, "description": "Pagination or endpoint metadata."},
				"message": map[string]any{"type": "string"},
			},
		},
		"ErrorResponse": map[string]any{
			"type":     "object",
			"required": []string{"success", "message"},
			"properties": map[string]any{
				"success": map[string]any{"type": "boolean", "example": false},
				"message": map[string]any{"type": "string"},
			},
		},
		"UpdateProfileRequest": map[string]any{
			"type":     "object",
			"required": []string{"display_name"},
			"properties": map[string]any{
				"display_name": map[string]any{"type": "string", "maxLength": 32},
				"class_id":     nullableString,
				"bio":          map[string]any{"type": "string", "nullable": true, "maxLength": 240},
			},
		},
		"CreateCommentRequest": map[string]any{
			"type":     "object",
			"required": []string{"target_type", "target_id", "body"},
			"properties": map[string]any{
				"target_type": stringProperty,
				"target_id":   stringProperty,
				"parent_id":   nullableString,
				"body":        map[string]any{"type": "string", "maxLength": 2000},
			},
		},
		"UpdateCommentRequest": map[string]any{
			"type":       "object",
			"required":   []string{"body"},
			"properties": map[string]any{"body": map[string]any{"type": "string", "maxLength": 2000}},
		},
		"ReportRequest": map[string]any{
			"type":     "object",
			"required": []string{"title", "body"},
			"properties": map[string]any{
				"target_type": nullableString,
				"target_id":   nullableString,
				"target_url":  nullableString,
				"title":       map[string]any{"type": "string", "maxLength": 120},
				"body":        map[string]any{"type": "string", "maxLength": 2000},
			},
		},
		"FeatureRequest": map[string]any{
			"type":     "object",
			"required": []string{"title", "body"},
			"properties": map[string]any{
				"title": map[string]any{"type": "string", "maxLength": 120},
				"body":  map[string]any{"type": "string", "maxLength": 2000},
			},
		},
		"StatusRequest": map[string]any{
			"type":     "object",
			"required": []string{"status"},
			"properties": map[string]any{
				"status": map[string]any{"type": "string", "example": "reviewing"},
			},
		},
	}
}
