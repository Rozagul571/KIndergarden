"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface WebSocketContextType {
  connected: boolean
  sendMessage: (message: any) => void
  lastMessage: any | null
  connectionType: "real" | "mock"
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({
  children,
  url,
}: {
  children: ReactNode
  url: string
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const [connectionType, setConnectionType] = useState<"real" | "mock">("mock")
  const { toast } = useToast()

  // Initialize WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null
    let mockMode = false

    const setupMockMode = () => {
      mockMode = true
      setConnectionType("mock")
      setConnected(true)
      console.log("Using mock WebSocket mode")
    }

    try {
      // Only attempt WebSocket connection in browser environment
      if (typeof window !== "undefined") {
        // Use mock mode by default for development
        setupMockMode()

        // Attempt real connection only if URL is valid
        if (url && url !== "ws://localhost:8000/ws") {
          try {
            ws = new WebSocket(url)

            ws.onopen = () => {
              console.log("WebSocket connected")
              setConnected(true)
              setConnectionType("real")
              mockMode = false
            }

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data)
                setLastMessage(data)

                // Show toast notification for important events
                if (data.type && data.message) {
                  toast({
                    title: data.type.charAt(0).toUpperCase() + data.type.slice(1),
                    description: data.message,
                    variant: data.type === "error" ? "destructive" : "default",
                  })
                }
              } catch (e) {
                console.error("Failed to parse WebSocket message:", e)
              }
            }

            ws.onerror = (error) => {
              console.log("WebSocket error, using mock implementation", error)

              // Close the real connection if it exists
              if (ws && ws.readyState !== WebSocket.CLOSED) {
                try {
                  ws.close()
                } catch (e) {
                  console.error("Error closing WebSocket:", e)
                }
              }

              setupMockMode()
            }

            ws.onclose = () => {
              if (!mockMode) {
                console.log("WebSocket disconnected")
                setConnected(false)
                setupMockMode()
              }
            }

            setSocket(ws)
          } catch (error) {
            console.error("Failed to create WebSocket connection:", error)
            setupMockMode()
          }
        }
      }
    } catch (error) {
      console.error("WebSocket setup error:", error)
      setupMockMode()
    }

    // Cleanup function
    return () => {
      if (ws && ws.readyState !== WebSocket.CLOSED && !mockMode) {
        try {
          ws.close()
        } catch (e) {
          console.error("Error during WebSocket cleanup:", e)
        }
      }
    }
  }, [url, toast])

  // Function to send messages through WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      if (socket && connected && connectionType === "real") {
        try {
          socket.send(JSON.stringify(message))
        } catch (error) {
          console.error("Error sending WebSocket message:", error)
          // Fall back to mock mode on error
          setConnectionType("mock")
          handleMockMessage(message)
        }
      } else {
        // Mock implementation for sending messages
        handleMockMessage(message)
      }
    },
    [socket, connected, connectionType],
  )

  // Handle mock messages
  const handleMockMessage = useCallback(
    (message: any) => {
      console.log("Mock WebSocket - Message sent:", message)

      // Format the message object if it's a string
      const msgObj = typeof message === "string" ? JSON.parse(message) : message

      // Create a user-friendly notification
      const userName = msgObj.user?.name || msgObj.userName || "A user"
      const timestamp = new Date().toISOString()

      let notificationMessage = ""
      const notificationType = msgObj.type || "notification"

      // Create appropriate notification based on message type
      switch (msgObj.type) {
        case "inventory_delivery":
          notificationMessage = `${userName} added ${msgObj.data?.quantity || ""} ${msgObj.data?.unit || ""} of ${msgObj.data?.name || "an ingredient"} to inventory`
          break
        case "inventory_update":
          notificationMessage = `${userName} updated ${msgObj.data?.name || "an ingredient"} from ${msgObj.data?.previousQuantity || ""} to ${msgObj.data?.quantity || ""} ${msgObj.data?.unit || ""}`
          break
        case "meal_served":
          notificationMessage = `${userName} served ${msgObj.data?.portions || ""} portions of ${msgObj.data?.mealName || "a meal"}`
          break
        case "order_created":
          notificationMessage = `${userName} created an order for ${msgObj.data?.quantity || ""} ${msgObj.data?.unit || ""} of ${msgObj.data?.ingredientName || "an ingredient"}`
          break
        case "order_status":
          notificationMessage = `${userName} ${msgObj.data?.status?.toLowerCase() || "updated"} order #${msgObj.data?.id || ""} for ${msgObj.data?.ingredientName || "an ingredient"}`
          break
        default:
          notificationMessage = msgObj.message || "Action completed"
      }

      // Create the mock response
      const mockResponse = {
        id: Date.now(),
        type: notificationType,
        message: notificationMessage,
        timestamp: timestamp,
        user: msgObj.user || { name: userName },
        read: false,
      }

      // Update last message state
      setLastMessage(mockResponse)

      // Show toast for mock responses
      toast({
        title: mockResponse.type.charAt(0).toUpperCase() + mockResponse.type.slice(1),
        description: mockResponse.message,
      })

      // In a real implementation, this would save to the database
      console.log("Notification saved to database:", mockResponse)
    },
    [toast],
  )

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, lastMessage, connectionType }}>
      {children}
    </WebSocketContext.Provider>
  )
}

// Export the hook with the name that's being imported in other components
export function useWebSocket() {
  const context = useContext(WebSocketContext)

  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }

  return context
}

// Also export with the original name for backward compatibility
export function useWebSocketContext() {
  return useWebSocket()
}
