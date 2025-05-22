import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNavigation } from "@/components/main-navigation"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import { WebSocketProvider } from "@/contexts/websocket-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KinderChef - Kindergarten Meal Management",
  description: "Meal tracking and inventory management system for kindergartens",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <WebSocketProvider>
              <div className="min-h-screen bg-gray-50">
                <MainNavigation />
                <main>{children}</main>
              </div>
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
