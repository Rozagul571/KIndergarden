import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function ServeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole={["admin", "cook"]}>{children}</ProtectedRoute>
}
