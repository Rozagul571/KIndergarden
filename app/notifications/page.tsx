"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/contexts/websocket-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Check,
  Clock,
  Package,
  ShoppingCart,
  Trash2,
  User,
  Utensils,
  AlertTriangle,
  Filter,
  CheckCircle2,
} from "lucide-react"
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

  // Add some sample notifications for May 23 with morning times
  useEffect(() => {
    if (notifications.length === 0) {
      const sampleNotifications = [
        {
          id: "1",
          type: "meal_served",
          message: "Og'iloy Tursunova served 15 portions of Osh (Plov)",
          timestamp: "2025-05-23T08:30:00", // Changed to morning time
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
          timestamp: "2025-05-23T07:15:00", // Changed to morning time
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
          timestamp: "2025-05-23T09:45:00", // Changed to morning time
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
          timestamp: "2025-05-23T08:20:00", // Changed to morning time
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
          timestamp: "2025-05-23T09:05:00", // Changed to morning time
          read: false,
          user: {
            id: 6,
            name: "Shakhzoda Kamalova",
            role: "manager",
          },
        },
        {
          id: "6",
          type: "inventory_alert",
          message: "Flour quantity has fallen below threshold (5kg remaining)",
          timestamp: "2025-05-23T10:15:00",
          read: false,
          user: {
            id: 1,
            name: "System Alert",
            role: "system",
          },
        },
        {
          id: "7",
          type: "efficiency_alert",
          message: "Monthly discrepancy rate has exceeded 15% (current: 17.3%)",
          timestamp: "2025-05-23T11:30:00",
          read: false,
          user: {
            id: 1,
            name: "System Alert",
            role: "system",
          },
        },
      ]

      // In a real app, you would add these to the WebSocket context
      // For now, we'll just pretend they're already there
    }
  }, [notifications])

  return (
    <div className="container mx-auto py-6">
      {/* Modern header section */}
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notification Center</h1>
              <p className="text-amber-100 max-w-xl">
                Stay informed about system activities, alerts, and updates. Manage your notifications to keep track of
                important events.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => markAllAsRead()}
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark All as Read
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{notifications.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Unread</span>
              </div>
              <p className="text-2xl font-bold mt-1">{notifications.filter((n) => !n.read).length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>Inventory</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {notifications.filter((n) => n.type.includes("inventory")).length}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Meals</span>
              </div>
              <p className="text-2xl font-bold mt-1">{notifications.filter((n) => n.type.includes("meal")).length}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-white">
              Unread
            </TabsTrigger>
            <TabsTrigger value="meal" className="data-[state=active]:bg-white">
              Meals
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="order" className="data-[state=active]:bg-white">
              Orders
            </TabsTrigger>
            <TabsTrigger value="alert" className="data-[state=active]:bg-white">
              Alerts
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {activeTab === "all"
                  ? "All Notifications"
                  : activeTab === "unread"
                    ? "Unread Notifications"
                    : activeTab === "alert"
                      ? "System Alerts"
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
                        notification.read ? "bg-gray-50" : "bg-white border-l-4 border-l-amber-500 shadow-sm"
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
                              {notification.type.includes("alert") && (
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                  Alert
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

      {/* System Features Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">System Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Notifications & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Ingredient threshold alerts when quantity falls below defined level</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Monthly discrepancy rate monitoring with alerts at 15% threshold</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Real-time notifications for all inventory and meal activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Role-based notification delivery to appropriate staff members</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Background Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Celery worker for scheduled background tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Automatic monthly report generation on the 1st of each month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Regular inventory checks every 6 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>WebSocket integration for real-time updates across the system</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
