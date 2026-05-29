export type Formula = {

    id: number

    detail_url: string

    name: string

    formula_code: string
}

export type ApiResponse<T> = {

    success: boolean

    data: T

    meta: unknown
}

export type PaginatedApiResponse<T> = {

    success: boolean

    data: T[]

    meta: {
        page: number
        limit: number
        total: number
        has_next: boolean
    }
}


export type FormulaGraphSummaryItem = {
    node_type: string
    node_count: number
    edge_count: number
}

export type FormulaGraphSummary = {
    formula_id: string
    node_types: FormulaGraphSummaryItem[]
}

export type FormulaGraphNode = {
    node_key: string
    node_type: string
    ref_id: string
    label: string | null
    detail_url: string | null
    image: string | null
    meta_json: string | null
}

export type FormulaGraphEdge = {
    id: number
    from_node_key: string
    to_node_key: string
    edge_type: string
    evidence: string | null
    source_table: string | null
    source_id: string | null
}

export type FormulaGraph = {
    formula_id: string
    depth: number
    nodes: FormulaGraphNode[]
    edges: FormulaGraphEdge[]
}