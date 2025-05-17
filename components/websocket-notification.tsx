"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "@/contexts/websocket-context"
import { Bell, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { User, Package, ShoppingCart, AlertCircle, Check, X } from "lucide-react"

interface Notification {
  id: number
  type: string
  message: string
  timestamp: string
  read: boolean
}

export function WebSocketNotification() {
  const { connected, lastMessage, connectionType } = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Update notifications when a new message is received
  useEffect(() => {
    if (lastMessage && lastMessage.message) {
      const newNotification: Notification = {
        id: lastMessage.id || Date.now(),
        type: lastMessage.type || "notification",
        message: lastMessage.message,
        timestamp: lastMessage.timestamp || new Date().toISOString(),
        read: false,
      }

      // Add the new notification to the list
      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      setUnreadCount((prev) => prev + 1)

      // Show the notification popup
      setShowNotification(true)

      // Hide the notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [lastMessage])

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    if (type.includes("order")) return <ShoppingCart className="h-4 w-4 mr-1" />
    if (type.includes("inventory") || type.includes("delivery")) return <Package className="h-4 w-4 mr-1" />
    if (type.includes("user")) return <User className="h-4 w-4 mr-1" />
    if (type.includes("error")) return <X className="h-4 w-4 mr-1" />
    if (type.includes("success")) return <Check className="h-4 w-4 mr-1" />
    return <AlertCircle className="h-4 w-4 mr-1" />
  }

  if (notifications.length === 0) {
    return (
      <>
        {/* Connection status indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full ${connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            onClick={() => markAllAsRead()}
          >
            {connected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
            {connectionType === "mock" ? "Mock" : "Live"}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Connection status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full ${connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          onClick={() => markAllAsRead()}
        >
          {connected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
          {connectionType === "mock" ? "Mock" : "Live"}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
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
            <Card className="p-4 shadow-lg border-l-4 border-amber-500 max-w-md">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {lastMessage.type?.charAt(0).toUpperCase() + lastMessage.type?.slice(1) || "Notification"}
                  </h4>
                  <p className="text-sm text-gray-600">{lastMessage.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(lastMessage.timestamp).toLocaleTimeString()}
                    </span>
                    <Link href="/notifications" className="text-xs text-amber-600 hover:text-amber-800">
                      View All
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
