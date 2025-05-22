"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "@/contexts/websocket-context"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { User, Package, ShoppingCart, AlertCircle, Check, X, Utensils } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function WebSocketNotification() {
  const { connected, lastMessage, connectionType, notifications } = useWebSocket()
  const [showNotification, setShowNotification] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  // Update unread count
  useEffect(() => {
    const count = notifications?.filter((n) => !n.read).length || 0
    setUnreadCount(count)
  }, [notifications])

  // Show notification popup when a new message is received
  useEffect(() => {
    if (lastMessage && lastMessage.message && user?.role === "admin") {
      setShowNotification(true)

      // Hide the notification after 8 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [lastMessage, user?.role])

  const getNotificationIcon = (type: string) => {
    if (type.includes("order")) return <ShoppingCart className="h-5 w-5 mr-2" />
    if (type.includes("inventory") || type.includes("delivery")) return <Package className="h-5 w-5 mr-2" />
    if (type.includes("meal")) return <Utensils className="h-5 w-5 mr-2" />
    if (type.includes("user")) return <User className="h-5 w-5 mr-2" />
    if (type.includes("error")) return <X className="h-5 w-5 mr-2" />
    if (type.includes("success")) return <Check className="h-5 w-5 mr-2" />
    return <AlertCircle className="h-5 w-5 mr-2" />
  }

  // Format the notification message to be more descriptive
  const formatNotificationMessage = (message: string, type: string, user: any) => {
    if (!user || !user.name) return message

    const userName = user.name

    // Create more descriptive messages based on action type
    if (type.includes("inventory_created")) {
      return `${userName} added a new ingredient to inventory`
    }
    if (type.includes("inventory_updated")) {
      return `${userName} updated inventory item`
    }
    if (type.includes("meal_served")) {
      return `${userName} served a meal`
    }
    if (type.includes("meal_created")) {
      return `${userName} created a new meal`
    }
    if (type.includes("order_created")) {
      return `${userName} created a new order`
    }
    if (type.includes("order_updated")) {
      return `${userName} updated an order status`
    }

    // If no specific format, return the original message
    return message
  }

  // Only show for admin users
  if (user?.role !== "admin") {
    return null
  }

  return (
    <>
      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/notifications">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full ${connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {connected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
            {connectionType === "mock" ? "Mock" : "Live"}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </Link>
      </div>

      {/* Notification popup */}
      <AnimatePresence>
        {showNotification && lastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "50%" }}
            animate={{ opacity: 1, y: 0, x: "50%" }}
            exit={{ opacity: 0, y: 50, x: "50%" }}
            className="fixed bottom-16 right-1/2 transform translate-x-1/2 z-50"
          >
            <Card className="p-5 shadow-xl border-l-4 border-amber-500 max-w-md w-full">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">{getNotificationIcon(lastMessage.type || "")}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">
                    {lastMessage.type?.charAt(0).toUpperCase() + lastMessage.type?.slice(1).replace(/_/g, " ") ||
                      "Notification"}
                  </h4>
                  <p className="text-base text-gray-700 my-2">
                    {formatNotificationMessage(lastMessage.message, lastMessage.type || "", lastMessage.user)}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                    {lastMessage.user?.name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="font-medium text-amber-700">{lastMessage.user.name}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(lastMessage.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-3 text-right">
                    <Link href="/notifications">
                      <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-800">
                        View All Notifications
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
