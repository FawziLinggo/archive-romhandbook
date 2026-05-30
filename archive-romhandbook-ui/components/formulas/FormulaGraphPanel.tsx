"use client"

import Link from "next/link"

import {
    Background,
    Controls,
    Handle,
    MarkerType,
    MiniMap,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
    type Edge as FlowEdge,
    type Node as FlowNode
} from "@xyflow/react"



import {
    ChevronDown,
    ChevronUp,
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
    id?: string
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


function truncateLabel(
    value: string,
    max = 20
) {
    if (value.length <= max) {
        return value
    }

    return `${value.slice(0, max - 1)}…`
}

function getNodeColor(
    nodeType: string
) {
    const colors: Record<string, string> = {
        card: "#a78bfa",
        equipment: "#34d399",
        headwear: "#f472b6",
        monster: "#f87171",
        buff: "#60a5fa",
        buff_json: "#818cf8",
        formula_json: "#c084fc",
        formula_id: "#fbbf24",
        crafting_material: "#2dd4bf",
        furniture: "#fb923c",
        external_id: "#94a3b8"
    }

    return colors[nodeType] || "#a1a1aa"
}

function FormulaFlowNode({
    data
}: any) {
    const node =
        data.node as FormulaGraphNode

    const isCenter =
        Boolean(data.isCenter)

    const color =
        isCenter
            ? "#8b5cf6"
            : getNodeColor(node.node_type)

    const href =
        getNodeHref(node)

    return (
        <div
            className={`
                relative
                flex
                min-h-[78px]
                w-[230px]
                items-center
                gap-3
                rounded-2xl
                border
                bg-zinc-950
                p-3
                shadow-2xl
                shadow-black/40

                ${isCenter
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800"
                }
            `}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!h-2.5 !w-2.5 !border-0 !bg-zinc-500"
            />

            <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-black"
                style={{
                    borderColor: color
                }}
            >
                {node.image ? (
                    <img
                        src={node.image}
                        alt={getNodeLabel(node)}
                        className="h-8 w-8 object-contain"
                    />
                ) : (
                    <span
                        className="text-xs font-black"
                        style={{
                            color
                        }}
                    >
                        {node.node_type
                            .split("_")
                            .map((item) => item.charAt(0))
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </span>
                )}
            </div>

            <div className="min-w-0">
                {href && !isCenter ? (
                    <Link
                        href={href}
                        className="nodrag block truncate text-sm font-black text-white hover:text-violet-200"
                    >
                        {getNodeLabel(node)}
                    </Link>
                ) : (
                    <div className="truncate text-sm font-black text-white">
                        {getNodeLabel(node)}
                    </div>
                )}

                <div
                    className="mt-1 text-xs font-black"
                    style={{
                        color
                    }}
                >
                    {isCenter ? "Formula Code" : formatNodeType(node.node_type)}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="!h-2.5 !w-2.5 !border-0 !bg-zinc-500"
            />
        </div>
    )
}

function buildFormulaPanelPositions(
    graph: FormulaGraph,
    centerNode: FormulaGraphNode
) {
    const positions: Record<string, { x: number; y: number }> = {}

    positions[centerNode.node_key] = {
        x: 0,
        y: 0
    }

    const related =
        graph.nodes
            .filter((node) => node.node_key !== centerNode.node_key)
            .slice(0, 24)

    const grouped =
        new Map<string, FormulaGraphNode[]>()

    related.forEach((node) => {
        const list =
            grouped.get(node.node_type) || []

        list.push(node)
        grouped.set(node.node_type, list)
    })

    Array.from(grouped.entries()).forEach(([, items], groupIndex) => {
        const side =
            groupIndex % 2 === 0 ? -1 : 1

        const ring =
            Math.floor(groupIndex / 2) + 1

        const x =
            side * ring * 330

        const gapY =
            105

        const startY =
            -((items.length - 1) * gapY) / 2

        items.forEach((node, index) => {
            positions[node.node_key] = {
                x,
                y: startY + index * gapY
            }
        })
    })

    return positions
}

function FormulaGraphCanvas({
    graph,
    formulaId,
    formulaName,
    isVisible,
    onToggle,
}: {
    graph: FormulaGraph
    formulaId: string
    formulaName: string
    isVisible: boolean
    onToggle: () => void
}) {
    const centerNode =
        useMemo(() => {
            return graph.nodes.find((node) =>
                isCenterNode(node, formulaId)
            ) || graph.nodes[0]
        }, [
            graph.nodes,
            formulaId
        ])

    const related =
        useMemo(() => {
            if (!centerNode) {
                return []
            }

            return graph.nodes
                .filter((node) => node.node_key !== centerNode.node_key)
                .slice(0, 24)
        }, [
            graph.nodes,
            centerNode
        ])

    const visibleGraphNodes =
        useMemo(() => {
            if (!centerNode) {
                return []
            }

            const relatedKeys =
                new Set(
                    related.map((node) => node.node_key)
                )

            return graph.nodes.filter((node) => {
                return node.node_key === centerNode.node_key ||
                    relatedKeys.has(node.node_key)
            })
        }, [
            graph.nodes,
            centerNode,
            related
        ])

    const [
        flowNodes,
        setFlowNodes,
        onNodesChange
    ] = useNodesState<FlowNode>([])

    const [
        flowEdges,
        setFlowEdges,
        onEdgesChange
    ] = useEdgesState<FlowEdge>([])

    const nodeTypes =
        useMemo(
            () => ({
                formulaNode: FormulaFlowNode
            }),
            []
        )

    const nodesByKey =
        useMemo(() => {
            const map =
                new Map<string, FormulaGraphNode>()

            graph.nodes.forEach((node) => {
                map.set(node.node_key, node)
            })

            return map
        }, [
            graph.nodes
        ])

    useEffect(() => {
        if (!centerNode) {
            setFlowNodes([])
            return
        }

        setFlowNodes((current) => {
            const previousPositions =
                new Map(
                    current.map((node) => [
                        node.id,
                        node.position
                    ])
                )

            const generated =
                buildFormulaPanelPositions(
                    graph,
                    centerNode
                )

            return visibleGraphNodes.map((node) => ({
                id: node.node_key,
                type: "formulaNode",
                position:
                    previousPositions.get(node.node_key) ||
                    generated[node.node_key] ||
                    {
                        x: 0,
                        y: 0
                    },
                data: {
                    node: {
                        ...node,
                        label: isCenterNode(node, formulaId)
                            ? formulaName
                            : node.label
                    },
                    isCenter: isCenterNode(node, formulaId)
                },
                draggable: true
            }))
        })
    }, [
        centerNode,
        formulaId,
        formulaName,
        visibleGraphNodes,
        setFlowNodes
    ])

    useEffect(() => {
        const visibleKeys =
            new Set(
                flowNodes.map((node) => node.id)
            )

        setFlowEdges(
            graph.edges
                .filter((edge) => {
                    return visibleKeys.has(edge.from_node_key) &&
                        visibleKeys.has(edge.to_node_key)
                })
                .map((edge) => {
                    const target =
                        nodesByKey.get(edge.to_node_key)

                    const color =
                        getNodeColor(target?.node_type || "")

                    return {
                        id: String(edge.id),
                        source: edge.from_node_key,
                        target: edge.to_node_key,
                        type: "smoothstep",
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color
                        },
                        style: {
                            stroke: color,
                            strokeOpacity: 0.45,
                            strokeWidth: 1.5
                        }
                    }
                })
        )
    }, [
        flowNodes,
        graph.edges,
        nodesByKey,
        setFlowEdges
    ])

    return (
        <div
            className="
                mt-6
                overflow-hidden
                rounded-2xl
                border
                border-zinc-800
                bg-black
            "
        >
            <button
                type="button"
                onClick={onToggle}
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-zinc-800
                    px-4
                    py-3
                    text-left
                    transition-colors
                    hover:bg-white/[0.03]
                "
            >
                <span className="text-sm font-black text-white">
                    Graph View
                </span>

                <span
                    className="
                        inline-flex
                        items-center
                        gap-3
                        text-xs
                        text-zinc-500
                    "
                >
                    Showing {related.length} nodes

                    {isVisible ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </span>
            </button>

            {isVisible && (
                <div className="h-[360px] w-full sm:h-[460px] lg:h-[520px]">
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        fitViewOptions={{
                            padding: 0.25
                        }}
                        minZoom={0.2}
                        maxZoom={1.5}
                        nodesDraggable
                        nodesConnectable={false}
                        elementsSelectable
                        proOptions={{
                            hideAttribution: true
                        }}
                    >
                        <Background
                            color="#3f3f46"
                            gap={22}
                        />

                        <MiniMap
                            pannable
                            zoomable
                            nodeColor={(node) => {
                                const data =
                                    node.data as {
                                        node: FormulaGraphNode
                                        isCenter: boolean
                                    }

                                return data.isCenter
                                    ? "#8b5cf6"
                                    : getNodeColor(data.node.node_type)
                            }}
                            maskColor="rgba(0,0,0,0.72)"
                            className="!hidden !bg-zinc-950 !border !border-zinc-800 md:!block"
                        />

                        <Controls
                            className="
        !overflow-hidden
        !rounded-2xl
        !border
        !border-violet-500/40
        !bg-zinc-950
        !shadow-2xl
        !shadow-black/50

        [&_button]:!h-9
        [&_button]:!w-9
        [&_button]:!border-zinc-800
        [&_button]:!bg-zinc-950
        [&_button]:!text-violet-200
        [&_button:hover]:!bg-violet-500/15
        [&_button:hover]:!text-white

        [&_svg]:!stroke-current
    "
                        />
                    </ReactFlow>
                </div>
            )}
        </div>
    )
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
    formulaName,
    id,
}: Props) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const [
        isGraphVisible,
        setIsGraphVisible
    ] = useState(true)

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
            id={id}
            className="
    mt-8
    w-full
    max-w-full
    min-w-0
    scroll-mt-24
    overflow-hidden
    rounded-3xl
    border
    border-zinc-800
    bg-zinc-950/40
    p-3
    sm:p-4
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

            {graph && graph.nodes.length > 1 && (
                <FormulaGraphCanvas
                    graph={graph}
                    formulaId={formulaId}
                    formulaName={formulaName}
                    isVisible={isGraphVisible}
                    onToggle={() => setIsGraphVisible((value) => !value)}
                />
            )}

            <div
                className="
                    mt-6
                    grid
                    gap-4
                    grid-cols-1
                    xl:grid-cols-[280px_minmax(0,1fr)]  
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
                                grid-cols-1
                                md:grid-cols-2
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
                                            min-w-0
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
                                                        text-sm
                                                    font-black
                                                    text-white
                                                    [overflow-wrap:anywhere]
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
        flex
        flex-wrap
        gap-x-2
        gap-y-1
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        px-3
        py-2
        text-xs
        text-zinc-400
        [overflow-wrap:anywhere]
    "
                                >
                                    <span className="font-semibold text-zinc-200">
                                        {fromNode ? getNodeLabel(fromNode) : edge.from_node_key}
                                    </span>

                                    <span className="break-all text-violet-300">
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