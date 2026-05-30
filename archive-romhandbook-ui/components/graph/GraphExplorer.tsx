"use client"

import Link from "next/link"


import {
    ExternalLink,
    GitBranch,
    Loader2,
    Lock,
    LogIn,
    Plus,
    RefreshCw,
    Search,
    X
} from "lucide-react"

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react"

import {
    useAuth
} from "@/contexts/AuthContext"




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
    Prism as SyntaxHighlighter
} from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/cjs/styles/prism"

import type {
    ApiResponse,
    FormulaGraphEdge,
    FormulaGraphNode,
    FormulaGraphNodeRelations
} from "@/lib/types/Formula"
import { assetUrl } from "@/lib/utils"

type GraphMeta = {
    node_types: {
        node_type: string
        total: number
    }[]
    edge_types: {
        edge_type: string
        total: number
    }[]
}

const NODE_FILTERS = [
    {
        label: "Core",
        value: "formula_code,skill,card,equipment,headwear,buff"
    },
    {
        label: "Items",
        value: "card,equipment,headwear,skill,monster,crafting_material,furniture,mount,pet,pet_egg"
    },
    {
        label: "JSON",
        value: "formula_json,buff_json,formula_id"
    },
    {
        label: "All",
        value: ""
    }
]

const SEARCH_TYPES = [
    {
        label: "All",
        value: ""
    },
    {
        label: "Formula",
        value: "formula_code"
    },
    {
        label: "Skill",
        value: "skill"
    },
    {
        label: "Card",
        value: "card"
    },
    {
        label: "Equipment",
        value: "equipment"
    },
    {
        label: "Headwear",
        value: "headwear"
    },
    {
        label: "Buff",
        value: "buff"
    }
]

function formatType(value: string) {
    return value
        .split("_")
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(" ")
}

function getNodeLabel(node: FormulaGraphNode) {
    return node.label || node.ref_id || node.node_key
}

function getNodeHref(node: FormulaGraphNode) {
    if (!node.detail_url) {
        return null
    }

    if (node.detail_url.startsWith("/")) {
        return node.detail_url
    }

    return `/${node.detail_url}`
}

function getColor(type: string) {
    const colors: Record<string, string> = {
        formula_code: "#a78bfa",
        formula_json: "#34d399",
        formula_id: "#fbbf24",
        skill: "#22c55e",
        card: "#a78bfa",
        equipment: "#34d399",
        headwear: "#f472b6",
        buff: "#60a5fa",
        buff_json: "#818cf8",
        monster: "#f87171",
        crafting_material: "#2dd4bf",
        furniture: "#fb923c",
        external_id: "#94a3b8"
    }

    return colors[type] || "#a1a1aa"
}

function nodeInitial(type: string) {
    return type
        .split("_")
        .map((item) => item.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
}

function formatJson(node: FormulaGraphNode) {
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

        return JSON.stringify(parsed, null, 2)
    } catch {
        return node.meta_json
    }
}

function JsonModal({
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
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
            onClick={onClose}
        >
            <div
                className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-wide text-violet-300">
                            {formatType(node.node_type)}
                        </div>
                        <h3 className="mt-1 break-words text-xl font-black text-white">
                            {getNodeLabel(node)}
                        </h3>
                        <div className="mt-1 break-all text-xs text-zinc-500">
                            {node.ref_id}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-black text-zinc-400 hover:text-white"
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
                        {formatJson(node)}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    )
}

