"use client"


import { usePathname } from "next/navigation"

import {
    useState
} from "react"

import SidebarAccountCard from "./SidebarAccountCard"
import SidebarMenu from "./SidebarMenu"
import SidebarToggle from "./SidebarToggle"

type Props = {
    counts: any
}


export default function SidebarClient({
    counts
}: Props) {

    // =====================
    // CURRENT PATH
    // =====================

    const pathname =
        usePathname()

    const [collapsed, setCollapsed] =
        useState(false)

    return (

        <aside
            className={`
        sticky
        top-16

        h-[calc(100vh-4rem)]

        border-r
        border-zinc-800

        bg-zinc-950

        flex
        flex-col

        transition-all
        duration-300

        ${collapsed
                    ? "w-24"
                    : "w-64"
                }
    `}
        >



            {/* CENTER TOGGLE */}

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


            {/* ACCOUNT CARD */}

            <SidebarAccountCard
                collapsed={collapsed}
            />


        </aside>

    )

}