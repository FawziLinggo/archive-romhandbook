import SidebarMenuItem from "./SidebarMenuItem"

import {
    menus
} from "./sidebar-menus"

type Props = {

    collapsed: boolean

    counts: any

}

export default function SidebarMenu({

    collapsed,
    counts

}: Props) {

    return (

        <nav
            className="
                flex-1

                space-y-2

                overflow-y-auto

                px-3
                py-4
            "
        >

            {menus.map((item) => (

                <SidebarMenuItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    count={

                        counts[
                            item.countKey as keyof typeof counts
                        ]?.total

                    }
                />

            ))}

        </nav>

    )

}