import MagicCursorTrail from "@/components/effects/MagicCursorTrail"
import "./globals.css"

import Navbar from "@/components/layout/Navbar"

import Sidebar from "@/components/layout/Sidebar"


import AIAssistant from "@/components/ai-assistant/AIAssistant"

import { SidebarProvider } from "@/contexts/SidebarContext"

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

        <SidebarProvider>

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
        </SidebarProvider>
      </body>

    </html>

  )

}