function buildInitialPositions(
    nodes: FormulaGraphNode[],
    centerNode: FormulaGraphNode | null
) {
    const positions: Record<string, { x: number; y: number }> = {}

    if (!centerNode) {
        return positions
    }

    positions[centerNode.node_key] = {
        x: 0,
        y: 0
    }

    const typeOrder = [
        "formula_code",
        "skill",
        "card",
        "equipment",
        "headwear",
        "buff",
        "buff_json",
        "formula_json",
        "formula_id",
        "monster",
        "crafting_material",
        "furniture",
        "external_id"
    ]

    const grouped =
        new Map<string, FormulaGraphNode[]>()

    nodes
        .filter((node) => node.node_key !== centerNode.node_key)
        .forEach((node) => {
            const list =
                grouped.get(node.node_type) || []

            list.push(node)
            grouped.set(node.node_type, list)
        })

    const groups =
        Array.from(grouped.entries())
            .sort((a, b) => {
                const indexA =
                    typeOrder.indexOf(a[0])

                const indexB =
                    typeOrder.indexOf(b[0])

                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
            })

    groups.forEach(([, items], columnIndex) => {
        const side =
            columnIndex % 2 === 0 ? -1 : 1

        const ring =
            Math.floor(columnIndex / 2) + 1

        const x =
            side * ring * 330

        const gapY =
            118

        const startY =
            -((items.length - 1) * gapY) / 2

        items.forEach((node, rowIndex) => {
            positions[node.node_key] = {
                x,
                y: startY + rowIndex * gapY
            }
        })
    })

    return positions
}

