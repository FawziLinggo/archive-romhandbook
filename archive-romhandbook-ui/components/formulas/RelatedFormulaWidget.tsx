"use client"

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
    useEffect,
    useState
} from "react"

import type {
    ApiResponse,
    FormulaGraphNode,
    FormulaGraphNodeRelations
} from "@/lib/types/Formula"

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
        relations.nodes
            .filter((node) => node.node_key !== center.node_key)
            .slice(0, 6)

    const fullGraphHref =
        getFullGraphHref(relations)

    const markerId =
        `related-arrow-${center.node_key.replace(/[^a-zA-Z0-9_-]/g, "-")}`

    const width = 900
    const height = 420
    const centerX = 450
    const centerY = 220

    const positions = [
        {
            x: 190,
            y: 105
        },
        {
            x: 190,
            y: 315
        },
        {
            x: 710,
            y: 105
        },
        {
            x: 710,
            y: 315
        },
        {
            x: 450,
            y: 70
        },
        {
            x: 450,
            y: 360
        }
    ]

    const positionedNodes =
        relatedNodes.map((node, index) => ({
            node,
            ...positions[index]
        }))

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
                            Click a node to view its JSON payload. Use the filters to explore different relations.
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
                <div className="overflow-hidden">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="
                        h-[320px]
                        w-full
                        max-w-full

                        sm:h-[390px]
                        lg:h-[430px]
                    "
                        role="img"
                    >
                        <defs>
                            <marker
                                id={markerId}
                                markerWidth="8"
                                markerHeight="8"
                                refX="6"
                                refY="3"
                                orient="auto"
                                markerUnits="strokeWidth"
                            >
                                <path
                                    d="M0,0 L0,6 L7,3 z"
                                    fill="#52525b"
                                />
                            </marker>
                        </defs>

                        {positionedNodes.map((item) => {
                            const color =
                                getGraphColor(item.node.node_type)

                            return (
                                <g key={`edge-${item.node.node_key}`}>
                                    <path
                                        d={`M ${centerX} ${centerY} C ${centerX} ${item.y}, ${item.x} ${centerY}, ${item.x} ${item.y}`}
                                        fill="none"
                                        stroke={color}
                                        strokeOpacity="0.45"
                                        strokeWidth="2"
                                        strokeDasharray="5 6"
                                        markerEnd={`url(#${markerId})`}
                                    />
                                </g>
                            )
                        })}

                        <g>
                            <rect
                                x={centerX - 68}
                                y={centerY - 74}
                                width="136"
                                height="148"
                                rx="20"
                                fill="#100818"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                            />

                            {center.image ? (
                                <image
                                    href={center.image}
                                    x={centerX - 28}
                                    y={centerY - 48}
                                    width="56"
                                    height="56"
                                    preserveAspectRatio="xMidYMid meet"
                                />
                            ) : (
                                <circle
                                    cx={centerX}
                                    cy={centerY - 20}
                                    r="30"
                                    fill="#261247"
                                />
                            )}

                            <text
                                x={centerX}
                                y={centerY + 34}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="13"
                                fontWeight="900"
                            >
                                {truncateText(getNodeLabel(center), 15)}
                            </text>

                            <text
                                x={centerX}
                                y={centerY + 54}
                                textAnchor="middle"
                                fill="#a78bfa"
                                fontSize="11"
                                fontWeight="800"
                            >
                                {center.ref_id}
                            </text>
                        </g>

                        {positionedNodes.map((item) => {
                            const color =
                                getGraphColor(item.node.node_type)

                            const href =
                                getNodeHref(item.node)

                            const content = (
                                <g>
                                    <rect
                                        x={item.x - 112}
                                        y={item.y - 36}
                                        width="224"
                                        height="72"
                                        rx="16"
                                        fill="#09090b"
                                        stroke="#27272a"
                                    />

                                    <rect
                                        x={item.x - 98}
                                        y={item.y - 22}
                                        width="44"
                                        height="44"
                                        rx="12"
                                        fill="#050505"
                                        stroke={color}
                                        strokeOpacity="0.6"
                                    />

                                    {item.node.image ? (
                                        <image
                                            href={item.node.image}
                                            x={item.x - 92}
                                            y={item.y - 16}
                                            width="32"
                                            height="32"
                                            preserveAspectRatio="xMidYMid meet"
                                        />
                                    ) : (
                                        <text
                                            x={item.x - 76}
                                            y={item.y + 5}
                                            textAnchor="middle"
                                            fill={color}
                                            fontSize="13"
                                            fontWeight="900"
                                        >
                                            {getNodeInitial(item.node.node_type)}
                                        </text>
                                    )}

                                    {(() => {
                                        const parts =
                                            getGraphNodeTitleParts(item.node)

                                        return (
                                            <>
                                                <text
                                                    x={item.x - 42}
                                                    y={item.y - 7}
                                                    fill={color}
                                                    fontSize="11"
                                                    fontWeight="800"
                                                >
                                                    {truncateText(parts.eyebrow, 20)}
                                                </text>

                                                <text
                                                    x={item.x - 42}
                                                    y={item.y + 14}
                                                    fill="#ffffff"
                                                    fontSize="13"
                                                    fontWeight="900"
                                                >
                                                    {truncateText(parts.title, 18)}
                                                </text>
                                            </>
                                        )
                                    })()}
                                </g>
                            )

                            if (canOpenJson(item.node)) {
                                return (
                                    <g
                                        key={item.node.node_key}
                                        role="button"
                                        tabIndex={0}
                                        className="cursor-pointer"
                                        onClick={() => onOpenJsonNode(item.node)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                onOpenJsonNode(item.node)
                                            }
                                        }}
                                    >
                                        {content}

                                        <title>
                                            Open JSON
                                        </title>
                                    </g>
                                )
                            }

                            if (!href) {
                                return (
                                    <g key={item.node.node_key}>
                                        {content}
                                    </g>
                                )
                            }

                            return (
                                <a
                                    key={item.node.node_key}
                                    href={href}
                                >
                                    {content}
                                </a>
                            )
                        })}
                    </svg>
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
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load related formulas"
                    )
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