export type DataHealthNameCount = {
    name: string
    total: number
}

export type DataHealthSummary = {
    total_rows: number
    things_total: number
    missing_things: number
    thing_conflicts: number
    raw_html_missing: number
    unknown_links: number
    search_rows: number
    graph_nodes: number
    graph_edges: number
}

export type DataHealthTableMetric = {
    table: string
    thing_type: string
    total: number
    raw_html_missing: number
    detail_url_missing: number
    image_missing: number
    missing_things: number
    thing_conflicts: number
    indexed_in_things: boolean
}

export type DataHealthThingConflict = {
    source_table: string
    expected_type: string
    existing_type: string
    total: number
}

export type DataHealthUnknownLinkType = {
    detected_types: string
    total: number
    sample_path: string
}

export type DataHealthDashboard = {
    summary: DataHealthSummary
    tables: DataHealthTableMetric[]
    thing_type_counts: DataHealthNameCount[]
    thing_conflicts: DataHealthThingConflict[]
    unknown_link_types: DataHealthUnknownLinkType[]
    search_index: {
        total: number
        by_type: DataHealthNameCount[]
    }
    formula_graph: {
        nodes: number
        edges: number
        nodes_by_type: DataHealthNameCount[]
    }
}

export type DataHealthResponse = {
    success: boolean
    data: DataHealthDashboard
    meta: unknown
}