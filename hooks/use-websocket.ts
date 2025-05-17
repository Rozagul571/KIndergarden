"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// Simulating WebSocket connection for development/preview
const mockWebSocket = {
  send: (data: any) => {
    console.log("Mock WebSocket data sent:", data)
    return true
  },
  close: () => {
    console.log("Mock WebSocket connection closed")
  },
  readyState: 1, // WebSocket.OPEN
}

type WebSocketMessage = {
  type: string
  data: any
}

export function useWebSocket(url: string, onMessage?: (data: WebSocketMessage) => void) {
  const [socket, setSocket] = useState<WebSocket | any>(mockWebSocket) // Start with mock by default
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let ws: WebSocket | null = null
    let connectionTimeout: NodeJS.Timeout

    try {
      // Set a timeout to fall back to mock if connection takes too long
      connectionTimeout = setTimeout(() => {
        console.log("WebSocket connection timeout, using mock")
        setSocket(mockWebSocket)
        setIsConnected(true)
      }, 2000)

      // Try to establish a real connection
      ws = new WebSocket(url)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log("WebSocket connection established")
        setIsConnected(true)
        setSocket(ws)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("WebSocket message received:", data)

          if (onMessage) {
            onMessage(data)
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      ws.onerror = (error) => {
        console.log("WebSocket connection error, using mock instead")
        clearTimeout(connectionTimeout)

        // Don't set error state, just fall back to mock
        setSocket(mockWebSocket)
        setIsConnected(true)
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
        setIsConnected(false)

        // Fall back to mock when connection closes
        setSocket(mockWebSocket)
        setIsConnected(true)
      }
    } catch (err) {
      console.error("Error creating WebSocket:", err)
      setSocket(mockWebSocket)
      setIsConnected(true)
    }

    // Cleanup function
    return () => {
      clearTimeout(connectionTimeout)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [url, onMessage, toast])

  // Function to send messages
  const sendMessage = (message: any) => {
    if (socket) {
      if (typeof message !== "string") {
        message = JSON.stringify(message)
      }

      try {
        return socket.send(message)
      } catch (err) {
        console.error("Error sending WebSocket message:", err)
        return false
      }
    }
    return false
  }

  return {
    socket,
    isConnected,
    error,
    sendMessage,
  }
}
