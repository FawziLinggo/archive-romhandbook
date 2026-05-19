import "./globals.css"

import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

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

          <main className="flex-1 p-6">
            {children}
          </main>

        </div>

      </body>

    </html>

  )
}