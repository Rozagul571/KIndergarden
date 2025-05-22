"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/contexts/websocket-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Clock, Package, ShoppingCart, Trash2, User, Utensils } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useWebSocket()
  const [activeTab, setActiveTab] = useState("all")
  const [filteredNotifications, setFilteredNotifications] = useState(notifications)
  const { user } = useAuth()

  // Filter notifications based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredNotifications(notifications)
    } else if (activeTab === "unread") {
      setFilteredNotifications(notifications.filter((notification) => !notification.read))
    } else {
      setFilteredNotifications(notifications.filter((notification) => notification.type.includes(activeTab)))
    }
  }, [activeTab, notifications])

  const getNotificationIcon = (type: string) => {
    if (type.includes("order")) return <ShoppingCart className="h-5 w-5" />
    if (type.includes("inventory") || type.includes("delivery")) return <Package className="h-5 w-5" />
    if (type.includes("meal")) return <Utensils className="h-5 w-5" />
    return <Bell className="h-5 w-5" />
  }

  const getNotificationColor = (type: string) => {
    if (type.includes("order")) return "bg-blue-100 text-blue-700"
    if (type.includes("inventory") || type.includes("delivery")) return "bg-green-100 text-green-700"
    if (type.includes("meal")) return "bg-amber-100 text-amber-700"
    return "bg-purple-100 text-purple-700"
  }

  const formatNotificationTitle = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")
  }

  // Add some sample notifications for May 23
  useEffect(() => {
    if (notifications.length === 0) {
      const sampleNotifications = [
        {
          id: "1",
          type: "meal_served",
          message: "Og'iloy Tursunova served 15 portions of Osh (Plov)",
          timestamp: "2025-05-23T12:30:00",
          read: false,
          user: {
            id: 2,
            name: "Og'iloy Tursunova",
            role: "cook",
          },
        },
        {
          id: "2",
          type: "meal_served",
          message: "Muxtasar Azizova served 12 portions of Lagman",
          timestamp: "2025-05-23T09:15:00",
          read: false,
          user: {
            id: 3,
            name: "Muxtasar Azizova",
            role: "cook",
          },
        },
        {
          id: "3",
          type: "meal_served",
          message: "Aziza Rahimova served 20 portions of Somsa",
          timestamp: "2025-05-23T10:45:00",
          read: false,
          user: {
            id: 5,
            name: "Aziza Rahimova",
            role: "cook",
          },
        },
        {
          id: "4",
          type: "inventory_updated",
          message: "Kamola Umarova updated Rice inventory from 50kg to 35kg",
          timestamp: "2025-05-23T11:20:00",
          read: false,
          user: {
            id: 4,
            name: "Kamola Umarova",
            role: "manager",
          },
        },
        {
          id: "5",
          type: "order_created",
          message: "Shakhzoda Kamalova created a new order for 25kg of Beef",
          timestamp: "2025-05-23T14:05:00",
          read: false,
          user: {
            id: 6,
            name: "Shakhzoda Kamalova",
            role: "manager",
          },
        },
      ]

      // In a real app, you would add these to the WebSocket context
      // For now, we'll just pretend they're already there
    }
  }, [notifications])

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">View and manage your system notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => markAllAsRead()}>
            <Check className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            All
            <Badge variant="outline" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <Badge variant="outline" className="ml-2">
              {notifications.filter((n) => !n.read).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="meal">
            Meals
            <Badge variant="outline" className="ml-2">
              {notifications.filter((n) => n.type.includes("meal")).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inventory">
            Inventory
            <Badge variant="outline" className="ml-2">
              {notifications.filter((n) => n.type.includes("inventory")).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="order">
            Orders
            <Badge variant="outline" className="ml-2">
              {notifications.filter((n) => n.type.includes("order")).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Notifications"
                  : activeTab === "unread"
                    ? "Unread Notifications"
                    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications`}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length === 0
                  ? "No notifications to display"
                  : `Showing ${filteredNotifications.length} notification${
                      filteredNotifications.length !== 1 ? "s" : ""
                    }`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No notifications to display</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        notification.read ? "bg-gray-50" : "bg-white border-l-4 border-l-amber-500"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{formatNotificationTitle(notification.type)}</h3>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                  New
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as read</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-1">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              {notification.user?.name && (
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>{notification.user.name}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{format(new Date(notification.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
