"use client"

import Link from "next/link"

import {
    GitBranch,
    Loader2,
    Network,
    RefreshCw
} from "lucide-react"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import type {
    ApiResponse,
    FormulaGraph,
    FormulaGraphNode,
    FormulaGraphSummary
} from "@/lib/types/Formula"

type Props = {
    formulaId: string
    formulaName: string
}

const DEFAULT_NODE_TYPES = [
    "card",
    "equipment",
    "headwear",
    "monster",
    "crafting_material",
    "furniture"
]

const TECHNICAL_NODE_TYPES = [
    "buff",
    "buff_json",
    "formula_json",
    "formula_id",
    "external_id"
]

function formatNodeType(
    value: string
) {
    return value
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ")
}

function getNodeHref(
    node: FormulaGraphNode
) {
    if (!node.detail_url) {
        return null
    }

    if (node.detail_url.startsWith("/")) {
        return node.detail_url
    }

    return `/${node.detail_url}`
}

function getNodeLabel(
    node: FormulaGraphNode
) {
    return node.label || node.ref_id || node.node_key
}

function isCenterNode(
    node: FormulaGraphNode,
    formulaId: string
) {
    return (
        node.node_type === "formula_code" &&
        node.ref_id === formulaId
    )
}

export default function FormulaGraphPanel({
    formulaId,
    formulaName
}: Props) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const [
        summary,
        setSummary
    ] = useState<FormulaGraphSummary | null>(null)

    const [
        graph,
        setGraph
    ] = useState<FormulaGraph | null>(null)

    const [
        selectedTypes,
        setSelectedTypes
    ] = useState<string[]>([])

    const [
        limit,
        setLimit
    ] = useState(10)

    const [
        showTechnical,
        setShowTechnical
    ] = useState(false)

    const [
        isSummaryLoading,
        setIsSummaryLoading
    ] = useState(true)

    const [
        isGraphLoading,
        setIsGraphLoading
    ] = useState(false)

    const [
        error,
        setError
    ] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false

        async function fetchSummary() {
            try {
                setIsSummaryLoading(true)
                setError(null)

                const res =
                    await fetch(
                        `${API_URL}/api/v1/formulas/${formulaId}/graph/summary`
                    )

                if (!res.ok) {
                    throw new Error("Failed to load graph summary")
                }

                const json =
                    await res.json() as ApiResponse<FormulaGraphSummary>

                if (ignore) {
                    return
                }

                setSummary(json.data)

                const availableTypes =
                    json.data.node_types.map((item) => item.node_type)

                const defaults =
                    DEFAULT_NODE_TYPES.filter((type) =>
                        availableTypes.includes(type)
                    )

                setSelectedTypes(
                    defaults.length > 0
                        ? defaults.slice(0, 3)
                        : availableTypes.slice(0, 3)
                )
            } catch (err) {
                if (!ignore) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load graph summary"
                    )
                }
            } finally {
                if (!ignore) {
                    setIsSummaryLoading(false)
                }
            }
        }

        fetchSummary()

        return () => {
            ignore = true
        }
    }, [
        API_URL,
        formulaId
    ])

    useEffect(() => {
        if (selectedTypes.length === 0) {
            setGraph(null)
            return
        }

        let ignore = false

        async function fetchGraph() {
            try {
                setIsGraphLoading(true)
                setError(null)

                const params =
                    new URLSearchParams({
                        depth: "1",
                        limit: String(limit),
                        node_type: selectedTypes.join(",")
                    })

                const res =
                    await fetch(
                        `${API_URL}/api/v1/formulas/${formulaId}/graph?${params.toString()}`
                    )

                if (!res.ok) {
                    throw new Error("Failed to load formula graph")
                }

                const json =
                    await res.json() as ApiResponse<FormulaGraph>

                if (!ignore) {
                    setGraph(json.data)
                }
            } catch (err) {
                if (!ignore) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load formula graph"
                    )
                }
            } finally {
                if (!ignore) {
                    setIsGraphLoading(false)
                }
            }
        }

        fetchGraph()

        return () => {
            ignore = true
        }
    }, [
        API_URL,
        formulaId,
        limit,
        selectedTypes
    ])

    const visibleSummaryItems =
        useMemo(() => {
            if (!summary) {
                return []
            }

            return summary.node_types.filter((item) => {
                const isTechnical =
                    TECHNICAL_NODE_TYPES.includes(item.node_type)

                return showTechnical || !isTechnical
            })
        }, [
            showTechnical,
            summary
        ])

    const nodesByKey =
        useMemo(() => {
            const result =
                new Map<string, FormulaGraphNode>()

            for (const node of graph?.nodes || []) {
                result.set(node.node_key, node)
            }

            return result
        }, [
            graph
        ])

    const relatedNodes =
        useMemo(() => {
            if (!graph) {
                return []
            }

            return graph.nodes.filter((node) =>
                !isCenterNode(node, formulaId)
            )
        }, [
            formulaId,
            graph
        ])

    function toggleType(
        nodeType: string
    ) {
        setSelectedTypes((current) => {
            if (current.includes(nodeType)) {
                return current.filter((item) => item !== nodeType)
            }

            return [
                ...current,
                nodeType
            ]
        })
    }

    return (
        <section
            className="
                mt-8
                rounded-3xl
                border
                border-zinc-800
                bg-zinc-950/40
                p-4
                md:p-6
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                    md:items-start
                    md:justify-between
                "
            >
                <div>
                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-violet-500/30
                            bg-violet-500/10
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-violet-200
                        "
                    >
                        <Network size={14} />
                        Formula Graph
                    </div>

                    <h2
                        className="
                            mt-4
                            text-2xl
                            font-black
                            text-white
                        "
                    >
                        Connected Archive Data
                    </h2>

                    <p
                        className="
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6
                            text-zinc-400
                        "
                    >
                        See which cards, equipment, headwears, buffs, and other archived records connect to this formula.
                    </p>
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    {[10, 25, 50, 100].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setLimit(value)}
                            className={`
                                rounded-xl
                                border
                                px-3
                                py-2
                                text-xs
                                font-bold
                                transition-colors

                                ${limit === value
                                    ? "border-violet-500 bg-violet-500/15 text-violet-100"
                                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                }
                            `}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                "
            >
                {isSummaryLoading && (
                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-3
                            py-2
                            text-sm
                            text-zinc-400
                        "
                    >
                        <Loader2
                            size={16}
                            className="animate-spin"
                        />
                        Loading graph filters
                    </div>
                )}

                {visibleSummaryItems.map((item) => {
                    const checked =
                        selectedTypes.includes(item.node_type)

                    return (
                        <button
                            key={item.node_type}
                            type="button"
                            onClick={() => toggleType(item.node_type)}
                            className={`
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                px-3
                                py-2
                                text-sm
                                font-bold
                                transition-colors

                                ${checked
                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                }
                            `}
                        >
                            <span
                                className={`
                                    h-2
                                    w-2
                                    rounded-full

                                    ${checked
                                        ? "bg-emerald-300"
                                        : "bg-zinc-600"
                                    }
                                `}
                            />

                            {formatNodeType(item.node_type)}

                            <span
                                className="
                                    rounded-full
                                    bg-black/40
                                    px-2
                                    py-0.5
                                    text-xs
                                    text-zinc-400
                                "
                            >
                                {item.node_count}
                            </span>
                        </button>
                    )
                })}

                {summary && (
                    <button
                        type="button"
                        onClick={() => setShowTechnical((value) => !value)}
                        className="
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                            px-3
                            py-2
                            text-sm
                            font-bold
                            text-zinc-400
                            transition-colors
                            hover:border-zinc-700
                            hover:text-white
                        "
                    >
                        {showTechnical ? "Hide Technical" : "Show Technical"}
                    </button>
                )}
            </div>

            {error && (
                <div
                    className="
                        mt-5
                        rounded-2xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-200
                    "
                >
                    {error}
                </div>
            )}

            <div
                className="
                    mt-6
                    grid
                    gap-4
                    lg:grid-cols-[280px_1fr]
                "
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-4
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-violet-500/30
                                bg-violet-500/10
                                text-violet-200
                            "
                        >
                            <GitBranch size={20} />
                        </div>

                        <div className="min-w-0">
                            <p
                                className="
                                    truncate
                                    text-sm
                                    font-black
                                    text-white
                                "
                            >
                                {formulaName}
                            </p>

                            <p
                                className="
                                    mt-1
                                    truncate
                                    text-xs
                                    text-zinc-500
                                "
                            >
                                {formulaId}
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-2
                            gap-2
                        "
                    >
                        <div
                            className="
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                p-3
                            "
                        >
                            <p className="text-xs text-zinc-500">
                                Nodes
                            </p>

                            <p className="mt-1 text-xl font-black text-white">
                                {Math.max((graph?.nodes.length || 1) - 1, 0)}
                            </p>
                        </div>

                        <div
                            className="
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                p-3
                            "
                        >
                            <p className="text-xs text-zinc-500">
                                Edges
                            </p>

                            <p className="mt-1 text-xl font-black text-white">
                                {graph?.edges.length || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-4
                    "
                >
                    <div
                        className="
                            mb-4
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >
                        <p
                            className="
                                text-sm
                                font-black
                                text-white
                            "
                        >
                            Related Nodes
                        </p>

                        {isGraphLoading && (
                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-xs
                                    text-zinc-500
                                "
                            >
                                <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                />
                                Updating
                            </div>
                        )}
                    </div>

                    {selectedTypes.length === 0 ? (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                p-8
                                text-center
                                text-sm
                                text-zinc-500
                            "
                        >
                            Select at least one node type.
                        </div>
                    ) : relatedNodes.length === 0 && !isGraphLoading ? (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                p-8
                                text-center
                                text-sm
                                text-zinc-500
                            "
                        >
                            No related nodes found for the selected filters.
                        </div>
                    ) : (
                        <div
                            className="
                                grid
                                gap-3
                                sm:grid-cols-2
                                xl:grid-cols-3
                            "
                        >
                            {relatedNodes.map((node) => {
                                const href =
                                    getNodeHref(node)

                                const content = (
                                    <div
                                        className="
                                            flex
                                            min-h-[86px]
                                            gap-3
                                            rounded-2xl
                                            border
                                            border-zinc-800
                                            bg-zinc-950
                                            p-3
                                            transition-colors
                                            hover:border-zinc-700
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                overflow-hidden
                                                rounded-xl
                                                border
                                                border-zinc-800
                                                bg-black
                                            "
                                        >
                                            {node.image ? (
                                                <img
                                                    src={node.image}
                                                    alt={getNodeLabel(node)}
                                                    className="
                                                        h-8
                                                        w-8
                                                        object-contain
                                                    "
                                                />
                                            ) : (
                                                <Network
                                                    size={18}
                                                    className="text-zinc-500"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    line-clamp-2
                                                    text-sm
                                                    font-black
                                                    text-white
                                                "
                                            >
                                                {getNodeLabel(node)}
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    font-semibold
                                                    text-emerald-300
                                                "
                                            >
                                                {formatNodeType(node.node_type)}
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    text-zinc-500
                                                "
                                            >
                                                {node.ref_id}
                                            </p>
                                        </div>
                                    </div>
                                )

                                if (!href) {
                                    return (
                                        <div key={node.node_key}>
                                            {content}
                                        </div>
                                    )
                                }

                                return (
                                    <Link
                                        key={node.node_key}
                                        href={href}
                                    >
                                        {content}
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {graph && graph.edges.length > 0 && (
                <div
                    className="
                        mt-4
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-4
                    "
                >
                    <p
                        className="
                            mb-3
                            text-sm
                            font-black
                            text-white
                        "
                    >
                        Edges
                    </p>

                    <div className="space-y-2">
                        {graph.edges.slice(0, limit).map((edge) => {
                            const fromNode =
                                nodesByKey.get(edge.from_node_key)

                            const toNode =
                                nodesByKey.get(edge.to_node_key)

                            return (
                                <div
                                    key={edge.id}
                                    className="
                                        rounded-xl
                                        border
                                        border-zinc-800
                                        bg-zinc-950
                                        px-3
                                        py-2
                                        text-xs
                                        text-zinc-400
                                    "
                                >
                                    <span className="font-semibold text-zinc-200">
                                        {fromNode ? getNodeLabel(fromNode) : edge.from_node_key}
                                    </span>

                                    <span className="mx-2 text-violet-300">
                                        {edge.edge_type}
                                    </span>

                                    <span className="font-semibold text-zinc-200">
                                        {toNode ? getNodeLabel(toNode) : edge.to_node_key}
                                    </span>

                                    {edge.evidence && (
                                        <span className="ml-2 text-zinc-500">
                                            ({edge.evidence})
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    )
}