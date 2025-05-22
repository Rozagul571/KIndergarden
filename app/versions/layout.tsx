import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function VersionsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRoles={["admin", "manager", "cook"]}>{children}</ProtectedRoute>
}
