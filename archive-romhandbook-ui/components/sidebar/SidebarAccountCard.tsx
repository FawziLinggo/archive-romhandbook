"use client"
import Link from "next/link"
import {
    useEffect,
    useState
} from "react"


import {
    Loader2,
    LogIn,
    LogOut,
    Shield,
    User,
    UserRound
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"

type Props = {
    collapsed: boolean
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

function getInitial(
    value?: string | null
) {
    if (!value) {
        return "?"
    }

    return value
        .trim()
        .charAt(0)
        .toUpperCase()
}

export default function SidebarAccountCard({
    collapsed
}: Props) {
    const {
        user,
        isLoading,
        isAuthenticated,
        loginWithDiscord,
        logout
    } = useAuth()

    const [
        mounted,
        setMounted
    ] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const showLoading =
        mounted && isLoading

    const showAuthenticated =
        mounted && isAuthenticated

    const currentUser =
        showAuthenticated ? user : null

    const displayName =
        currentUser?.display_name || "Guest Adventurer"

    const rankName =
        currentUser?.rank_name || "Novice"

    const pointsTotal =
        currentUser?.points_total || 0

    const nextRankName =
        currentUser?.next_rank_name || null

    const nextRankPoints =
        currentUser?.next_rank_points || null

    const pointsToNextRank =
        currentUser?.points_to_next_rank || 0

    if (collapsed) {
        return (
            <div
                className="
                    flex
                    justify-center
                    px-3
                    pb-3
                "
            >
                <button
                    type="button"
                    onClick={() => {
                        if (!showAuthenticated) {
                            loginWithDiscord()
                        }
                    }}
                    className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center

                        overflow-hidden
                        rounded-2xl

                        border
                        border-white/5

                        bg-zinc-900/80

                        text-sm
                        font-black
                        text-violet-200

                        transition-all

                        hover:border-violet-500/30
                        hover:bg-violet-500/10
                    "
                    title={
                        showAuthenticated
                            ? displayName
                            : "Login with Discord"
                    }
                >
                    <Link href="/profile">
                        {showLoading ? (
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                        ) : currentUser?.avatar_url ? (
                            <img
                                src={currentUser.avatar_url}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />
                        ) : showAuthenticated ? (
                            getInitial(displayName)
                        ) : (
                            <User size={18} />
                        )}
                    </Link>
                </button>
            </div>
        )
    }

    return (
        <div
            className="
                px-3
                pb-3
            "
        >
            <div
                className="
                    relative
                    overflow-hidden

                    rounded-2xl

                    border
                    border-white/5

                    bg-zinc-900/80

                    p-3

                    shadow-xl
                    shadow-black/20
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0

                        bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_45%)]

                        opacity-80
                    "
                />

                <div
                    className="
                        relative
                        z-10
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-2.5
                        "
                    >
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center

                                overflow-hidden
                                rounded-xl

                                border
                                border-white/5

                                bg-black/40

                                text-sm
                                font-black
                                text-violet-200
                            "
                        >
                            {showLoading ? (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : currentUser?.avatar_url ? (
                                <img
                                    src={currentUser.avatar_url}
                                    alt={displayName}
                                    className="h-full w-full object-cover"
                                />
                            ) : showAuthenticated ? (
                                getInitial(displayName)
                            ) : (
                                <User size={17} />
                            )}
                        </div>

                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >
                                <div
                                    className={`
                                        h-1.5
                                        w-1.5
                                        rounded-full

                                        ${showAuthenticated
                                            ? "bg-emerald-400"
                                            : "bg-zinc-600"
                                        }
                                    `}
                                />

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-bold
                                        text-white
                                    "
                                >
                                    {displayName}
                                </p>
                            </div>

                            <div
                                className="
                                    mt-1
                                    flex
                                    min-w-0
                                    items-center
                                    gap-1.5
                                "
                            >
                                {showAuthenticated ? (
                                    <>
                                        <span
                                            className="
                                                inline-flex
                                                max-w-[92px]
                                                items-center
                                                gap-1
                                                truncate
                                                rounded-full
                                                border
                                                border-violet-500/30
                                                bg-violet-500/10
                                                px-2
                                                py-0.5
                                                text-[10px]
                                                font-black
                                                text-violet-200
                                            "
                                        >
                                            <Shield size={10} />
                                            {rankName}
                                        </span>

                                        {currentUser?.class_name && (
                                            <span
                                                className="
                                                    truncate
                                                    rounded-full
                                                    border
                                                    border-cyan-500/30
                                                    bg-cyan-500/10
                                                    px-2
                                                    py-0.5
                                                    text-[10px]
                                                    font-black
                                                    text-cyan-200
                                                "
                                            >
                                                {currentUser.class_name}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span
                                        className="
                                            text-[11px]
                                            text-zinc-500
                                        "
                                    >
                                        Login with Discord
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="
                            mt-3
                            grid
                            grid-cols-1
                            gap-2
                        "
                    >
                        {showAuthenticated ? (
                            <div
                                className="
            grid
            grid-cols-2
            gap-2
        "
                            >
                                <Link
                                    href="/profile"
                                    className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-2

                rounded-xl

                border
                border-violet-500/30

                bg-violet-500/10

                text-xs
                font-bold
                text-violet-200

                transition-colors

                hover:border-violet-400/50
                hover:bg-violet-500/20
                hover:text-white
            "
                                >
                                    <UserRound size={14} />
                                    Profile
                                </Link>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-2

                rounded-xl

                border
                border-zinc-700/70

                bg-zinc-950/70

                text-xs
                font-bold
                text-zinc-300

                transition-colors

                hover:border-red-500/40
                hover:bg-red-500/10
                hover:text-red-200
            "
                                >
                                    <LogOut size={14} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                disabled={showLoading}
                                onClick={loginWithDiscord}
                                className="
                                    inline-flex
                                    h-9
                                    items-center
                                    justify-center
                                    gap-2

                                    rounded-xl

                                    border
                                    border-indigo-500/30

                                    bg-indigo-500/10

                                    text-xs
                                    font-black
                                    text-indigo-200

                                    transition-colors

                                    hover:border-indigo-400/50
                                    hover:bg-indigo-500/20
                                    hover:text-white

                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {showLoading ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <LogIn size={14} />
                                )}

                                Login Discord
                            </button>
                        )}
                    </div>

                    {showAuthenticated && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between gap-2 text-[11px]">

                                {nextRankName && (
                                    <span className="font-black text-violet-300">
                                        {pointsToNextRank} to {nextRankName}
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full border border-zinc-800 bg-black">
                                <div
                                    className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-violet-500
                    via-fuchsia-400
                    to-cyan-300
                    shadow-[0_0_16px_rgba(168,85,247,0.65)]
                    transition-all
                "
                                    style={{
                                        width: `${rankProgressPercent(
                                            pointsTotal,
                                            nextRankPoints
                                        )}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}