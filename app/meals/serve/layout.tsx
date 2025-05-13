import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function MealsServeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole={["admin", "cook", "manager"]}>{children}</ProtectedRoute>
}
