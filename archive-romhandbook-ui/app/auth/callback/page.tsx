"use client"

import {
    useEffect,
    useRef
} from "react"

import {
    useRouter,
    useSearchParams
} from "next/navigation"

import {
    Loader2
} from "lucide-react"

import {
    useAuth
} from "@/contexts/AuthContext"

export default function AuthCallbackPage() {
    const router =
        useRouter()

    const searchParams =
        useSearchParams()

    const {
        refreshUser
    } = useAuth()

    const hasHandled =
        useRef(false)

    useEffect(() => {
        if (hasHandled.current) {
            return
        }

        hasHandled.current = true

        async function finishLogin() {
            const error =
                searchParams.get("error")

            if (error) {
                router.replace(`/?auth_error=${encodeURIComponent(error)}`)
                return
            }

            await refreshUser()

            router.replace("/")
        }

        finishLogin()
    }, [
        refreshUser,
        router,
        searchParams
    ])

    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="rounded-3xl border border-zinc-800 bg-black p-6 text-center">
                <Loader2
                    size={28}
                    className="mx-auto animate-spin text-violet-300"
                />

                <h1 className="mt-4 text-xl font-black text-white">
                    Signing you in
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Please wait while we restore your archive session.
                </p>
            </div>
        </div>
    )
}