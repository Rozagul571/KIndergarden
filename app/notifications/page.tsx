"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, ShoppingCart, AlertCircle, ChefHat, Package, Clock } from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"
import { motion } from "framer-motion"

interface Notification {
  id: number
  type: "meal_served" | "order_status" | "inventory_alert" | "inventory_delivery" | "inventory_update" | "system"
  message: string
  timestamp: string
  read: boolean
  user?: {
    name: string
    id: number
  }
}

// Sample data for demonstration
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "meal_served",
    message: "Maria Garcia served 10 portions of Osh (Plov)",
    timestamp: "2025-05-17T09:30:00",
    read: false,
    user: {
      name: "Maria Garcia",
      id: 2,
    },
  },
  {
    id: 2,
    type: "order_status",
    message: "Order #3 for Chicken has been approved by Admin",
    timestamp: "2025-05-17T08:45:00",
    read: false,
    user: {
      name: "Admin",
      id: 1,
    },
  },
  {
    id: 3,
    type: "inventory_alert",
    message: "Potato is running low (500g remaining)",
    timestamp: "2025-05-17T08:30:00",
    read: false,
  },
  {
    id: 4,
    type: "inventory_delivery",
    message: "David Lee added 2kg of Rice to inventory",
    timestamp: "2025-05-16T15:15:00",
    read: true,
    user: {
      name: "David Lee",
      id: 3,
    },
  },
  {
    id: 5,
    type: "inventory_update",
    message: "Admin updated Carrot quantity from 1kg to 500g",
    timestamp: "2025-05-16T14:30:00",
    read: true,
    user: {
      name: "Admin",
      id: 1,
    },
  },
  {
    id: 6,
    type: "inventory_alert",
    message: "Carrot is out of stock",
    timestamp: "2025-05-16T10:45:00",
    read: true,
  },
  {
    id: 7,
    type: "system",
    message: "Monthly report for May 2025 has been generated",
    timestamp: "2025-05-01T00:00:00",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const { lastMessage } = useWebSocket()

  // Add new notifications from WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.message) {
      const newNotification: Notification = {
        id: lastMessage.id || Date.now(),
        type: (lastMessage.type as any) || "system",
        message: lastMessage.message,
        timestamp: lastMessage.timestamp || new Date().toISOString(),
        read: false,
        user: lastMessage.user,
      }

      setNotifications((prev) => {
        // Check if notification with this ID already exists
        const exists = prev.some((n) => n.id === newNotification.id)
        if (exists) return prev
        return [newNotification, ...prev]
      })
    }
  }, [lastMessage])

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const getUnreadNotifications = () => {
    return notifications.filter((notification) => !notification.read)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meal_served":
        return <ChefHat className="h-5 w-5" />
      case "order_status":
        return <ShoppingCart className="h-5 w-5" />
      case "inventory_alert":
        return <AlertCircle className="h-5 w-5" />
      case "inventory_delivery":
        return <Package className="h-5 w-5" />
      case "inventory_update":
        return <Clock className="h-5 w-5" />
      case "system":
        return <Bell className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "meal_served":
        return "bg-green-100 text-green-800"
      case "order_status":
        return "bg-blue-100 text-blue-800"
      case "inventory_alert":
        return "bg-red-100 text-red-800"
      case "inventory_delivery":
        return "bg-amber-100 text-amber-800"
      case "inventory_update":
        return "bg-purple-100 text-purple-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({getUnreadNotifications().length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all system notifications and alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.read ? "bg-background" : "bg-muted"}`}
                    variants={item}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <p className="font-medium">{notification.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Badge variant={notification.read ? "outline" : "secondary"}>
                          {notification.read ? "Read" : "New"}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>View your unread notifications and alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {getUnreadNotifications().length > 0 ? (
                  getUnreadNotifications().map((notification) => (
                    <motion.div key={notification.id} className="p-4 rounded-lg border bg-muted" variants={item}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Badge variant="secondary">New</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No unread notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
