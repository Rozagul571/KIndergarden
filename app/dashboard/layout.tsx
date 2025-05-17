import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthButton } from "@/components/auth-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Settings, Bell } from "lucide-react"
import { WebSocketStatus } from "@/components/websocket-status"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="flex items-center space-x-2">
                <ChefHat className="h-6 w-6" />
                <span className="font-bold">KinderChef</span>
              </Link>
            </div>
            <nav className="flex flex-1 items-center justify-end space-x-1">
              <Link href="/dashboard" passHref>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/inventory" passHref>
                <Button variant="ghost">Inventory</Button>
              </Link>
              <Link href="/meals" passHref>
                <Button variant="ghost">Meals</Button>
              </Link>
              <Link href="/orders" passHref>
                <Button variant="ghost">Orders</Button>
              </Link>
              <Link href="/reports" passHref>
                <Button variant="ghost">Reports</Button>
              </Link>
              <Link href="/notifications" passHref>
                <Button variant="ghost">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/settings" passHref>
                <Button variant="ghost">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <WebSocketStatus />
                <AuthButton />
              </div>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </ProtectedRoute>
  )
}
