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

          <div
            className="
                            flex
                            min-h-[calc(100vh-4rem)]
                        "
          >

            <Sidebar />

            <main
              className="
        min-w-0
        flex-1

        px-5
        py-6

        sm:px-6
        sm:py-7

        lg:px-8
        lg:py-8
    "
            >
              {children}
            </main>

          </div>

          <AIAssistant />

          <div className="hidden md:block">
            <MagicCursorTrail />
          </div>

        </SidebarProvider>

      </body>

    </html>

  )

}