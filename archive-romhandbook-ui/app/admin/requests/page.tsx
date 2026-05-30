"use client"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import Link from "next/link"

import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Copy,
    Lightbulb,
    Loader2,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    XCircle
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"
import { getApiErrorMessage } from "@/lib/api-client"

type FeatureRequest = {
    id: string
    user_id: string
    user_name: string | null
    user_email: string | null
    title: string
    body: string
    status: string
    created_at: string
    updated_at: string
}

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
}

const STATUS_FILTERS = [
    { label: "All", value: "" },
    { label: "Open", value: "open" },
    { label: "Reviewing", value: "reviewing" },
    { label: "Accepted", value: "accepted" },
    { label: "Planned", value: "planned" },
    { label: "Done", value: "done" },
    { label: "Rejected", value: "rejected" },
    { label: "Duplicate", value: "duplicate" }
]

const REVIEW_ACTIONS = [
    {
        label: "Reviewing",
        value: "reviewing",
        icon: Clock3,
        className: "border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20"
    },
    {
        label: "Accepted",
        value: "accepted",
        icon: CheckCircle2,
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
    },
    {
        label: "Planned",
        value: "planned",
        icon: Sparkles,
        className: "border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
    },
    {
        label: "Done",
        value: "done",
        icon: CheckCircle2,
        className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
    },
    {
        label: "Duplicate",
        value: "duplicate",
        icon: Copy,
        className: "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
    },
    {
        label: "Rejected",
        value: "rejected",
        icon: XCircle,
        className: "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
    }
]

function statusClass(status: string) {
    if (status === "open") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    }

    if (status === "reviewing") {
        return "border-sky-500/30 bg-sky-500/10 text-sky-200"
    }

    if (status === "accepted" || status === "planned") {
        return "border-violet-500/30 bg-violet-500/10 text-violet-200"
    }

    if (status === "done") {
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
    }

    if (status === "duplicate") {
        return "border-amber-500/30 bg-amber-500/10 text-amber-200"
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
    ).format(new Date(value))
}

