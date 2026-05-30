import MagicCursorTrail from "@/components/effects/MagicCursorTrail"
import { AuthProvider } from "@/contexts/AuthContext"
import "@xyflow/react/dist/style.css"
import "./globals.css"

import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

import AIAssistant from "@/components/ai-assistant/AIAssistant"

import { SidebarProvider } from "@/contexts/SidebarContext"


import type {
  Metadata
} from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://rom.galauit.com"),

  title: {
    default: "ROM Handbook Archive",
    template: "%s | ROM Handbook Archive"
  },

  description:
    "Preserving ROM Handbook data: cards, equipments, headwears, monsters, skills, formulas, pets, mounts, and archive graph relations.",

  applicationName: "ROM Handbook Archive",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  },

  openGraph: {
    type: "website",
    url: "https://rom.galauit.com",
    siteName: "ROM Handbook Archive",
    title: "ROM Handbook Archive",
    description:
      "Browse archived ROM Handbook cards, equipments, monsters, skills, formulas, and graph relations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ROM Handbook Archive"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "ROM Handbook Archive",
    description:
      "Browse archived ROM Handbook cards, equipments, monsters, skills, formulas, and graph relations.",
    images: [
      "/og-image.png"
    ]
  }
}

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

          <AuthProvider>

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

          </AuthProvider>

        </SidebarProvider>

      </body>

    </html>

  )

}