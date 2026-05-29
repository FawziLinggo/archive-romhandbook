type Props = {
    html: string
}

export default function RomHtmlViewer({
    html
}: Props) {

    // =========================
    // FULL HTML
    // =========================

    const fullHtml = `
                <html>

                <head>

<link
    rel="stylesheet"
    href="/assets/romhandbook/application.css"
/>

<link
    rel="stylesheet"
    href="/assets/romhandbook/tailwind.css"
/>

<link
    rel="stylesheet"
    href="/assets/romhandbook/inter-font.css"
/>

                <style>

                body{
                    background:#09090b;
                    padding:20px;
                }

                /* disable links */
                a{
                    pointer-events:none !important;
                    cursor:default !important;
                    text-decoration:none !important;
                }

                </style>

                </head>

                <body>

                ${html}

                </body>

                </html>
`

    return (

        <div
            className="
                rounded-3xl
                overflow-hidden
                border
                border-zinc-800
                bg-zinc-950
                shadow-2xl
            "
        >


            {/* HTML VIEWER */}
            <iframe
                srcDoc={fullHtml}
                sandbox="
                    allow-same-origin
                "
                className="
                    w-full
                    h-[1200px]
                    bg-white
                "
            />

        </div>

    )

}