export default function AdminRequestsPage() {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        user,
        isLoading: isAuthLoading,
        isAuthenticated,
        loginWithDiscord
    } = useAuth()

    const [
        requests,
        setRequests
    ] = useState<FeatureRequest[]>([])

    const [
        status,
        setStatus
    ] = useState("")

    const [
        isLoading,
        setIsLoading
    ] = useState(true)

    const [
        updatingID,
        setUpdatingID
    ] = useState<string | null>(null)

    const [
        message,
        setMessage
    ] = useState<string | null>(null)

    const [
        error,
        setError
    ] = useState<string | null>(null)

    const isAdmin =
        user?.role === "admin"

    const summary =
        useMemo(() => {
            return {
                total: requests.length,
                open: requests.filter((item) => item.status === "open").length,
                accepted: requests.filter((item) => item.status === "accepted").length,
                done: requests.filter((item) => item.status === "done").length
            }
        }, [
            requests
        ])

    async function loadRequests() {
        if (!isAuthenticated || !isAdmin) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const params =
                new URLSearchParams()

            params.set("limit", "100")

            if (status) {
                params.set("status", status)
            }

            const response =
                await fetch(
                    `${API_URL}/api/v1/admin/feature-requests?${params.toString()}`,
                    {
                        credentials: "include"
                    }
                )

            const json =
                await response.json() as ApiResponse<FeatureRequest[]>

            if (!response.ok) {
                throw new Error(json.message || "Failed to load feature requests")
            }

            setRequests(json.data)
        } catch (err) {
            setError(getApiErrorMessage(err))

        } finally {
            setIsLoading(false)
        }
    }

    async function updateStatus(requestID: string, nextStatus: string) {
        setUpdatingID(requestID)
        setMessage(null)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/admin/feature-requests/${requestID}/status`,
                    {
                        method: "PATCH",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            status: nextStatus
                        })
                    }
                )

            const json =
                await response.json() as ApiResponse<FeatureRequest>

            if (!response.ok) {
                throw new Error(json.message || "Failed to update feature request")
            }

            setRequests((current) => {
                return current.map((item) => {
                    if (item.id !== requestID) {
                        return item
                    }

                    return json.data
                })
            })

            setMessage(`Feature request marked as ${nextStatus}.`)
        } catch (err) {
            setError(getApiErrorMessage(err))

        } finally {
            setUpdatingID(null)
        }
    }

    useEffect(() => {
        if (!isAuthLoading) {
            loadRequests()
        }
    }, [
        isAuthLoading,
        isAuthenticated,
        isAdmin,
        status
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
                        Loading Admin Requests
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Preparing the feature request board.
                    </p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-zinc-800 bg-black p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                        <ShieldAlert size={14} />
                        Admin
                    </div>

                    <h1 className="mt-4 text-3xl font-black text-white">
                        Login Required
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Please login before opening the admin request page.
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

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-red-500/30 bg-black p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-black text-red-200">
                        <ShieldAlert size={14} />
                        Admin
                    </div>

                    <h1 className="mt-4 text-3xl font-black text-white">
                        Admin Access Required
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        This page is only available for archive admins.
                    </p>

                    <Link
                        href="/profile"
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-5 text-sm font-black text-zinc-300 hover:text-white"
                    >
                        Back to Profile
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
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

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                            <ShieldAlert size={14} />
                            Admin Review
                        </div>

                        <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                            Request Review
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            Review submitted feature ideas, accept useful requests, plan future work, or close duplicates.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadRequests}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                            Loaded Requests
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {summary.total}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                            Open
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {summary.open}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-violet-300">
                            Accepted
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {summary.accepted}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
                            Done
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                            {summary.done}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                    {STATUS_FILTERS.map((item) => {
                        const active =
                            status === item.value

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => setStatus(item.value)}
                                className={`
                                    shrink-0
                                    rounded-2xl
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-black
                                    transition-colors

                                    ${active
                                        ? "border-violet-500 bg-violet-500/15 text-violet-200"
                                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                                    }
                                `}
                            >
                                {item.label}
                            </button>
                        )
                    })}
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

            <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <Lightbulb
                        size={20}
                        className="text-violet-300"
                    />

                    <h2 className="text-2xl font-black text-white">
                        Submitted Requests
                    </h2>
                </div>

                {requests.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-sm leading-6 text-zinc-400">
                        No feature requests found for this filter.
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        {requests.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                            >
                                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="min-w-0">
                                        <span
                                            className={`
                                                rounded-full
                                                border
                                                px-2.5
                                                py-1
                                                text-[11px]
                                                font-black
                                                uppercase

                                                ${statusClass(item.status)}
                                            `}
                                        >
                                            {item.status}
                                        </span>

                                        <h3 className="mt-3 break-words text-xl font-black text-white">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                                            {item.body}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
                                            <span>
                                                Created {formatDate(item.created_at)}
                                            </span>

                                            <span>
                                                Updated {formatDate(item.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <aside className="rounded-2xl border border-zinc-800 bg-black p-4">
                                        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                            Submitted By
                                        </p>

                                        <p className="mt-2 break-words text-sm font-black text-white">
                                            {item.user_name || "Unknown User"}
                                        </p>

                                        {item.user_email && (
                                            <p className="mt-1 break-words text-xs text-zinc-500">
                                                {item.user_email}
                                            </p>
                                        )}

                                        <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">
                                            {REVIEW_ACTIONS.map((action) => {
                                                const Icon =
                                                    action.icon

                                                const active =
                                                    item.status === action.value

                                                return (
                                                    <button
                                                        key={action.value}
                                                        type="button"
                                                        disabled={updatingID === item.id || active}
                                                        onClick={() => updateStatus(item.id, action.value)}
                                                        className={`
                                                            inline-flex
                                                            h-10
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            px-3
                                                            text-xs
                                                            font-black
                                                            transition-colors
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-45

                                                            ${action.className}
                                                        `}
                                                    >
                                                        {updatingID === item.id ? (
                                                            <Loader2
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Icon size={14} />
                                                        )}

                                                        {action.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </aside>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}