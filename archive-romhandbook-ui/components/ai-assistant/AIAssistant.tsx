"use client"

import { useEffect, useState } from "react"

import { usePathname } from "next/navigation"
import FloatingAIButton from "./FloatingAIButton"
import FloatingAIPanel from "./FloatingAIPanel"


export default function AIAssistant() {

    // =====================
    // STATES
    // =====================

    const [open, setOpen] =
        useState(false)

    // =====================
    // ESC CLOSE
    // =====================

    useEffect(() => {

        function handleKeyDown(
            e: KeyboardEvent
        ) {

            if (e.key === "Escape") {

                setOpen(false)

            }

        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        )

        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            )

        }

    }, [])

    // =====================
    // BODY LOCK
    // =====================

    // useEffect(() => {

    //     if (open) {

    //         document.body.style.overflow =
    //             "hidden"

    //     } else {

    //         document.body.style.overflow =
    //             "auto"

    //     }

    //     return () => {

    //         document.body.style.overflow =
    //             "auto"

    //     }

    // }, [open])
    const pathname = usePathname()

    if (pathname.startsWith("/formulas/")) {
        return null
    }

    // =====================
    // RENDER
    // =====================



    return (



        <>

            {/* PANEL */}
            <FloatingAIPanel

                open={open}

                onClose={() =>
                    setOpen(false)
                }

            />

            {/* BUTTON */}
            <FloatingAIButton

                open={open}

                onClick={() =>
                    setOpen(!open)
                }

            />

        </>

    )

}