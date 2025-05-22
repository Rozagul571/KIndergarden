import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">{children}</div>
    </ProtectedRoute>
  )
}
