import type React from "react"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { ProtectedRoute } from "@/components/protected-route"

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <WebSocketProvider>{children}</WebSocketProvider>
    </ProtectedRoute>
  )
}
