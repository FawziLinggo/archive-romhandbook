"use client"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import Link from "next/link"

import {
    ArrowLeft,
    Edit3,
    Lightbulb,
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

type FeatureRequest = {
    id: string
    user_id: string
    user_name?: string | null
    user_email?: string | null
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

export default function ProfileRequestsPage() {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        isLoading: isAuthLoading,
        isAuthenticated,
        loginWithDiscord
    } = useAuth()

    const [
        requests,
        setRequests
    ] = useState<FeatureRequest[]>([])

    const [
        selectedRequest,
        setSelectedRequest
    ] = useState<FeatureRequest | null>(null)

    const [
        title,
        setTitle
    ] = useState("")

    const [
        body,
        setBody
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
        Boolean(selectedRequest)

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

    function resetForm() {
        setSelectedRequest(null)
        setTitle("")
        setBody("")
        setMessage(null)
        setError(null)
    }

    function editRequest(item: FeatureRequest) {
        setSelectedRequest(item)
        setTitle(item.title)
        setBody(item.body)
        setMessage(null)
        setError(null)
    }

    async function loadRequests() {
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/me/feature-requests`,
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
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load feature requests"
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function saveRequest() {
        setIsSaving(true)
        setMessage(null)
        setError(null)

        try {
            const endpoint =
                selectedRequest
                    ? `${API_URL}/api/v1/me/feature-requests/${selectedRequest.id}`
                    : `${API_URL}/api/v1/me/feature-requests`

            const response =
                await fetch(
                    endpoint,
                    {
                        method: selectedRequest
                            ? "PATCH"
                            : "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            title,
                            body
                        })
                    }
                )

            const json =
                await response.json() as ApiResponse<FeatureRequest>

            if (!response.ok) {
                throw new Error(json.message || "Failed to save feature request")
            }

            setMessage(
                selectedRequest
                    ? "Feature request updated."
                    : "Feature request submitted."
            )

            resetForm()
            await loadRequests()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save feature request"
            )
        } finally {
            setIsSaving(false)
        }
    }

    async function deleteRequest(item: FeatureRequest) {
        const confirmed =
            window.confirm(`Delete request "${item.title}"?`)

        if (!confirmed) {
            return
        }

        setMessage(null)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/me/feature-requests/${item.id}`,
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to delete feature request")
            }

            if (selectedRequest?.id === item.id) {
                resetForm()
            }

            setMessage("Feature request deleted.")
            await loadRequests()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete feature request"
            )
        }
    }

    useEffect(() => {
        if (!isAuthLoading) {
            loadRequests()
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
                        Loading Requests
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Preparing your feature request board.
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
                        <Lightbulb size={14} />
                        Feature Request
                    </div>

                    <h1 className="mt-4 text-3xl font-black text-white">
                        Login Required
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Please login with Discord before submitting feature requests.
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

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                            <Lightbulb size={14} />
                            Feature Request
                        </div>

                        <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                            Feature Requests
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            Suggest useful archive improvements, interface ideas, data tools, or graph features.
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
                            Total Requests
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
                            Your Requests
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                        >
                            <Plus size={15} />
                            New
                        </button>
                    </div>

                    {requests.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-sm leading-6 text-zinc-400">
                            No feature requests yet. Use the form to submit your first idea.
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {requests.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                                            <h3 className="mt-3 break-words text-lg font-black text-white">
                                                {item.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-400">
                                                {item.body}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                                                <span>
                                                    Created {formatDate(item.created_at)}
                                                </span>

                                                <span>
                                                    Updated {formatDate(item.updated_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                disabled={item.status !== "open"}
                                                onClick={() => editRequest(item)}
                                                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-800 bg-black px-3 text-sm font-bold text-zinc-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Edit3 size={15} />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={item.status !== "open"}
                                                onClick={() => deleteRequest(item)}
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
                                    ? "Edit Request"
                                    : "New Request"}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Describe the feature and why it would help archive users.
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
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-violet-500"
                                placeholder="Example: Add saved graph layouts"
                            />

                            <p className="mt-1 text-xs text-zinc-600">
                                {title.length}/120 characters
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Details
                            </label>

                            <textarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                maxLength={2000}
                                rows={8}
                                className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-violet-500"
                                placeholder="What should be built, where should it appear, and why is it useful?"
                            />

                            <p className="mt-1 text-xs text-zinc-600">
                                {body.length}/2000 characters
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={saveRequest}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 text-sm font-black text-violet-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                                ? "Save Request"
                                : "Submit Request"}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}