function ArchiveGraphNode({
    data
}: any) {
    const node =
        data.node as FormulaGraphNode

    const active =
        Boolean(data.active)

    const expanded =
        Boolean(data.expanded)

    const color =
        getColor(node.node_type)

    return (
        <div
            className={`
                relative
                flex
                w-[230px]
                items-center
                gap-3
                rounded-2xl
                border
                bg-zinc-950
                p-3
                shadow-2xl
                shadow-black/40

                ${active
                    ? "border-violet-500"
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
                        {nodeInitial(node.node_type)}
                    </span>
                )}
            </div>

            <div className="min-w-0">
                <div className="truncate text-sm font-black text-white">
                    {getNodeLabel(node)}
                </div>

                <div
                    className="mt-1 text-xs font-black"
                    style={{
                        color
                    }}
                >
                    {formatType(node.node_type)}
                </div>
            </div>

            {expanded && (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            )}

            <Handle
                type="source"
                position={Position.Right}
                className="!h-2.5 !w-2.5 !border-0 !bg-zinc-500"
            />
        </div>
    )
}

function GraphCanvas({
    nodes,
    edges,
    centerNode,
    selectedNode,
    expandedKeys,
    onSelectNode
}: {
    nodes: FormulaGraphNode[]
    edges: FormulaGraphEdge[]
    centerNode: FormulaGraphNode | null
    selectedNode: FormulaGraphNode | null
    expandedKeys: Set<string>
    onSelectNode: (node: FormulaGraphNode) => void
}) {

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
                archive: ArchiveGraphNode
            }),
            []
        )

    const nodeLookup =
        useMemo(() => {
            const map =
                new Map<string, FormulaGraphNode>()

            nodes.forEach((node) => {
                map.set(node.node_key, node)
            })

            return map
        }, [
            nodes
        ])

    useEffect(() => {
        setFlowNodes((current) => {
            const currentPositions =
                new Map(
                    current.map((node) => [
                        node.id,
                        node.position
                    ])
                )

            const generated =
                buildInitialPositions(nodes, centerNode)

            return nodes.map((node) => ({
                id: node.node_key,
                type: "archive",
                position:
                    currentPositions.get(node.node_key) ||
                    generated[node.node_key] ||
                    {
                        x: 0,
                        y: 0
                    },
                data: {
                    node,
                    active: selectedNode?.node_key === node.node_key,
                    expanded: expandedKeys.has(node.node_key)
                },
                draggable: true
            }))
        })
    }, [
        nodes,
        centerNode,
        selectedNode,
        expandedKeys,
        setFlowNodes
    ])

    useEffect(() => {
        setFlowEdges(
            edges
                .filter((edge) => {
                    return nodeLookup.has(edge.from_node_key) &&
                        nodeLookup.has(edge.to_node_key)
                })
                .map((edge) => {
                    const target =
                        nodeLookup.get(edge.to_node_key)

                    const color =
                        getColor(target?.node_type || "")

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
        edges,
        nodeLookup,
        setFlowEdges
    ])

    if (!centerNode) {
        return (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-zinc-800 bg-black p-6 text-center text-zinc-500">
                Search and select a node to begin exploring.
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">
            <div className="h-[560px] w-full sm:h-[680px]">
                <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) => {
                        onSelectNode(
                            (node.data as { node: FormulaGraphNode }).node
                        )
                    }}
                    fitView
                    fitViewOptions={{
                        padding: 0.25
                    }}
                    minZoom={0.15}
                    maxZoom={1.6}
                    nodesDraggable
                    nodesConnectable={false}
                    elementsSelectable
                    proOptions={{
                        hideAttribution: true
                    }}
                >
                    <Background
                        color="#3f3f46"
                        gap={24}
                    />

                    <MiniMap
                        pannable
                        zoomable
                        nodeColor={(node) => {
                            const data =
                                node.data as { node: FormulaGraphNode }

                            return getColor(data.node.node_type)
                        }}
                        maskColor="rgba(0,0,0,0.72)"
                        className="!bg-zinc-950 !border !border-zinc-800"
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
        </div>
    )
}



export default function GraphExplorer() {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        loginWithDiscord
    } = useAuth()

    const [
        authRequired,
        setAuthRequired
    ] = useState(false)

    const [
        graphError,
        setGraphError
    ] = useState<string | null>(null)

    const readGraphResponse =
        useCallback(
            async <T,>(
                response: Response
            ): Promise<T | null> => {
                const json =
                    await response
                        .json()
                        .catch(
                            () => null
                        )

                if (response.status === 401) {
                    setAuthRequired(true)
                    setGraphError(null)

                    return null
                }

                if (!response.ok) {
                    setAuthRequired(false)

                    throw new Error(
                        json?.message || "Graph request failed"
                    )
                }

                setAuthRequired(false)
                setGraphError(null)

                return json as T
            },
            []
        )

    const [
        expandNodeFilter,
        setExpandNodeFilter
    ] = useState("")

    const [
        expandEdgeFilter,
        setExpandEdgeFilter
    ] = useState("")

    const [
        expandLimit,
        setExpandLimit
    ] = useState(30)

    const [
        graphHistory,
        setGraphHistory
    ] = useState<{
        nodesByKey: Record<string, FormulaGraphNode>
        edgesById: Record<string, FormulaGraphEdge>
        expandedKeys: Set<string>
        selectedNode: FormulaGraphNode | null
    }[]>([])

    const [
        meta,
        setMeta
    ] = useState<GraphMeta | null>(null)

    const [
        query,
        setQuery
    ] = useState("")

    const [
        searchType,
        setSearchType
    ] = useState("")

    const [
        searchResults,
        setSearchResults
    ] = useState<FormulaGraphNode[]>([])

    const [
        isSearching,
        setIsSearching
    ] = useState(false)

    const [
        nodeFilter,
        setNodeFilter
    ] = useState(NODE_FILTERS[0].value)

    const [
        edgeFilter,
        setEdgeFilter
    ] = useState("")

    const [
        limit,
        setLimit
    ] = useState(80)

    const [
        depth,
        setDepth
    ] = useState(1)

    const [
        centerNode,
        setCenterNode
    ] = useState<FormulaGraphNode | null>(null)

    const [
        selectedNode,
        setSelectedNode
    ] = useState<FormulaGraphNode | null>(null)

    const [
        nodesByKey,
        setNodesByKey
    ] = useState<Record<string, FormulaGraphNode>>({})

    const [
        edgesById,
        setEdgesById
    ] = useState<Record<string, FormulaGraphEdge>>({})

    const [
        expandedKeys,
        setExpandedKeys
    ] = useState<Set<string>>(new Set())

    const [
        isExpanding,
        setIsExpanding
    ] = useState(false)

    const [
        jsonNode,
        setJsonNode
    ] = useState<FormulaGraphNode | null>(null)

    useEffect(() => {
        async function loadMeta() {
            try {
                const response =
                    await fetch(
                        `${API_URL}/api/v1/graph/meta`,
                        {
                            credentials: "include"
                        }
                    )

                const json =
                    await readGraphResponse<ApiResponse<GraphMeta>>(
                        response
                    )

                if (!json) {
                    return
                }

                setMeta(
                    json.data
                )
            } catch (error) {
                setGraphError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load graph metadata"
                )
            }
        }

        loadMeta()
    }, [
        API_URL,
        readGraphResponse
    ])
    useEffect(() => {
        const timer =
            window.setTimeout(async () => {
                if (query.trim().length < 2) {
                    setSearchResults([])
                    return
                }

                setIsSearching(true)

                const params =
                    new URLSearchParams()

                params.set("query", query)
                params.set("limit", "12")

                if (searchType) {
                    params.set("node_type", searchType)
                }

                try {
                    const response =
                        await fetch(
                            `${API_URL}/api/v1/graph/search/nodes?${params.toString()}`,
                            {
                                credentials: "include"
                            }
                        )

                    const json =
                        await readGraphResponse<ApiResponse<FormulaGraphNode[]>>(
                            response
                        )

                    if (!json) {
                        setSearchResults([])

                        return
                    }

                    setSearchResults(
                        Array.isArray(json.data)
                            ? json.data
                            : []
                    )
                } catch (error) {
                    setSearchResults([])

                    setGraphError(
                        error instanceof Error
                            ? error.message
                            : "Failed to search graph nodes"
                    )
                } finally {
                    setIsSearching(false)
                }
            }, 250)

        return () => window.clearTimeout(timer)
    }, [
        API_URL,
        query,
        searchType,
        readGraphResponse
    ])

    const nodes =
        useMemo(() => Object.values(nodesByKey), [nodesByKey])

    const edges =
        useMemo(() => Object.values(edgesById), [edgesById])


    function undoExpand() {
        setGraphHistory((current) => {
            const previous =
                current[current.length - 1]

            if (!previous) {
                return current
            }

            setNodesByKey(previous.nodesByKey)
            setEdgesById(previous.edgesById)
            setExpandedKeys(previous.expandedKeys)
            setSelectedNode(previous.selectedNode)

            return current.slice(0, -1)
        })
    }

    async function expandNode(
        node: FormulaGraphNode,
        reset = false
    ) {
        setIsExpanding(true)

        if (!reset) {
            setGraphHistory((current) => [
                ...current,
                {
                    nodesByKey,
                    edgesById,
                    expandedKeys: new Set(expandedKeys),
                    selectedNode
                }
            ])
        }

        const params =
            new URLSearchParams()

        params.set("depth", String(depth))
        params.set("limit", String(reset ? limit : expandLimit))

        const activeNodeFilter =
            reset ? nodeFilter : expandNodeFilter

        const activeEdgeFilter =
            reset ? edgeFilter : expandEdgeFilter

        if (activeNodeFilter) {
            params.set("node_type", activeNodeFilter)
        }

        if (activeEdgeFilter) {
            params.set("edge_type", activeEdgeFilter)
        }

        const response =
            await fetch(
                `${API_URL}/api/v1/graph/nodes/${encodeURIComponent(node.node_type)}/${encodeURIComponent(node.ref_id)}/relations?${params.toString()}`,
                {
                    credentials: "include"
                }
            )

        const json =
            await readGraphResponse<ApiResponse<FormulaGraphNodeRelations>>(
                response
            )

        if (!json) {
            setIsExpanding(false)

            return
        }

        const nextNodes =
            reset ? {} : { ...nodesByKey }

        const nextEdges =
            reset ? {} : { ...edgesById }

        json.data.nodes.forEach((item) => {
            nextNodes[item.node_key] = item
        })

        json.data.edges.forEach((item) => {
            nextEdges[String(item.id)] = item
        })

        setNodesByKey(nextNodes)
        setEdgesById(nextEdges)
        setSelectedNode(node)
        setExpandedKeys((current) => new Set(current).add(node.node_key))
        setIsExpanding(false)
    }

    function startFromNode(node: FormulaGraphNode) {
        setCenterNode(node)
        setSelectedNode(node)
        setExpandedKeys(new Set())
        expandNode(node, true)
    }

    function resetGraph() {
        setCenterNode(null)
        setSelectedNode(null)
        setNodesByKey({})
        setEdgesById({})
        setExpandedKeys(new Set())
        setGraphHistory([])
    }

    if (authRequired) {
        return (
            <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
                <div className="w-full rounded-3xl border border-violet-500/30 bg-black p-6 shadow-2xl shadow-violet-950/20 sm:p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-200">
                        <Lock size={24} />
                    </div>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                        <GitBranch size={14} />
                        Formula Graph Explorer
                    </div>

                    <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
                        Login Required
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                        Graph Explorer is only available to authenticated users.
                        Please login with your Discord account to access the graph data and start exploring the relations between formulas, skills, cards, equipment, buffs, and more.
                    </p>

                    <button
                        type="button"
                        onClick={loginWithDiscord}
                        className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/15 px-5 text-sm font-black text-violet-100 transition-colors hover:bg-violet-500/25 sm:w-auto"
                    >
                        <LogIn size={17} />
                        Login Discord
                    </button>
                </div>
            </div>
        )
    }

    return (


        <div className="mx-auto max-w-[1600px] space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-6">


                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                            <GitBranch size={14} />
                            Formula Graph Explorer
                        </div>

                        <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                            Explore Archive Relations
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Search a node, expand its neighbors, and follow formulas across skills, cards, equipment, buffs, and JSON data.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={resetGraph}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                    >
                        <RefreshCw size={15} />
                        Reset Graph
                    </button>
                </div>


                {graphError && !authRequired && (
                    <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
                        {graphError}
                    </div>
                )}

                <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search formula, skill, card, equipment, headwear..."
                            className="h-12 w-full rounded-2xl border border-zinc-800 bg-black pl-11 pr-4 text-sm font-bold text-white outline-none focus:border-violet-500"
                        />
                    </div>

                    <select
                        value={searchType}
                        onChange={(event) => setSearchType(event.target.value)}
                        className="h-12 rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200 outline-none focus:border-violet-500"
                    >
                        {SEARCH_TYPES.map((item) => (
                            <option
                                key={item.label}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {(isSearching || (searchResults?.length ?? 0) > 0) && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {isSearching && (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                                <Loader2 className="inline animate-spin" size={16} /> Searching...
                            </div>
                        )}

                        {(searchResults ?? []).map((node) => (
                            <button
                                key={node.node_key}
                                type="button"
                                onClick={() => startFromNode(node)}
                                className="flex min-w-0 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-left hover:border-violet-500/50"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-black">
                                    {node.image ? (
                                        <img src={assetUrl(node.image)} alt={getNodeLabel(node)} className="h-7 w-7 object-contain" />
                                    ) : (
                                        <span className="text-xs font-black text-violet-300">
                                            {nodeInitial(node.node_type)}
                                        </span>
                                    )}
                                </span>

                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-black text-white">
                                        {getNodeLabel(node)}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-500">
                                        {formatType(node.node_type)}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <select value={nodeFilter} onChange={(event) => setNodeFilter(event.target.value)} className="h-11 rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200">
                        {NODE_FILTERS.map((item) => (
                            <option key={item.label} value={item.value}>{item.label}</option>
                        ))}
                    </select>

                    <select value={edgeFilter} onChange={(event) => setEdgeFilter(event.target.value)} className="h-11 rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200">
                        <option value="">All Edge Types</option>
                        {meta?.edge_types.map((item) => (
                            <option key={item.edge_type} value={item.edge_type}>
                                {item.edge_type}
                            </option>
                        ))}
                    </select>

                    <select value={depth} onChange={(event) => setDepth(Number(event.target.value))} className="h-11 rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200">
                        <option value={1}>Depth 1</option>
                        <option value={2}>Depth 2</option>
                    </select>

                    <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="h-11 rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200">
                        <option value={50}>Limit 50</option>
                        <option value={80}>Limit 80</option>
                        <option value={120}>Limit 120</option>
                        <option value={250}>Limit 250</option>
                    </select>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    centerNode={centerNode}
                    selectedNode={selectedNode}
                    expandedKeys={expandedKeys}
                    onSelectNode={setSelectedNode}
                />

                <aside className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                    <h2 className="text-lg font-black text-white">
                        Selected Node
                    </h2>

                    {!selectedNode ? (
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            Click a node in the graph to inspect or expand it.
                        </p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
                                    {selectedNode.image ? (
                                        <img src={assetUrl(selectedNode.image)} alt={getNodeLabel(selectedNode)} className="h-9 w-9 object-contain" />
                                    ) : (
                                        <span className="font-black text-violet-300">
                                            {nodeInitial(selectedNode.node_type)}
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="break-words text-sm font-black text-white">
                                        {getNodeLabel(selectedNode)}
                                    </div>
                                    <div className="mt-1 text-xs text-zinc-500">
                                        {formatType(selectedNode.node_type)}
                                    </div>
                                </div>
                            </div>

                            <div className="break-all rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-500">
                                {selectedNode.node_key}
                            </div>

                            <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                                <div className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                    Expand Filter
                                </div>

                                <select
                                    value={expandNodeFilter}
                                    onChange={(event) => setExpandNodeFilter(event.target.value)}
                                    className="h-10 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs font-bold text-zinc-200 outline-none focus:border-violet-500"
                                >
                                    <option value="">All Node Types</option>
                                    <option value="formula_code">Formula Code</option>
                                    <option value="skill">Skill</option>
                                    <option value="card">Card</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="headwear">Headwear</option>
                                    <option value="buff">Buff</option>
                                    <option value="formula_json">Formula JSON</option>
                                    <option value="buff_json">Buff JSON</option>
                                    <option value="monster">Monster</option>
                                    <option value="crafting_material">Crafting Material</option>
                                </select>

                                <select
                                    value={expandEdgeFilter}
                                    onChange={(event) => setExpandEdgeFilter(event.target.value)}
                                    className="h-10 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs font-bold text-zinc-200 outline-none focus:border-violet-500"
                                >
                                    <option value="">All Edge Types</option>

                                    {meta?.edge_types.map((item) => (
                                        <option
                                            key={item.edge_type}
                                            value={item.edge_type}
                                        >
                                            {item.edge_type}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={expandLimit}
                                    onChange={(event) => setExpandLimit(Number(event.target.value))}
                                    className="h-10 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs font-bold text-zinc-200 outline-none focus:border-violet-500"
                                >
                                    <option value={10}>Limit 10</option>
                                    <option value={20}>Limit 20</option>
                                    <option value={30}>Limit 30</option>
                                    <option value={50}>Limit 50</option>
                                    <option value={80}>Limit 80</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                disabled={isExpanding}
                                onClick={() => expandNode(selectedNode)}
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 text-sm font-black text-violet-200 hover:bg-violet-500/20 disabled:opacity-50"
                            >
                                {isExpanding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Expand Node
                            </button>

                            <button
                                type="button"
                                disabled={graphHistory.length === 0}
                                onClick={undoExpand}
                                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Undo Last Expand
                            </button>

                            {selectedNode.meta_json && (
                                <button
                                    type="button"
                                    onClick={() => setJsonNode(selectedNode)}
                                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-300 hover:text-white"
                                >
                                    Inspect JSON
                                </button>
                            )}

                            {getNodeHref(selectedNode) && (
                                <Link
                                    href={getNodeHref(selectedNode)!}
                                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-300 hover:text-white"
                                >
                                    Open Detail
                                    <ExternalLink size={15} />
                                </Link>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                                    <div className="text-xs text-zinc-500">Nodes</div>
                                    <div className="mt-1 text-2xl font-black text-white">{nodes.length}</div>
                                </div>

                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                                    <div className="text-xs text-zinc-500">Edges</div>
                                    <div className="mt-1 text-2xl font-black text-white">{edges.length}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            <JsonModal
                node={jsonNode}
                onClose={() => setJsonNode(null)}
            />
        </div>
    )
}

