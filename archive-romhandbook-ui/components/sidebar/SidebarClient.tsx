"use client"

import SidebarAccountCard from "./SidebarAccountCard"
import SidebarMenu from "./SidebarMenu"
import SidebarToggle from "./SidebarToggle"

import {
    useSidebar
} from "@/contexts/SidebarContext"

type Props = {
    counts: any
}

export default function SidebarClient({
    counts
}: Props) {

    // =====================
    // GLOBAL SIDEBAR STATE
    // =====================

    const {

        collapsed,
        setCollapsed,

        mobileOpen,
        setMobileOpen

    } = useSidebar()

    return (

        <>

            {/* MOBILE OVERLAY */}

            {mobileOpen && (

                <button
                    onClick={() =>

                        setMobileOpen(false)

                    }
                    className="
                        fixed
                        inset-0

                        z-40

                        bg-black/70
                        backdrop-blur-sm

                        md:hidden
                    "
                />

            )}

            {/* SIDEBAR */}

            <aside
                className={`
                    fixed
                    left-0
                    top-16

                    z-50

                    h-[calc(100vh-4rem)]

                    border-r
                    border-zinc-800

                    bg-zinc-950

                    flex
                    flex-col

                    transition-all
                    duration-300

                    md:sticky

                    ${collapsed

                        ? "w-24"

                        : "w-64"
                    }

                    ${mobileOpen

                        ? `
                            translate-x-0
                        `

                        : `
                            -translate-x-full
                            md:translate-x-0
                        `
                    }
                `}
            >

                {/* DESKTOP TOGGLE */}

                <SidebarToggle
                    collapsed={collapsed}
                    onToggle={() =>

                        setCollapsed(
                            !collapsed
                        )

                    }
                />

                {/* MENU */}

                <SidebarMenu
                    collapsed={collapsed}
                    counts={counts}
                />

                {/* ACCOUNT */}

                <SidebarAccountCard
                    collapsed={collapsed}
                />

            </aside>

        </>

    )

}