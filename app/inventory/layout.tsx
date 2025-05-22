import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole={["admin", "manager"]}>{children}</ProtectedRoute>
}
