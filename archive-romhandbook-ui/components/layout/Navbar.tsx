"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Navbar() {

    const router = useRouter()

    const [search, setSearch] = useState("")

    function handleSearch(
        e: React.FormEvent
    ) {

        e.preventDefault()


        console.log("SEARCH")

        router.push(
            `/cards?q=${search}`
        )
    }

    return (

        <header
            className="
                h-16
                border-b
                border-zinc-800
                bg-zinc-950/80
                backdrop-blur
                sticky
                top-0
                z-50
            "
        >

            <div
                className="
                    h-full
                    px-6
                    flex
                    items-center
                    justify-between
                "
            >

                {/* LOGO */}
                <div
                    className="
                        text-xl
                        font-bold
                        text-white
                        shrink-0
                    "
                >
                    ROM Handbook
                </div>

                {/* SEARCH */}
                <form
                    onSubmit={handleSearch}
                    className="
                        w-full
                        max-w-xl
                        mx-6
                    "
                >

                    <input
                        type="text"
                        placeholder="Search cards..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="
                            w-full
                            bg-zinc-900
                            border
                            border-zinc-800
                            rounded-xl
                            px-4
                            py-2
                            text-sm
                            outline-none
                            focus:border-violet-500
                        "
                    />

                </form>

            </div>

        </header>

    )
}