"use client"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import Link from "next/link"

import {
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/cjs/styles/prism"

import {
    ExternalLink,
    Loader2,
    RefreshCw,
    X
} from "lucide-react"


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

import { getApiErrorMessage } from "@/lib/api-client"
import type {
    ApiResponse,
    FormulaGraphNode,
    FormulaGraphNodeRelations
} from "@/lib/types/Formula"
import { assetUrl } from "@/lib/utils"

type Props = {
    nodeType: string
    refId: string
    defaultNodeType?: string
    initialLimit?: number
}

const LIMITS = [
    10,
    20,
    30
]

const FILTERS = [
    {
        value: "formula_code",
        label: "Formula Code"
    },
    {
        value: "formula_json",
        label: "Formula Json"
    },
    {
        value: "formula_id",
        label: "Formula ID"
    },
    {
        value: "buff",
        label: "Buff"
    },
    {
        value: "",
        label: "All"
    }
]

function canOpenJson(
    node: FormulaGraphNode
) {
    return [
        "formula_json",
        "buff_json"
    ].includes(node.node_type)
}

function formatNodeJson(
    node: FormulaGraphNode
) {
    if (!node.meta_json) {
        return "No JSON payload available."
    }

    try {
        let parsed: unknown =
            JSON.parse(node.meta_json)

        if (typeof parsed === "string") {
            parsed =
                JSON.parse(parsed)
        }

        return JSON.stringify(
            parsed,
            null,
            2
        )
    } catch {
        return node.meta_json
    }
}

function FormulaJsonModal({
    node,
    onClose
}: {
    node: FormulaGraphNode | null
    onClose: () => void
}) {
    if (!node) {
        return null
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[90]
                flex
                items-center
                justify-center
                bg-black/80
                p-3
                backdrop-blur-sm

                sm:p-6
            "
            onClick={onClose}
        >
            <div
                className="
                    flex
                    max-h-[86vh]
                    w-full
                    max-w-4xl
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    shadow-2xl
                    shadow-black/50
                "
                onClick={(event) => event.stopPropagation()}
            >
                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        border-b
                        border-zinc-800
                        px-4
                        py-4

                        sm:px-5
                    "
                >
                    <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-wide text-violet-300">
                            {formatNodeType(node.node_type)}
                        </div>

                        <h3
                            className="
                                mt-1
                                break-words
                                text-lg
                                font-black
                                text-white

                                sm:text-xl
                            "
                        >
                            {getNodeLabel(node)}
                        </h3>

                        <div className="mt-1 break-all text-xs text-zinc-500">
                            {node.ref_id}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            inline-flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-black
                            text-zinc-400
                            transition-colors
                            hover:border-violet-500/50
                            hover:text-white
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 overflow-auto">
                    <SyntaxHighlighter
                        language="json"
                        style={oneDark}
                        wrapLongLines={true}
                        PreTag="div"
                        codeTagProps={{
                            style: {
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }
                        }}
                        customStyle={{
                            margin: 0,
                            background: "transparent",
                            fontSize: "13px",
                            lineHeight: "1.75",
                            padding: "20px",
                            overflowX: "hidden",
                            maxWidth: "100%"
                        }}
                    >
                        {formatNodeJson(node)}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    )
}

function formatNodeType(
    value: string
) {
    return value
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ")
}

function truncateText(
    value: string,
    max = 18
) {
    if (value.length <= max) {
        return value
    }

    return `${value.slice(0, max - 1)}...`
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

function getNodeInitial(
    nodeType: string
) {
    return nodeType
        .split("_")
        .map((item) => item.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

function getGraphColor(
    nodeType: string
) {
    const colors: Record<string, string> = {
        formula_code: "#a78bfa",
        formula_json: "#34d399",
        formula_id: "#fbbf24",
        buff: "#60a5fa",
        buff_json: "#818cf8",
        card: "#a78bfa",
        equipment: "#34d399",
        headwear: "#f472b6",
        monster: "#f87171",
        crafting_material: "#2dd4bf",
        furniture: "#fb923c",
        external_id: "#94a3b8"
    }

    return colors[nodeType] || "#a1a1aa"
}

function getFullGraphHref(
    relations: FormulaGraphNodeRelations
) {
    const formulaNode =
        relations.nodes.find((node) =>
            node.node_type === "formula_code" &&
            node.detail_url
        )

    const href =
        formulaNode
            ? getNodeHref(formulaNode)
            : null

    if (!href) {
        return null
    }

    return `${href}#formula-graph`
}

function RelationFlowNode({
    data
}: any) {
    const node =
        data.node as FormulaGraphNode

    const isCenter =
        Boolean(data.isCenter)

    const onOpenJsonNode =
        data.onOpenJsonNode as (node: FormulaGraphNode) => void

    const color =
        isCenter
            ? "#8b5cf6"
            : getGraphColor(node.node_type)

    const href =
        getNodeHref(node)

    const parts =
        getGraphNodeTitleParts(node)

    const content = (
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
                        src={assetUrl(node.image)}
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
                        {getNodeInitial(node.node_type)}
                    </span>
                )}
            </div>

            <div className="min-w-0">
                <div
                    className="truncate text-xs font-black"
                    style={{
                        color
                    }}
                >
                    {isCenter ? formatNodeType(node.node_type) : parts.eyebrow}
                </div>

                <div className="mt-1 truncate text-sm font-black text-white">
                    {isCenter ? getNodeLabel(node) : parts.title}
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="!h-2.5 !w-2.5 !border-0 !bg-zinc-500"
            />
        </div>
    )

    if (canOpenJson(node)) {
        return (
            <button
                type="button"
                onClick={() => onOpenJsonNode(node)}
                className="nodrag text-left"
            >
                {content}
            </button>
        )
    }

    if (href && !isCenter) {
        return (
            <Link
                href={href}
                className="nodrag block"
            >
                {content}
            </Link>
        )
    }

    return content
}

function buildRelationPositions(
    center: FormulaGraphNode,
    relatedNodes: FormulaGraphNode[]
) {
    const positions: Record<string, { x: number; y: number }> = {}

    positions[center.node_key] = {
        x: 0,
        y: 0
    }

    const left =
        relatedNodes.filter((_, index) => index % 2 === 0)

    const right =
        relatedNodes.filter((_, index) => index % 2 !== 0)

    function placeColumn(
        items: FormulaGraphNode[],
        x: number
    ) {
        const gapY =
            108

        const startY =
            -((items.length - 1) * gapY) / 2

        items.forEach((node, index) => {
            positions[node.node_key] = {
                x,
                y: startY + index * gapY
            }
        })
    }

    placeColumn(left, -330)
    placeColumn(right, 330)

    return positions
}

function RelationMiniGraph({
    relations,
    selectedNodeType,
    onSelectNodeType,
    limit,
    onLimitChange,
    onReset,
    onOpenJsonNode
}: {
    relations: FormulaGraphNodeRelations
    selectedNodeType: string
    onSelectNodeType: (value: string) => void
    limit: number
    onLimitChange: (value: number) => void
    onReset: () => void
    onOpenJsonNode: (node: FormulaGraphNode) => void
}) {
    const center =
        relations.center

    const relatedNodes =
        useMemo(() => {
            return relations.nodes
                .filter((node) => node.node_key !== center.node_key)
                .slice(0, 8)
        }, [
            relations.nodes,
            center.node_key
        ])

    const fullGraphHref =
        getFullGraphHref(relations)

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
                relationNode: RelationFlowNode
            }),
            []
        )

    const visibleNodes =
        useMemo(() => {
            return [
                center,
                ...relatedNodes
            ]
        }, [
            center,
            relatedNodes
        ])

    const visibleKeys =
        useMemo(() => {
            return new Set(
                visibleNodes.map((node) => node.node_key)
            )
        }, [
            visibleNodes
        ])

    const nodeLookup =
        useMemo(() => {
            const map =
                new Map<string, FormulaGraphNode>()

            visibleNodes.forEach((node) => {
                map.set(node.node_key, node)
            })

            return map
        }, [
            visibleNodes
        ])

    useEffect(() => {
        setFlowNodes((current) => {
            const previousPositions =
                new Map(
                    current.map((node) => [
                        node.id,
                        node.position
                    ])
                )

            const generated =
                buildRelationPositions(
                    center,
                    relatedNodes
                )

            return visibleNodes.map((node) => ({
                id: node.node_key,
                type: "relationNode",
                position:
                    previousPositions.get(node.node_key) ||
                    generated[node.node_key] ||
                    {
                        x: 0,
                        y: 0
                    },
                data: {
                    node,
                    isCenter: node.node_key === center.node_key,
                    onOpenJsonNode
                },
                draggable: true
            }))
        })
    }, [
        center,
        relatedNodes,
        visibleNodes,
        onOpenJsonNode,
        setFlowNodes
    ])

    useEffect(() => {
        setFlowEdges(
            relations.edges
                .filter((edge) => {
                    return visibleKeys.has(edge.from_node_key) &&
                        visibleKeys.has(edge.to_node_key)
                })
                .map((edge) => {
                    const target =
                        nodeLookup.get(edge.to_node_key)

                    const color =
                        getGraphColor(target?.node_type || "")

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
                            strokeOpacity: 0.5,
                            strokeWidth: 1.8
                        }
                    }
                })
        )
    }, [
        relations.edges,
        visibleKeys,
        nodeLookup,
        setFlowEdges
    ])

    return (
        <div
            className="
                mt-6
                overflow-hidden
                rounded-3xl
                border
                border-zinc-800
                bg-black
            "
        >
            <div
                className="
                    border-b
                    border-zinc-800
                    p-4

                    sm:p-5
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-5

                        xl:flex-row
                        xl:items-start
                        xl:justify-between
                    "
                >
                    <div className="min-w-0">
                        <h3
                            className="
                                text-xl
                                font-black
                                leading-tight
                                text-white

                                sm:text-2xl
                            "
                        >
                            Formula Graph
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Drag nodes to organize the graph. Click JSON nodes to inspect their payload.
                        </p>
                    </div>

                    <div
                        className="
                            flex
                            w-full
                            flex-col
                            gap-3

                            xl:w-auto
                            xl:items-end
                        "
                    >
                        <div
                            className="
                                flex
                                w-full
                                flex-col
                                gap-2

                                sm:flex-row
                                sm:flex-wrap
                                sm:items-center
                                xl:justify-end
                            "
                        >
                            <select
                                value={selectedNodeType}
                                onChange={(event) => onSelectNodeType(event.target.value)}
                                className="
                                    h-11
                                    w-full
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-black
                                    px-4
                                    text-sm
                                    font-bold
                                    text-zinc-200
                                    outline-none
                                    transition-colors

                                    focus:border-violet-500
                                    focus:ring-2
                                    focus:ring-violet-500/20

                                    sm:w-[190px]
                                "
                            >
                                {FILTERS.map((filter) => (
                                    <option
                                        key={filter.label}
                                        value={filter.value}
                                    >
                                        {filter.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={onReset}
                                className="
                                    inline-flex
                                    h-11
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-zinc-950
                                    px-4
                                    text-sm
                                    font-bold
                                    text-zinc-300
                                    transition-colors
                                    hover:border-violet-500/50
                                    hover:text-white
                                "
                            >
                                <RefreshCw size={15} />
                            </button>

                            <div
                                className="
                                    inline-flex
                                    h-11
                                    w-fit
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-black
                                    p-1
                                "
                            >
                                {LIMITS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => onLimitChange(item)}
                                        className={`
                                            h-9
                                            min-w-10
                                            rounded-xl
                                            px-3
                                            text-xs
                                            font-black
                                            transition-colors

                                            ${limit === item
                                                ? "bg-emerald-500/20 text-emerald-200"
                                                : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                            }
                                        `}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            {fullGraphHref && (
                                <Link
                                    href={fullGraphHref}
                                    className="
                                        inline-flex
                                        h-11
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-2xl
                                        border
                                        border-zinc-800
                                        bg-zinc-950
                                        px-4
                                        text-sm
                                        font-bold
                                        text-zinc-300
                                        transition-colors
                                        hover:border-violet-500/50
                                        hover:text-white
                                    "
                                >
                                    <ExternalLink size={15} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {relatedNodes.length === 0 ? (
                <div className="p-5 text-sm leading-6 text-zinc-400">
                    No relations for this filter. Try selecting All.
                </div>
            ) : (
                <div className="h-[360px] w-full sm:h-[430px] lg:h-[500px]">
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        fitViewOptions={{
                            padding: 0.22
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
                                    : getGraphColor(data.node.node_type)
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

function getGraphNodeTitleParts(
    node: FormulaGraphNode
) {
    const label =
        getNodeLabel(node)

    if (node.node_type === "formula_code") {
        const parts =
            label.split(".")

        if (parts.length >= 2) {
            return {
                eyebrow: parts[0],
                title: parts.slice(1).join(".")
            }
        }

        return {
            eyebrow: "Formula Code",
            title: label
        }
    }

    if (
        node.node_type === "formula_json" ||
        node.node_type === "buff_json"
    ) {
        return {
            eyebrow: "JSON Formatted",
            title: node.ref_id || label
        }
    }

    if (node.node_type === "formula_id") {
        return {
            eyebrow: "Formula ID",
            title: node.ref_id || label
        }
    }

    return {
        eyebrow: formatNodeType(node.node_type),
        title: label
    }
}

export default function RelatedFormulaWidget({
    nodeType,
    refId,
    defaultNodeType = "", // default to all
    initialLimit = 10
}: Props) {

    const [
        selectedJsonNode,
        setSelectedJsonNode
    ] = useState<FormulaGraphNode | null>(null)

    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const [
        relations,
        setRelations
    ] = useState<FormulaGraphNodeRelations | null>(null)

    const [
        selectedNodeType,
        setSelectedNodeType
    ] = useState(defaultNodeType)

    const [
        limit,
        setLimit
    ] = useState(initialLimit)

    const [
        isLoading,
        setIsLoading
    ] = useState(true)

    const [
        error,
        setError
    ] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false

        async function fetchRelations() {
            try {
                setIsLoading(true)
                setError(null)

                const params =
                    new URLSearchParams()

                params.set("depth", "1")
                params.set("limit", String(limit))

                if (selectedNodeType) {
                    params.set("node_type", selectedNodeType)
                }

                const response =
                    await fetch(
                        `${API_URL}/api/v1/graph/nodes/${encodeURIComponent(nodeType)}/${encodeURIComponent(refId)}/relations?${params.toString()}`
                    )

                if (!response.ok) {
                    throw new Error("Failed to load related formulas")
                }

                const json =
                    await response.json() as ApiResponse<FormulaGraphNodeRelations>

                if (!ignore) {
                    setRelations(json.data)
                }
            } catch (err) {
                if (!ignore) {
                    setError(getApiErrorMessage(err))

                }
            } finally {
                if (!ignore) {
                    setIsLoading(false)
                }
            }
        }

        fetchRelations()

        return () => {
            ignore = true
        }
    }, [
        API_URL,
        nodeType,
        refId,
        selectedNodeType,
        limit
    ])

    return (
        <section
        >

            {isLoading && (
                <div
                    className="
                        mt-6
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        p-4
                        text-sm
                        text-zinc-400
                    "
                >
                    <Loader2
                        size={18}
                        className="animate-spin text-violet-300"
                    />
                    Loading relations...
                </div>
            )}

            {!isLoading && error && (
                <div
                    className="
                        mt-6
                        rounded-2xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        p-4
                        text-sm
                        text-red-200
                    "
                >
                    {error}
                </div>
            )}



            {!isLoading && !error && relations && (
                <RelationMiniGraph
                    relations={relations}
                    selectedNodeType={selectedNodeType}
                    onSelectNodeType={setSelectedNodeType}
                    limit={limit}
                    onLimitChange={setLimit}
                    onReset={() => {
                        setLimit(initialLimit)
                        setSelectedNodeType(defaultNodeType)
                    }}
                    onOpenJsonNode={setSelectedJsonNode}
                />
            )}

            <FormulaJsonModal
                node={selectedJsonNode}
                onClose={() => setSelectedJsonNode(null)}
            />
        </section>
    )
}