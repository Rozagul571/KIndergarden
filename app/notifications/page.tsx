"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, ShoppingCart, AlertCircle, ChefHat } from "lucide-react"

interface Notification {
  id: number
  type: "meal_served" | "order_status" | "inventory_alert" | "system"
  message: string
  timestamp: string
  read: boolean
}

// Sample data for demonstration
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "meal_served",
    message: "Maria Garcia served 10 portions of Osh (Plov)",
    timestamp: "2025-05-12T09:30:00",
    read: false,
  },
  {
    id: 2,
    type: "order_status",
    message: "Order #3 for Chicken has been approved",
    timestamp: "2025-05-12T08:45:00",
    read: false,
  },
  {
    id: 3,
    type: "inventory_alert",
    message: "Potato is running low (500g remaining)",
    timestamp: "2025-05-12T08:30:00",
    read: false,
  },
  {
    id: 4,
    type: "meal_served",
    message: "David Lee served 15 portions of Lagman",
    timestamp: "2025-05-11T12:15:00",
    read: true,
  },
  {
    id: 5,
    type: "order_status",
    message: "Order #2 for Rice has been delivered",
    timestamp: "2025-05-11T11:30:00",
    read: true,
  },
  {
    id: 6,
    type: "inventory_alert",
    message: "Carrot is out of stock",
    timestamp: "2025-05-11T10:45:00",
    read: true,
  },
  {
    id: 7,
    type: "system",
    message: "Monthly report for April 2025 has been generated",
    timestamp: "2025-05-01T00:00:00",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

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
      case "system":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${notification.read ? "bg-background" : "bg-muted"}`}
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
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {getUnreadNotifications().length > 0 ? (
                  getUnreadNotifications().map((notification) => (
                    <div key={notification.id} className="p-4 rounded-lg border bg-muted">
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
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No unread notifications</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
