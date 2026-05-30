"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react"

type AuthUser = {
    id: string
    email: string | null
    display_name: string
    avatar_url: string | null
    provider: string
    provider_user_id: string
    role: string
    status: string
    class_name: string | null
    rank_name: string
    points_total: number
}

type AuthContextValue = {
    user: AuthUser | null
    isLoading: boolean
    isAuthenticated: boolean
    loginWithDiscord: () => void
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext =
    createContext<AuthContextValue | null>(null)

export function AuthProvider({
    children
}: {
    children: React.ReactNode
}) {
    const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"

    const [
        user,
        setUser
    ] = useState<AuthUser | null>(null)

    const [
        isLoading,
        setIsLoading
    ] = useState(true)

    const refreshUser =
        useCallback(async () => {
            try {
                const response =
                    await fetch(
                        `${API_URL}/api/v1/auth/me`,
                        {
                            credentials: "include"
                        }
                    )

                if (!response.ok) {
                    setUser(null)
                    return
                }

                const json =
                    await response.json()

                setUser(json.data)
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }, [
            API_URL
        ])

    const loginWithDiscord =
        useCallback(() => {
            window.location.href =
                `${API_URL}/api/v1/auth/discord/login`
        }, [
            API_URL
        ])

    const logout =
        useCallback(async () => {
            await fetch(
                `${API_URL}/api/v1/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            )

            setUser(null)
        }, [
            API_URL
        ])

    useEffect(() => {
        refreshUser()
    }, [
        refreshUser
    ])

    const value =
        useMemo<AuthContextValue>(() => {
            return {
                user,
                isLoading,
                isAuthenticated: Boolean(user),
                loginWithDiscord,
                logout,
                refreshUser
            }
        }, [
            user,
            isLoading,
            loginWithDiscord,
            logout,
            refreshUser
        ])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context =
        useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }

    return context
}