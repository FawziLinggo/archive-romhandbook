import SidebarClient from "./SidebarClient"

import {
    getSidebarCounts
} from "@/lib/queries/sidebar"

export default function Sidebar() {

    // SERVER SIDE
    const counts =
        getSidebarCounts()

    return (

        <SidebarClient
            counts={counts}
        />

    )

}