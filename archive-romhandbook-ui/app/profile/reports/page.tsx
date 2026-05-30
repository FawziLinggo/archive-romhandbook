"use client"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import Link from "next/link"

import {
    getApiErrorMessage
} from "@/lib/api-client"

import {
    ArrowLeft,
    Bug,
    Edit3,
    ExternalLink,
    Loader2,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    X
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"

import type {
    ApiResponse,
    UserReport
} from "@/lib/types/Community"

const TARGET_TYPES = [
    {
        label: "General",
        value: ""
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
        label: "Monster",
        value: "monster"
    },
    {
        label: "Skill",
        value: "skill"
    },
    {
        label: "Formula",
        value: "formula"
    },
    {
        label: "Thing",
        value: "thing"
    }
]

function emptyToNull(value: string) {
    const trimmed =
        value.trim()

    return trimmed === ""
        ? null
        : trimmed
}

function statusClass(status: string) {
    if (status === "open") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    }

    if (status === "resolved") {
        return "border-violet-500/30 bg-violet-500/10 text-violet-200"
    }

    if (status === "rejected") {
        return "border-red-500/30 bg-red-500/10 text-red-200"
    }

    return "border-zinc-700 bg-zinc-900 text-zinc-300"
}

function formatDate(value: string) {
    if (!value) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "en",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(
        new Date(value)
    )
}

