const menus = [
    "Cards",
    "Equipments",
    "Headwears",
    "Monsters",
    "Mounts",
    "Pets",
    "Skills",
    "Buffs",
    "Formulas"
]

export default function Sidebar() {

    return (

        <aside
            className="
                w-64
                border-r
                border-zinc-800
                bg-zinc-950
                min-h-screen
                p-4
            "
        >

            <div className="space-y-2">

                {menus.map((menu) => (

                    <button
                        key={menu}
                        className="
                            w-full
                            text-left
                            px-4
                            py-3
                            rounded-xl
                            text-zinc-300
                            hover:bg-zinc-900
                            hover:text-white
                            transition-all
                        "
                    >
                        {menu}
                    </button>

                ))}

            </div>

        </aside>

    )
}