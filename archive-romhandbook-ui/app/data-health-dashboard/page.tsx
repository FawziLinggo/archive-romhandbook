import {
    Activity,
    AlertTriangle,
    Database,
    GitBranch,
    Search,
    ShieldCheck
} from "lucide-react"

import type {
    DataHealthDashboard,
    DataHealthResponse,
    DataHealthTableMetric
} from "@/lib/types/DataHealth"

function numberFormat(value: number) {
    return value.toLocaleString("en-US")
}

function issueClass(value: number) {
    if (value === 0) {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-200"
}

function MetricCard({
    title,
    value,
    tone = "neutral"
}: {
    title: string
    value: number
    tone?: "neutral" | "good" | "warn"
}) {
    const toneClass = {
        neutral: "border-zinc-800 bg-zinc-950/70 text-white",
        good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
        warn: "border-amber-500/30 bg-amber-500/10 text-amber-100"
    }[tone]

    return (
        <div className={`rounded-2xl border p-4 ${toneClass}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {title}
            </p>
            <p className="mt-2 text-2xl font-black">
                {numberFormat(value)}
            </p>
        </div>
    )
}

function IssuePill({
    label,
    value
}: {
    label: string
    value: number
}) {
    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-xs
                font-bold
                ${issueClass(value)}
            `}
        >
            {label}: {numberFormat(value)}
        </span>
    )
}

function TableHealthCard({
    table
}: {
    table: DataHealthTableMetric
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="break-words text-base font-black text-white">
                        {table.table}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {table.thing_type || "not indexed in things"}
                    </p>
                </div>

                <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-300">
                    {numberFormat(table.total)}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <IssuePill label="raw" value={table.raw_html_missing} />
                <IssuePill label="url" value={table.detail_url_missing} />
                <IssuePill label="img" value={table.image_missing} />

                {table.indexed_in_things && (
                    <>
                        <IssuePill label="missing things" value={table.missing_things} />
                        <IssuePill label="conflict" value={table.thing_conflicts} />
                    </>
                )}
            </div>
        </div>
    )
}

async function getDataHealth(): Promise<DataHealthDashboard> {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const res =
        await fetch(
            `${API_URL}/api/v1/data-health/dashboard`,
            {
                cache: "no-store"
            }
        )

    if (!res.ok) {
        throw new Error("Failed to fetch data health dashboard")
    }

    const json =
        await res.json() as DataHealthResponse

    return json.data
}

export default async function DataHealthDashboardPage() {
    const health =
        await getDataHealth()

    const summary =
        health.summary

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                    <ShieldCheck size={14} />
                    Internal Data Health
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
                    Data Health Dashboard
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                    Monitor crawler coverage, things index integrity, search index, and formula graph data.
                </p>
            </div>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Rows" value={summary.total_rows} />
                <MetricCard title="Things Index" value={summary.things_total} />
                <MetricCard title="Search Rows" value={summary.search_rows} />
                <MetricCard title="Graph Edges" value={summary.graph_edges} />
                <MetricCard title="Missing Things" value={summary.missing_things} tone={summary.missing_things > 0 ? "warn" : "good"} />
                <MetricCard title="Thing Conflicts" value={summary.thing_conflicts} tone={summary.thing_conflicts > 0 ? "warn" : "good"} />
                <MetricCard title="Raw HTML Missing" value={summary.raw_html_missing} tone={summary.raw_html_missing > 0 ? "warn" : "good"} />
                <MetricCard title="Unknown Links" value={summary.unknown_links} tone={summary.unknown_links > 0 ? "warn" : "good"} />
            </section>

            <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/40 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                    <Database size={18} className="text-violet-300" />
                    <h2 className="text-xl font-black text-white">
                        Table Coverage
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:hidden">
                    {health.tables.map((table) => (
                        <TableHealthCard key={table.table} table={table} />
                    ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[960px] text-left text-sm">
                        <thead className="text-xs uppercase text-zinc-500">
                            <tr>
                                <th className="px-3 py-3">Table</th>
                                <th className="px-3 py-3">Type</th>
                                <th className="px-3 py-3">Total</th>
                                <th className="px-3 py-3">Raw Missing</th>
                                <th className="px-3 py-3">URL Missing</th>
                                <th className="px-3 py-3">Image Missing</th>
                                <th className="px-3 py-3">Missing Things</th>
                                <th className="px-3 py-3">Conflicts</th>
                            </tr>
                        </thead>

                        <tbody>
                            {health.tables.map((table) => (
                                <tr key={table.table} className="border-t border-zinc-800">
                                    <td className="px-3 py-3 font-bold text-white">{table.table}</td>
                                    <td className="px-3 py-3 text-zinc-400">{table.thing_type || "-"}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.total)}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.raw_html_missing)}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.detail_url_missing)}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.image_missing)}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.missing_things)}</td>
                                    <td className="px-3 py-3 text-zinc-200">{numberFormat(table.thing_conflicts)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border border-zinc-800 bg-black p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-300" />
                        <h2 className="text-lg font-black text-white">
                            Things By Type
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {health.thing_type_counts.map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                                <span className="min-w-0 break-words text-sm font-bold text-zinc-200">
                                    {item.name}
                                </span>
                                <span className="text-sm font-black text-white">
                                    {numberFormat(item.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-black p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <Search size={18} className="text-sky-300" />
                        <h2 className="text-lg font-black text-white">
                            Search Index
                        </h2>
                    </div>

                    <p className="mb-3 text-2xl font-black text-white">
                        {numberFormat(health.search_index.total)}
                    </p>

                    <div className="space-y-2">
                        {health.search_index.by_type.map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                                <span className="text-sm font-bold text-zinc-200">{item.name}</span>
                                <span className="text-sm font-black text-white">{numberFormat(item.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-black p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <GitBranch size={18} className="text-violet-300" />
                        <h2 className="text-lg font-black text-white">
                            Formula Graph
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard title="Nodes" value={health.formula_graph.nodes} />
                        <MetricCard title="Edges" value={health.formula_graph.edges} />
                    </div>

                    <div className="mt-3 space-y-2">
                        {health.formula_graph.nodes_by_type.slice(0, 10).map((item) => (
                            <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3 py-2">
                                <span className="text-sm font-bold text-zinc-200">{item.name}</span>
                                <span className="text-sm font-black text-white">{numberFormat(item.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <details className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4" open>
                    <summary className="flex cursor-pointer items-center gap-2 text-lg font-black text-amber-100">
                        <AlertTriangle size={18} />
                        Thing Conflicts
                    </summary>

                    <div className="mt-4 space-y-2">
                        {health.thing_conflicts.length === 0 ? (
                            <p className="text-sm text-zinc-400">
                                No conflicts found.
                            </p>
                        ) : (
                            health.thing_conflicts.map((item) => (
                                <div key={`${item.source_table}-${item.existing_type}`} className="rounded-2xl border border-zinc-800 bg-black p-3">
                                    <p className="break-words text-sm font-black text-white">
                                        {item.source_table}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        expected {item.expected_type}, found {item.existing_type}
                                    </p>
                                    <p className="mt-2 text-lg font-black text-amber-200">
                                        {numberFormat(item.total)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </details>

                <details className="rounded-3xl border border-zinc-800 bg-black p-4">
                    <summary className="cursor-pointer text-lg font-black text-white">
                        Unknown Crawler Links
                    </summary>

                    <div className="mt-4 space-y-2">
                        {health.unknown_link_types.map((item) => (
                            <div key={`${item.detected_types}-${item.sample_path}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="min-w-0 break-words text-sm font-bold text-zinc-200">
                                        {item.detected_types || "No detected type"}
                                    </p>
                                    <span className="shrink-0 rounded-full bg-black px-2 py-1 text-xs font-black text-white">
                                        {numberFormat(item.total)}
                                    </span>
                                </div>

                                <p className="mt-2 break-all text-xs text-zinc-500">
                                    {item.sample_path}
                                </p>
                            </div>
                        ))}
                    </div>
                </details>
            </section>
        </main>
    )
}