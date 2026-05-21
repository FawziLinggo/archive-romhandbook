
export default function Navbar() {

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
                    "
                >
                    <a href="/">ROM Handbook Archive</a>
                </div>

                {/* GITHUB */}
                <a
                    href="https://galauit.com"
                    target="_blank"
                    className="
                        text-sm
                        text-zinc-400
                        hover:text-white
                        transition-colors
                    "
                >
                    Made with ❤️ by galauit
                </a>

            </div>

        </header>

    )
}