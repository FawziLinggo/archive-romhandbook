import {
    AlertTriangle,
    Lock,
    RefreshCw,
    WifiOff
} from "lucide-react"
import Link from "next/link"

import type {
    ServerFetchError
} from "@/lib/server-api"

type Props = {
    error: ServerFetchError
    title?: string
    description?: string
    backHref?: string
}

const errorCopy: Record<ServerFetchError, {
    label: string
    title: string
    description: string
}> = {
    not_found: {
        label: "Not Found",
        title: "Data not found",
        description: "The archive data you are trying to access is not available."
    },
    unauthorized: {
        label: "Login Required",
        title: "Login required",
        description: "Please log in with Discord to access this page."
    },
    forbidden: {
        label: "Access Denied",
        title: "Access denied",
        description: "Your account does not have permission to access this data."
    },
    rate_limited: {
        label: "Rate Limited",
        title: "Too many requests",
        description: "Please wait a moment before trying again."
    },
    server_error: {
        label: "Server Error",
        title: "Server Error",
        description: "The Archive API is currently experiencing issues."
    },
    connection_error: {
        label: "Connection Error",
        title: "Backend is unreachable",
        description: "The Archive API is currently unreachable. Please try refreshing once the backend is active again."
    },
    invalid_response: {
        label: "Invalid Response",
        title: "Invalid Response",
        description: "The server sent data that does not match the expected format."
    }
}

export default function ApiErrorState({
    error,
    title,
    description,
    backHref = "/"
}: Props) {
    const copy =
        errorCopy[error]

    const Icon =
        error === "unauthorized"
            ? Lock
            : error === "connection_error"
                ? WifiOff
                : AlertTriangle

    return (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12">
            <div className="w-full rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-black text-red-200">
                    <Icon size={24} />
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-red-300">
                    {copy.label}
                </p>

                <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                    {title || copy.title}
                </h1>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-300">
                    {description || copy.description}
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href={backHref}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-800 bg-black px-4 text-sm font-bold text-zinc-200 hover:border-zinc-600"
                    >
                        Back Home
                    </Link>

                    <Link
                        href=""
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/15 px-4 text-sm font-bold text-red-100 hover:bg-red-500/25"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </Link>
                </div>
            </div>
        </main>
    )
}