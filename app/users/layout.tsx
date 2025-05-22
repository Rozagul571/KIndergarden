import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
}
