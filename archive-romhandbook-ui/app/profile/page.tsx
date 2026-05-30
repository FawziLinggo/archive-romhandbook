"use client"

import Link from "next/link"

import {
    useEffect,
    useMemo,
    useState
} from "react"

import {
    Bug,
    Loader2,
    RefreshCw,
    Save,
    Shield,
    Sparkles,
    Trash2,
    UserRound
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"

import type {
    ApiResponse,
    JobClass,
    PaginatedApiResponse,
    Profile
} from "@/lib/types/Profile"

function emptyToNull(value: string) {
    const trimmed =
        value.trim()

    return trimmed === ""
        ? null
        : trimmed
}

function rankProgressPercent(
    pointsTotal: number,
    nextRankPoints: number | null
) {
    if (!nextRankPoints || nextRankPoints <= 0) {
        return 100
    }

    return Math.min(
        100,
        Math.max(
            0,
            Math.round((pointsTotal / nextRankPoints) * 100)
        )
    )
}

function classImageUrl(image: string | null) {
    if (!image) {
        return null
    }

    if (image.startsWith("http")) {
        return image
    }

    return image
}

export default function ProfilePage() {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        refreshUser,
        user,
    } = useAuth()

    const [
        profile,
        setProfile
    ] = useState<Profile | null>(null)

    const [
        jobs,
        setJobs
    ] = useState<JobClass[]>([])

    const [
        displayName,
        setDisplayName
    ] = useState("")

    const [
        classId,
        setClassId
    ] = useState("")

    const [
        bio,
        setBio
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

    const selectedJob =
        useMemo(() => {
            return jobs.find((job) => job.id === classId) || null
        }, [
            jobs,
            classId
        ])

    async function loadProfile() {
        setIsLoading(true)
        setError(null)

        try {
            const [
                profileResponse,
                jobsResponse
            ] =
                await Promise.all([
                    fetch(
                        `${API_URL}/api/v1/me/profile`,
                        {
                            credentials: "include"
                        }
                    ),
                    fetch(
                        `${API_URL}/api/v1/jobs?limit=200`,
                        {
                            cache: "no-store"
                        }
                    )
                ])

            if (profileResponse.status === 401) {
                setProfile(null)
                setError("Please login before editing your profile.")
                return
            }

            if (!profileResponse.ok) {
                throw new Error("Failed to load profile")
            }

            if (!jobsResponse.ok) {
                throw new Error("Failed to load classes")
            }

            const profileJson =
                await profileResponse.json() as ApiResponse<Profile>

            const jobsJson =
                await jobsResponse.json() as PaginatedApiResponse<JobClass>

            setProfile(profileJson.data)
            setJobs(jobsJson.data)

            setDisplayName(profileJson.data.display_name || "")
            setClassId(profileJson.data.class_id || "")
            setBio(profileJson.data.bio || "")
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load profile"
            )
        } finally {
            setIsLoading(false)
        }
    }

    async function saveProfile() {
        setIsSaving(true)
        setMessage(null)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/me/profile`,
                    {
                        method: "PATCH",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            display_name: displayName,
                            class_id: classId || null,
                            bio: emptyToNull(bio)
                        })
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to save profile")
            }

            setProfile(json.data)
            setDisplayName(json.data.display_name || "")
            setClassId(json.data.class_id || "")
            setBio(json.data.bio || "")

            await refreshUser()

            setMessage("Profile updated.")
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save profile"
            )
        } finally {
            setIsSaving(false)
        }
    }

    function clearClass() {
        setClassId("")
    }

    function clearBio() {
        setBio("")
    }

    useEffect(() => {
        loadProfile()
    }, [])

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-center">
                    <Loader2
                        size={28}
                        className="mx-auto animate-spin text-violet-300"
                    />

                    <h1 className="mt-4 text-xl font-black text-white">
                        Loading Profile
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Preparing your archive identity.
                    </p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-3xl border border-zinc-800 bg-black p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                        <UserRound size={14} />
                        Profile
                    </div>

                    <h1 className="mt-4 text-3xl font-black text-white">
                        Login Required
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {error || "Please login with Discord before editing your profile."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-black text-violet-200">
                            <UserRound size={14} />
                            Archive Profile
                        </div>

                        <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                            Your Profile
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            Choose your class identity, keep your display name tidy, and prepare your contribution badge for comments, reports, and feature requests.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                        {user?.role?.toLowerCase() === "admin" && (
                            <Link
                                href="/admin/reports"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 text-sm font-bold text-violet-200 hover:bg-violet-500/20"
                            >
                                <Shield size={15} />
                                Review Bug
                            </Link>
                        )}
                        <Link
                            href="/profile/reports"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-200 hover:bg-red-500/20"
                        >
                            <Bug size={15} />
                            Report Bug
                        </Link>

                        <button
                            type="button"
                            onClick={loadProfile}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                        >
                            <RefreshCw size={15} />
                        </button>
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

            <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <aside className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.display_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound
                                    size={30}
                                    className="text-violet-300"
                                />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-black text-white">
                                {profile.display_name}
                            </h2>

                            <p className="mt-1 truncate text-sm text-zinc-500">
                                {profile.email || "Discord Account"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-3">
                            <div className="flex items-center gap-2 text-xs font-black text-violet-200">
                                <Shield size={13} />
                                Rank
                            </div>

                            <div className="mt-2 text-lg font-black text-white">
                                {profile.rank_name}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                            <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
                                <Sparkles size={13} />
                                Points
                            </div>

                            <div className="mt-2 text-lg font-black text-white">
                                {profile.points_total}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                            Selected Class
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                                {profile.class_image ? (
                                    <img
                                        src={classImageUrl(profile.class_image) || ""}
                                        alt={profile.class_name || "Class"}
                                        className="h-9 w-9 object-contain"
                                    />
                                ) : (
                                    <UserRound
                                        size={20}
                                        className="text-zinc-500"
                                    />
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-white">
                                    {profile.class_name || "No class selected"}
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Used for your profile badge.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                            Rank & Points
                        </p>

                        <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-400">
                            <p>
                                Rank shows your contribution level in the archive community.
                                It increases as you collect contribution points.
                            </p>

                            <p>
                                Points are earned from useful activity such as accepted bug reports,
                                helpful feature requests, and valuable comments.
                            </p>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                                <span className="text-xs font-bold text-zinc-400">
                                    Comment activity
                                </span>

                                <span className="text-xs font-black text-emerald-300">
                                    +1
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                                <span className="text-xs font-bold text-zinc-400">
                                    Accepted bug report
                                </span>

                                <span className="text-xs font-black text-emerald-300">
                                    +10
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                                <span className="text-xs font-bold text-zinc-400">
                                    Fixed confirmed issue
                                </span>

                                <span className="text-xs font-black text-emerald-300">
                                    +25
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-2">
                                <span className="text-xs font-bold text-zinc-400">
                                    Accepted feature request
                                </span>

                                <span className="text-xs font-black text-emerald-300">
                                    +10
                                </span>
                            </div>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-zinc-500">
                            Spam, duplicate reports, or deleted content may reduce points.
                            Large rewards are granted only after review.
                        </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                    Rank Progress
                                </p>

                                <p className="mt-1 text-sm font-bold text-zinc-300">
                                    {profile.next_rank_name
                                        ? `${profile.points_to_next_rank} points to ${profile.next_rank_name}`
                                        : "Maximum rank reached"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-black text-white">
                                    {profile.points_total}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    / {profile.next_rank_points || profile.points_total}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full border border-zinc-800 bg-black">
                            <div
                                className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-violet-500
                via-fuchsia-400
                to-cyan-300
                shadow-[0_0_18px_rgba(168,85,247,0.7)]
                transition-all
            "
                                style={{
                                    width: `${rankProgressPercent(
                                        profile.points_total,
                                        profile.next_rank_points
                                    )}%`
                                }}
                            />
                        </div>
                    </div>
                </aside>

                <section className="rounded-3xl border border-zinc-800 bg-black p-4 sm:p-5">
                    <h2 className="text-2xl font-black text-white">
                        Edit Profile
                    </h2>

                    <div className="mt-5 space-y-5">
                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Display Name
                            </label>

                            <input
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                maxLength={32}
                                className="mt-2 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-violet-500"
                            />

                            <p className="mt-1 text-xs text-zinc-600">
                                Maximum 32 characters.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Class
                            </label>

                            <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                                <select
                                    value={classId}
                                    onChange={(event) => setClassId(event.target.value)}
                                    className="h-12 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-white outline-none focus:border-violet-500"
                                >
                                    <option value="">
                                        No class selected
                                    </option>

                                    {jobs.map((job) => (
                                        <option
                                            key={job.id}
                                            value={job.id}
                                        >
                                            {job.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={clearClass}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-300 hover:text-white"
                                >
                                    <Trash2 size={15} />
                                    Clear
                                </button>
                            </div>

                            {selectedJob && (
                                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black">
                                        {selectedJob.image ? (
                                            <img
                                                src={classImageUrl(selectedJob.image) || ""}
                                                alt={selectedJob.name}
                                                className="h-8 w-8 object-contain"
                                            />
                                        ) : (
                                            <UserRound
                                                size={18}
                                                className="text-zinc-500"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-white">
                                            {selectedJob.name}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            This class will appear on your profile badge.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-wide text-zinc-500">
                                Bio
                            </label>

                            <textarea
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                maxLength={240}
                                rows={5}
                                className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-violet-500"
                                placeholder="Tell other archivists what you like to explore..."
                            />

                            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-zinc-600">
                                <span>
                                    {bio.length}/240 characters
                                </span>

                                <button
                                    type="button"
                                    onClick={clearBio}
                                    className="font-bold text-zinc-400 hover:text-white"
                                >
                                    Clear bio
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={saveProfile}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-500/10 text-sm font-black text-violet-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                        >
                            {isSaving ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            Save Profile
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}