export default function ProfileReportsPage() {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        isLoading: isAuthLoading,
        isAuthenticated,
        loginWithDiscord,

    } = useAuth()

    const [
        reports,
        setReports
    ] = useState<UserReport[]>([])

    const [
        selectedReport,
        setSelectedReport
    ] = useState<UserReport | null>(null)

    const [
        title,
        setTitle
    ] = useState("")

    const [
        body,
        setBody
    ] = useState("")

    const [
        targetType,
        setTargetType
    ] = useState("")

    const [
        targetId,
        setTargetId
    ] = useState("")

    const [
        targetUrl,
        setTargetUrl
    ] = useState("")

    const [
        isLoading,
        setIsLoading
    ] = useState(true)

    const [
        isSaving,
        setIsSaving
    ] = useState(false)

    const [
        message,
        setMessage
    ] = useState<string | null>(null)

    const [
        error,
        setError
    ] = useState<string | null>(null)

    const isEditing =
        Boolean(selectedReport)

    const openReports =
        useMemo(() => {
            return reports.filter((report) => report.status === "open").length
        }, [
            reports
        ])

    function resetForm() {
        setSelectedReport(null)
        setTitle("")
        setBody("")
        setTargetType("")
        setTargetId("")
        setTargetUrl("")
        setMessage(null)
        setError(null)
    }

    function editReport(report: UserReport) {
        setSelectedReport(report)
        setTitle(report.title)
        setBody(report.body)
        setTargetType(report.target_type || "")
        setTargetId(report.target_id || "")
        setTargetUrl(report.target_url || "")
        setMessage(null)
        setError(null)
    }

    async function loadReports() {
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/me/reports`,
                    {
                        credentials: "include"
                    }
                )

            const json =
                await response.json() as ApiResponse<UserReport[]>

            if (!response.ok) {
                throw new Error(json.message || "Failed to load reports")
            }

            setReports(json.data)
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    async function saveReport() {
        setIsSaving(true)
        setMessage(null)
        setError(null)

        try {
            const endpoint =
                selectedReport
                    ? `${API_URL}/api/v1/me/reports/${selectedReport.id}`
                    : `${API_URL}/api/v1/me/reports`

            const response =
                await fetch(
                    endpoint,
                    {
                        method: selectedReport
                            ? "PATCH"
                            : "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            title,
                            body,
                            target_type: emptyToNull(targetType),
                            target_id: emptyToNull(targetId),
                            target_url: emptyToNull(targetUrl)
                        })
                    }
                )

            const json =
                await response.json() as ApiResponse<UserReport>

            if (!response.ok) {
                throw new Error(json.message || "Failed to save report")
            }

            setMessage(
                selectedReport
                    ? "Report updated."
                    : "Bug report submitted."
            )

            resetForm()
            await loadReports()
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsSaving(false)
        }
    }

    async function deleteReport(report: UserReport) {
        const confirmed =
            window.confirm(
                `Delete report "${report.title}"?`
            )

        if (!confirmed) {
            return
        }

        setMessage(null)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/me/reports/${report.id}`,
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to delete report")
            }

            if (selectedReport?.id === report.id) {
                resetForm()
            }

            setMessage("Report deleted.")
            await loadReports()
        } catch (err) {
            setError(getApiErrorMessage(err))
        }
    }

    useEffect(() => {
        if (!isAuthLoading) {
            loadReports()
        }
    }, [
        isAuthLoading,
        isAuthenticated
    ])

    if (isAuthLoading || isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-center">
                    <Loader2
                        size={28}
                        className="mx-auto animate-spin text-violet-300"
                    />

                    <h1 className="mt-4 text-xl font-black text-white">
                        Loading Reports
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Preparing your bug report desk.
                    </p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-zinc-800 bg-black p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-200">
                        <Bug size={14} />
                        Report Bug
                    </div>

                    <h1 className="mt-4 text-3xl font-black text-white">
                        Login Required
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Please login with Discord before submitting bug reports.
                    </p>

                    <button
                        type="button"
                        onClick={loginWithDiscord}
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-500/10 px-5 text-sm font-black text-violet-200 hover:bg-violet-500/20"
                    >
                        Login Discord
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white"
                        >
                            <ArrowLeft size={15} />
                            Back to Profile
                        </Link>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-200">
                            <Bug size={14} />
                            Report Bug
                        </div>

                        <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                            Bug Reports
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            Send issues you find in archive data, pages, formulas, graph links, or broken UI behavior.
                        </p>
                    </div>



                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/profile"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-200 hover:bg-red-500/20"
                        >
                            <ArrowLeft size={15} />
                            Profile
                        </Link>

                        <button
                            type="button"
                            onClick={loadReports}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>


                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                            Total Reports
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {reports.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                            Open
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {openReports}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-violet-300">
                            Reviewed
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {reports.length - openReports}
                        </p>
                    </div>
                </div>
            </section>

            {(message || error) && (
                <div
                    className={`
                        rounded-2xl
                        border
                        px-4
                        py-3
                        text-sm
                        font-bold

                        ${error
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        }
                    `}
                >
                    {error || message}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-black text-white">
                            Your Reports
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                        >
                            <Plus size={15} />
                            Report New Issue
                        </button>
                    </div>

                    {reports.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-sm leading-6 text-zinc-400">
                            No bug reports yet. Use the form to submit your first one.
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {reports.map((report) => (
                                <article
                                    key={report.id}
                                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`
                                                        rounded-full
                                                        border
                                                        px-2.5
                                                        py-1
                                                        text-[11px]
                                                        font-black
                                                        uppercase

                                                        ${statusClass(report.status)}
                                                    `}
                                                >
                                                    {report.status}
                                                </span>

                                                {report.target_type && (
                                                    <span className="rounded-full border border-zinc-800 bg-black px-2.5 py-1 text-[11px] font-black uppercase text-zinc-400">
                                                        {report.target_type}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mt-3 break-words text-lg font-black text-white">
                                                {report.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                                                {report.body}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                                                <span>
                                                    Created {formatDate(report.created_at)}
                                                </span>

                                                {report.target_url && (
                                                    <a
                                                        href={report.target_url}
                                                        className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200"
                                                    >
                                                        Target
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                disabled={report.status !== "open"}
                                                onClick={() => editReport(report)}
                                                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-black px-3 text-sm font-bold text-zinc-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Edit3 size={15} />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={report.status !== "open"}
                                                onClick={() => deleteReport(report)}
                                                className="inline-flex h-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-sm font-bold text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-black text-white">
                                {isEditing
                                    ? "Edit Report"
                                    : "New Report"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Keep it short, specific, and include the page or item if possible.
                            </p>
                        </div>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Title
                            </label>

                            <input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={120}
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-red-500"
                                placeholder="Example: Card image is broken"
                            />

                            <p className="mt-1 text-xs text-zinc-600">
                                {title.length}/120 characters
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Related Type
                            </label>

                            <select
                                value={targetType}
                                onChange={(event) => setTargetType(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-red-500"
                            >
                                {TARGET_TYPES.map((item) => (
                                    <option
                                        key={item.label}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Target ID
                            </label>

                            <input
                                value={targetId}
                                onChange={(event) => setTargetId(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-red-500"
                                placeholder="Example: 23073"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Target URL
                            </label>

                            <input
                                value={targetUrl}
                                onChange={(event) => setTargetUrl(event.target.value)}
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-red-500"
                                placeholder="/things/sakray-card-23073"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Details
                            </label>

                            <textarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                maxLength={2000}
                                rows={7}
                                className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-red-500"
                                placeholder="What is wrong, where did you see it, and what should happen instead?"
                            />

                            <p className="mt-1 text-xs text-zinc-600">
                                {body.length}/2000 characters
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={saveReport}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {isEditing
                                ? "Save Report"
                                : "Submit Report"}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}