"use client"

import { useWebSocket } from "@/contexts/websocket-context"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function WebSocketStatus() {
  const { connected, connectionType } = useWebSocket()

  return (
    <Badge
      variant={connected ? "outline" : "destructive"}
      className={`ml-2 ${
        connectionType === "mock"
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          : connected
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : ""
      }`}
    >
      {connected ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          {connectionType === "mock" ? "Mock" : "Connected"}
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </>
      )}
    </Badge>
  )
}
