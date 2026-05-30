type Props = {
    html: string
}

import {
    assetUrl
} from "@/lib/utils"


function rewriteArchiveAssetUrls(
    html: string
) {
    const assetBaseUrl =
        process.env.NEXT_PUBLIC_ASSET_BASE_URL

    if (!assetBaseUrl) {
        return html
    }

    const normalizedBaseUrl =
        assetBaseUrl.replace(
            /\/$/,
            ""
        )

    return html
        .replaceAll(
            'src="/assets/',
            `src="${normalizedBaseUrl}/assets/`
        )
        .replaceAll(
            "src='/assets/",
            `src='${normalizedBaseUrl}/assets/`
        )
        .replaceAll(
            'href="/assets/',
            `href="${normalizedBaseUrl}/assets/`
        )
        .replaceAll(
            "href='/assets/",
            `href='${normalizedBaseUrl}/assets/`
        )
}


export default function RomHtmlViewer({
    html
}: Props) {

    // =========================
    // FULL HTML
    // =========================


    const rewrittenHtml =
        rewriteArchiveAssetUrls(html)

    const fullHtml = `
                <html>

                <head>

<link
    rel="stylesheet"
href="${assetUrl("/assets/romhandbook/application.css")}"
/>

<link
    rel="stylesheet"
    href="${assetUrl("/assets/romhandbook/tailwind.css")}"
/>

<link
    rel="stylesheet"
    href="${assetUrl("/assets/romhandbook/romhandbook.css")}"
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

                ${rewrittenHtml}

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