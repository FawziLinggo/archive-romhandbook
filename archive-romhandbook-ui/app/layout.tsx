import MagicCursorTrail from "@/components/effects/MagicCursorTrail"
import "./globals.css"

import Navbar from "@/components/layout/Navbar"

import Sidebar from "@/components/layout/Sidebar"


import AIAssistant from "@/components/ai-assistant/AIAssistant"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <html lang="en">

      <body
        className="
          bg-black
          text-white
        "
      >

        <Navbar />

        <div className="flex">

          <Sidebar />

          <main
            className="
              flex-1
              p-6
            "
          >
            {children}
          </main>

        </div>

        <AIAssistant />
        <MagicCursorTrail />
      </body>

    </html>

  )

}