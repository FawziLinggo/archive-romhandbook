"use client"

import {
    getApiErrorMessage
} from "@/lib/api-client"
import {
    useEffect,
    useMemo,
    useState
} from "react"

import {
    Edit3,
    Loader2,
    MessageCircle,
    Reply,
    Send,
    Trash2,
    X
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"

type CommentAuthor = {
    id: string
    display_name: string
    avatar_url: string | null
    rank_name: string
    points_total: number
    class_name: string | null
    class_image: string | null
}

type CommentItem = {
    id: string
    user_id: string
    target_type: string
    target_id: string
    parent_id: string | null
    body: string
    status: string
    depth: number
    created_at: string
    updated_at: string
    author: CommentAuthor
    replies: CommentItem[]
}

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    meta?: unknown
}

type Props = {
    targetType: string
    targetId: string
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

function canModifyComment(
    user: ReturnType<typeof useAuth>["user"],
    comment: CommentItem
) {
    if (!user) {
        return false
    }

    return user.id === comment.user_id || user.role === "admin"
}

function authorImage(author: CommentAuthor) {
    if (author.avatar_url) {
        return author.avatar_url
    }

    return null
}

function CommentForm({
    value,
    placeholder,
    isSaving,
    buttonLabel,
    onChange,
    onSubmit,
    onCancel
}: {
    value: string
    placeholder: string
    isSaving: boolean
    buttonLabel: string
    onChange: (value: string) => void
    onSubmit: () => void
    onCancel?: () => void
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                maxLength={2000}
                rows={4}
                className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-zinc-800
                    bg-black
                    px-3
                    py-3
                    text-sm
                    leading-6
                    text-white
                    outline-none
                    focus:border-violet-500
                "
                placeholder={placeholder}
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-zinc-600">
                    {value.length}/2000 characters
                </span>

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="
                                inline-flex
                                h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-zinc-800
                                bg-black
                                px-4
                                text-sm
                                font-bold
                                text-zinc-400
                                hover:text-white
                            "
                        >
                            <X size={15} />
                            Cancel
                        </button>
                    )}

                    <button
                        type="button"
                        disabled={isSaving || value.trim() === ""}
                        onClick={onSubmit}
                        className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-violet-500/40
                            bg-violet-500/10
                            px-4
                            text-sm
                            font-black
                            text-violet-200
                            hover:bg-violet-500/20
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {isSaving ? (
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                        ) : (
                            <Send size={15} />
                        )}

                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

function CommentCard({
    comment,
    user,
    replyTargetID,
    editTargetID,
    replyText,
    editText,
    isSaving,
    onReplyTextChange,
    onEditTextChange,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onStartEdit,
    onCancelEdit,
    onSubmitEdit,
    onDelete
}: {
    comment: CommentItem
    user: ReturnType<typeof useAuth>["user"]
    replyTargetID: string | null
    editTargetID: string | null
    replyText: string
    editText: string
    isSaving: boolean
    onReplyTextChange: (value: string) => void
    onEditTextChange: (value: string) => void
    onStartReply: (comment: CommentItem) => void
    onCancelReply: () => void
    onSubmitReply: (comment: CommentItem) => void
    onStartEdit: (comment: CommentItem) => void
    onCancelEdit: () => void
    onSubmitEdit: (comment: CommentItem) => void
    onDelete: (comment: CommentItem) => void
}) {
    const canReply =
        Boolean(user) && comment.depth < 2

    const canModify =
        canModifyComment(user, comment)

    const isReplying =
        replyTargetID === comment.id

    const isEditing =
        editTargetID === comment.id

    return (
        <article
            className={`
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-4

                ${comment.depth > 0
                    ? "ml-4 sm:ml-8"
                    : ""
                }
            `}
        >
            <div className="flex gap-3">
                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                    "
                >
                    {authorImage(comment.author) ? (
                        <img
                            src={authorImage(comment.author) || ""}
                            alt={comment.author.display_name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <MessageCircle
                            size={18}
                            className="text-violet-300"
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-sm font-black text-white">
                            {comment.author.display_name}
                        </p>

                        <span
                            className="
                                rounded-full
                                border
                                border-violet-500/30
                                bg-violet-500/10
                                px-2
                                py-0.5
                                text-[11px]
                                font-black
                                text-violet-200
                            "
                        >
                            {comment.author.rank_name}
                        </span>

                        {comment.author.class_name && (
                            <span
                                className="
                                    rounded-full
                                    border
                                    border-cyan-500/30
                                    bg-cyan-500/10
                                    px-2
                                    py-0.5
                                    text-[11px]
                                    font-black
                                    text-cyan-200
                                "
                            >
                                {comment.author.class_name}
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-zinc-600">
                        {formatDate(comment.created_at)}
                    </p>

                    {isEditing ? (
                        <div className="mt-3">
                            <CommentForm
                                value={editText}
                                placeholder="Edit your comment..."
                                isSaving={isSaving}
                                buttonLabel="Save"
                                onChange={onEditTextChange}
                                onSubmit={() => onSubmitEdit(comment)}
                                onCancel={onCancelEdit}
                            />
                        </div>
                    ) : (
                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                            {comment.body}
                        </p>
                    )}

                    {!isEditing && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {canReply && (
                                <button
                                    type="button"
                                    onClick={() => onStartReply(comment)}
                                    className="
                                        inline-flex
                                        h-9
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-zinc-800
                                        bg-black
                                        px-3
                                        text-xs
                                        font-black
                                        text-zinc-400
                                        hover:text-white
                                    "
                                >
                                    <Reply size={14} />
                                    Reply
                                </button>
                            )}

                            {canModify && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onStartEdit(comment)}
                                        className="
                                            inline-flex
                                            h-9
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-zinc-800
                                            bg-black
                                            px-3
                                            text-xs
                                            font-black
                                            text-zinc-400
                                            hover:text-white
                                        "
                                    >
                                        <Edit3 size={14} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDelete(comment)}
                                        className="
                                            inline-flex
                                            h-9
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-red-500/30
                                            bg-red-500/10
                                            px-3
                                            text-xs
                                            font-black
                                            text-red-200
                                            hover:bg-red-500/20
                                        "
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {isReplying && (
                        <div className="mt-4">
                            <CommentForm
                                value={replyText}
                                placeholder={`Reply to ${comment.author.display_name}...`}
                                isSaving={isSaving}
                                buttonLabel="Reply"
                                onChange={onReplyTextChange}
                                onSubmit={() => onSubmitReply(comment)}
                                onCancel={onCancelReply}
                            />
                        </div>
                    )}

                    {comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {comment.replies.map((reply) => (
                                <CommentCard
                                    key={reply.id}
                                    comment={reply}
                                    user={user}
                                    replyTargetID={replyTargetID}
                                    editTargetID={editTargetID}
                                    replyText={replyText}
                                    editText={editText}
                                    isSaving={isSaving}
                                    onReplyTextChange={onReplyTextChange}
                                    onEditTextChange={onEditTextChange}
                                    onStartReply={onStartReply}
                                    onCancelReply={onCancelReply}
                                    onSubmitReply={onSubmitReply}
                                    onStartEdit={onStartEdit}
                                    onCancelEdit={onCancelEdit}
                                    onSubmitEdit={onSubmitEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}

export default function CommentsPanel({
    targetType,
    targetId
}: Props) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const {
        user,
        isAuthenticated,
        loginWithDiscord
    } = useAuth()

    const [
        comments,
        setComments
    ] = useState<CommentItem[]>([])

    const [
        newBody,
        setNewBody
    ] = useState("")

    const [
        replyBody,
        setReplyBody
    ] = useState("")

    const [
        editBody,
        setEditBody
    ] = useState("")

    const [
        replyTargetID,
        setReplyTargetID
    ] = useState<string | null>(null)

    const [
        editTargetID,
        setEditTargetID
    ] = useState<string | null>(null)

    const [
        isLoading,
        setIsLoading
    ] = useState(true)

    const [
        isSaving,
        setIsSaving
    ] = useState(false)

    const [
        error,
        setError
    ] = useState<string | null>(null)

    const totalComments =
        useMemo(() => {
            function count(items: CommentItem[]): number {
                return items.reduce((total, item) => {
                    return total + 1 + count(item.replies)
                }, 0)
            }

            return count(comments)
        }, [
            comments
        ])

    async function loadComments() {
        setIsLoading(true)
        setError(null)

        try {
            const params =
                new URLSearchParams({
                    target_type: targetType,
                    target_id: targetId
                })

            const response =
                await fetch(
                    `${API_URL}/api/v1/comments?${params.toString()}`,
                    {
                        cache: "no-store"
                    }
                )

            const json =
                await response.json() as ApiResponse<CommentItem[]>

            if (!response.ok) {
                throw new Error(json.message || "Failed to load comments")
            }

            setComments(json.data)
        } catch (err) {
            setError(getApiErrorMessage(err))

        } finally {
            setIsLoading(false)
        }
    }

    async function createComment(parentID: string | null, body: string) {
        setIsSaving(true)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/comments`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            target_type: targetType,
                            target_id: targetId,
                            parent_id: parentID,
                            body
                        })
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to save comment")
            }

            setNewBody("")
            setReplyBody("")
            setReplyTargetID(null)

            await loadComments()
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsSaving(false)
        }
    }

    async function updateComment(comment: CommentItem) {
        setIsSaving(true)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/comments/${comment.id}`,
                    {
                        method: "PATCH",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            body: editBody
                        })
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to update comment")
            }

            setEditBody("")
            setEditTargetID(null)

            await loadComments()
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsSaving(false)
        }
    }

    async function deleteComment(comment: CommentItem) {
        const confirmed =
            window.confirm("Delete this comment?")

        if (!confirmed) {
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const response =
                await fetch(
                    `${API_URL}/api/v1/comments/${comment.id}`,
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                )

            const json =
                await response.json()

            if (!response.ok) {
                throw new Error(json.message || "Failed to delete comment")
            }

            await loadComments()
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsSaving(false)
        }
    }

    function startReply(comment: CommentItem) {
        setReplyTargetID(comment.id)
        setReplyBody("")
        setEditTargetID(null)
    }

    function startEdit(comment: CommentItem) {
        setEditTargetID(comment.id)
        setEditBody(comment.body)
        setReplyTargetID(null)
    }

    useEffect(() => {
        loadComments()
    }, [
        targetType,
        targetId
    ])

    return (
        <section
            className="
                mx-auto
                mt-8
                w-full
                max-w-6xl
                rounded-3xl
                border
                border-zinc-800
                bg-black
                p-4
                sm:p-5
            "
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-violet-500/30
                            bg-violet-500/10
                            px-3
                            py-1.5
                            text-xs
                            font-black
                            text-violet-200
                        "
                    >
                        <MessageCircle size={14} />
                        Comments
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                        Discussion
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {totalComments} archived comments for this item.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {error}
                </div>
            )}

            <div className="mt-5">
                {isAuthenticated ? (
                    <CommentForm
                        value={newBody}
                        placeholder="Write a comment..."
                        isSaving={isSaving}
                        buttonLabel="Comment"
                        onChange={setNewBody}
                        onSubmit={() => createComment(null, newBody)}
                    />
                ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-sm leading-6 text-zinc-400">
                            Login with Discord to write comments or reply to other users.
                        </p>

                        <button
                            type="button"
                            onClick={loginWithDiscord}
                            className="
                                mt-3
                                inline-flex
                                h-10
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-violet-500/40
                                bg-violet-500/10
                                px-4
                                text-sm
                                font-black
                                text-violet-200
                                hover:bg-violet-500/20
                            "
                        >
                            Login Discord
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6">
                {isLoading ? (
                    <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                        <Loader2
                            size={22}
                            className="animate-spin text-violet-300"
                        />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-6 text-sm leading-6 text-zinc-400">
                        No comments yet. Be the first one to start the discussion.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                user={user}
                                replyTargetID={replyTargetID}
                                editTargetID={editTargetID}
                                replyText={replyBody}
                                editText={editBody}
                                isSaving={isSaving}
                                onReplyTextChange={setReplyBody}
                                onEditTextChange={setEditBody}
                                onStartReply={startReply}
                                onCancelReply={() => {
                                    setReplyTargetID(null)
                                    setReplyBody("")
                                }}
                                onSubmitReply={(target) => createComment(target.id, replyBody)}
                                onStartEdit={startEdit}
                                onCancelEdit={() => {
                                    setEditTargetID(null)
                                    setEditBody("")
                                }}
                                onSubmitEdit={updateComment}
                                onDelete={deleteComment}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}