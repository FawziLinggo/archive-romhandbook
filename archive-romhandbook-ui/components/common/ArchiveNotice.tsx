"use client"

import {
    Archive,
    Info,
    X
} from "lucide-react"
import {
    useEffect,
    useState
} from "react"

const NOTICE_STORAGE_KEY = "rom_archive_notice_seen"
const NOTICE_OPEN_EVENT = "rom-archive-notice:open"

export function openArchiveNotice() {
    if (typeof window === "undefined") {
        return
    }

    window.dispatchEvent(
        new Event(NOTICE_OPEN_EVENT)
    )
}

export default function ArchiveNotice() {
    const [
        isOpen,
        setIsOpen
    ] = useState(false)

    useEffect(() => {
        try {
            const seen =
                window.sessionStorage.getItem(NOTICE_STORAGE_KEY)

            if (!seen) {
                setIsOpen(true)
            }
        } catch {
            setIsOpen(true)
        }

        function handleOpen() {
            setIsOpen(true)
        }

        window.addEventListener(
            NOTICE_OPEN_EVENT,
            handleOpen
        )

        return () => {
            window.removeEventListener(
                NOTICE_OPEN_EVENT,
                handleOpen
            )
        }
    }, [])

    function closeNotice() {
        try {
            window.sessionStorage.setItem(
                NOTICE_STORAGE_KEY,
                "1"
            )
        } catch {
        }

        setIsOpen(false)
    }

    if (!isOpen) {
        return null
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]

                flex
                items-center
                justify-center

                bg-black/70
                p-4
                backdrop-blur-md

                sm:p-6
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-notice-title"
        >
            <div
                className="
                    relative
                    max-h-[calc(100vh-2rem)]
                    w-full
                    max-w-2xl
                    overflow-y-auto

                    rounded-3xl
                    border
                    border-violet-500/30
                    bg-zinc-950
                    p-5
                    shadow-2xl
                    shadow-black/60

                    sm:p-7
                "
            >
                <button
                    type="button"
                    onClick={closeNotice}
                    aria-label="Close notice"
                    className="
                        absolute
                        right-4
                        top-4

                        flex
                        h-10
                        w-10
                        items-center
                        justify-center

                        rounded-2xl
                        border
                        border-zinc-800
                        bg-black
                        text-zinc-400

                        transition-colors
                        hover:border-violet-500/40
                        hover:text-white
                    "
                >
                    <X size={18} />
                </button>

                <div
                    className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center

                        rounded-2xl
                        border
                        border-violet-500/30
                        bg-violet-500/10
                        text-violet-200
                    "
                >
                    <Info size={22} />
                </div>

                <h2
                    id="archive-notice-title"
                    className="
                        mt-5
                        pr-12
                        text-2xl
                        font-black
                        leading-tight
                        text-white

                        sm:text-3xl
                    "
                >
                    Archive Notice
                </h2>

                <div
                    className="
                        mt-4
                        space-y-4
                        text-sm
                        leading-7
                        text-zinc-300

                        sm:text-base
                    "
                >
                    <p>
                        This website exists as an archive of ROM Handbook because I still rely on it to search, compare, and trace relationships between archived game data.
                    </p>

                    <p>
                        For now, the site is focused on preservation. If you know where some of the original detailed data comes from, or you notice missing relationships that can be recovered, I may be able to add them in the future.
                    </p>

                    <p>
                        The frontend and static assets are served through Cloudflare, while the backend runs on my own server. If some pages feel slow, thank you for your patience.
                    </p>
                </div>

                <div
                    className="
                        mt-6
                        flex
                        flex-col
                        gap-3

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    <a
                        href="https://github.com/FawziLinggo/archive-romhandbook"
                        target="_blank"
                        rel="noreferrer"
                        className="
                            inline-flex
                            h-11
                            items-center
                            justify-center
                            gap-2

                            rounded-2xl
                            border
                            border-zinc-800
                            bg-black
                            px-4
                            text-sm
                            font-bold
                            text-zinc-300

                            transition-colors
                            hover:border-violet-500/40
                            hover:text-white
                        "
                    >
                        <Archive size={17} />
                        View Source
                    </a>

                    <button
                        type="button"
                        onClick={closeNotice}
                        className="
                            inline-flex
                            h-11
                            items-center
                            justify-center

                            rounded-2xl
                            border
                            border-violet-500/40
                            bg-violet-500/10
                            px-5
                            text-sm
                            font-black
                            text-violet-100

                            transition-colors
                            hover:bg-violet-500/20
                        "
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )
}