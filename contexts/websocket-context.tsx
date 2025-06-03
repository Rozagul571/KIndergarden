"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface WebSocketContextType {
  connected: boolean
  sendMessage: (message: any) => void
  lastMessage: any | null
  connectionType: "real" | "mock"
  notifications: Notification[]
  markAsRead: (id: number | string) => void
  markAllAsRead: () => void
  deleteNotification: (id: number | string) => void
}

interface Notification {
  id: number | string
  type: string
  message: string
  timestamp: string
  read: boolean
  user?: {
    id?: number
    name?: string
    role?: string
  }
  data?: any
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({
  children,
  url = "ws://localhost:8000/ws",
}: {
  children: ReactNode
  url?: string
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const [connectionType, setConnectionType] = useState<"real" | "mock">("mock")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  // Load saved notifications from localStorage on initial render
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
    } catch (error) {
      console.error("Error loading saved notifications:", error)
    }
  }, [])

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }, [notifications])

  // Initialize WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null
    let mockMode = false

    const setupMockMode = () => {
      mockMode = true
      setConnectionType("mock")
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
                processMessage(data)
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
  }, [url])

  // Process incoming messages
  const processMessage = useCallback(
    (data: any) => {
      // Skip system login messages
      if (data.type === "system" && data.message?.includes("logged in")) {
        return
      }

      // Set as last message
      setLastMessage(data)

      // Add calculation information if not present
      if (data.data && !data.data.calculatedBy) {
        if (data.type.includes("inventory")) {
          data.data.calculatedBy = "Celery inventory task"
        } else if (data.type.includes("meal")) {
          data.data.calculatedBy = "Celery meal processing task"
        } else if (data.type.includes("order")) {
          data.data.calculatedBy = "Celery order management task"
        } else {
          data.data.calculatedBy = "Celery background task"
        }
      }

      // Create notification from message
      const notification: Notification = {
        id: data.id || Date.now(),
        type: data.type || "notification",
        message: data.message || "New notification",
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        user: data.user || { name: data.userName || "System" },
        data: data.data || {},
      }

      // Only show notifications relevant to the user's role
      const shouldShowNotification = () => {
        // Admin sees all notifications
        if (user?.role === "admin") return true

        // Cooks only see cook-related notifications
        if (user?.role === "cook") {
          return data.type?.includes("meal") || data.type?.includes("inventory") || data.user?.id === user.id
        }

        // Managers see inventory and order notifications
        if (user?.role === "manager") {
          return data.type?.includes("inventory") || data.type?.includes("order") || data.user?.id === user.id
        }

        return false
      }

      if (shouldShowNotification()) {
        setNotifications((prev) => {
          // Check if notification with this ID already exists
          const exists = prev.some((n) => n.id === notification.id)
          if (exists) return prev
          return [notification, ...prev]
        })

        // Show toast notification for important events
        if (data.type && !data.type.includes("system")) {
          toast({
            title: data.type.charAt(0).toUpperCase() + data.type.slice(1).replace(/_/g, " "),
            description: notification.message,
            variant: data.type.includes("error") ? "destructive" : "default",
          })
        }
      }
    },
    [toast, user?.role, user?.id],
  )

  // Function to send messages through WebSocket
  const sendMessage = useCallback(
    (message: any) => {
      // Skip system login messages
      if (message.type === "system" && message.message?.includes("logged in")) {
        return
      }

      // Add user information if not present
      const messageWithUser = {
        ...message,
        user: message.user || {
          id: user?.id,
          name: user?.name || "Current User",
          role: user?.role || "user",
        },
        timestamp: message.timestamp || new Date().toISOString(),
      }

      // Ensure data object exists
      if (!messageWithUser.data) {
        messageWithUser.data = {}
      }

      // Add calculation information
      if (messageWithUser.type?.includes("inventory")) {
        messageWithUser.data.calculatedBy = "Celery inventory task"
      } else if (messageWithUser.type?.includes("meal")) {
        messageWithUser.data.calculatedBy = "Celery meal processing task"
      } else if (messageWithUser.type?.includes("order")) {
        messageWithUser.data.calculatedBy = "Celery order management task"
      } else {
        messageWithUser.data.calculatedBy = "Celery background task"
      }

      if (socket && connected && connectionType === "real") {
        try {
          socket.send(JSON.stringify(messageWithUser))
        } catch (error) {
          console.error("Error sending WebSocket message:", error)
          // Fall back to mock mode on error
          setConnectionType("mock")
          handleMockMessage(messageWithUser)
        }
      } else {
        // Mock implementation for sending messages
        handleMockMessage(messageWithUser)
      }
    },
    [socket, connected, connectionType, user],
  )

  // Handle mock messages
  const handleMockMessage = useCallback(
    (message: any) => {
      // Skip system login messages
      if (message.type === "system" && message.message?.includes("logged in")) {
        return
      }

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
        case "meal_created":
          notificationMessage = `${userName} created a new meal: ${msgObj.data?.name || ""}`
          break
        case "meal_updated":
          notificationMessage = `${userName} updated meal: ${msgObj.data?.name || ""}`
          break
        case "meal_deleted":
          notificationMessage = `${userName} deleted meal with ID: ${msgObj.data?.id || ""}`
          break
        case "order_created":
          notificationMessage = `${userName} created an order for ${msgObj.data?.quantity || ""} ${msgObj.data?.unit || ""} of ${msgObj.data?.ingredientName || "an ingredient"}`
          break
        case "order_status_update":
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
        user: {
          id: msgObj.user?.id,
          name: userName,
          role: msgObj.user?.role || "user",
        },
        data: msgObj.data || {},
      }

      // Process the mock message
      processMessage(mockResponse)
    },
    [processMessage],
  )

  // Mark notification as read
  const markAsRead = useCallback((id: number | string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  // Delete notification
  const deleteNotification = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        sendMessage,
        lastMessage,
        connectionType,
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
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
