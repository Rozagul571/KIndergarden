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
  // Initialize with empty values to prevent errors if context is not available yet
  const websocketContext = useWebSocket()
  const {
    notifications = [],
    markAsRead = () => {},
    markAllAsRead = () => {},
    deleteNotification = () => {},
  } = websocketContext || {}

  const [activeTab, setActiveTab] = useState("all")
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([])
  const { user } = useAuth()

  // Filter notifications based on active tab
  useEffect(() => {
    if (!notifications) return

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
    if (!notifications || notifications.length === 0) {
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
          data: {
            mealName: "Osh (Plov)",
            portions: 15,
            ingredients: [
              { name: "Rice", quantity: "3kg", remaining: "47kg" },
              { name: "Beef", quantity: "2.5kg", remaining: "22.5kg" },
              { name: "Carrots", quantity: "1.5kg", remaining: "18.5kg" },
            ],
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
          data: {
            mealName: "Lagman",
            portions: 12,
            ingredients: [
              { name: "Noodles", quantity: "2.4kg", remaining: "17.6kg" },
              { name: "Beef", quantity: "1.8kg", remaining: "20.7kg" },
              { name: "Vegetables", quantity: "1.2kg", remaining: "8.8kg" },
            ],
          },
        },
        {
          id: "3",
          type: "meal_updated",
          message: "Aziza Rahimova updated Somsa recipe",
          timestamp: "2025-05-23T09:45:00", // Changed to morning time
          read: false,
          user: {
            id: 5,
            name: "Aziza Rahimova",
            role: "cook",
          },
          data: {
            mealName: "Somsa",
            changes: [
              { field: "Ingredients", from: "Beef 100g", to: "Beef 120g" },
              { field: "Cooking Time", from: "30 min", to: "35 min" },
            ],
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
          data: {
            name: "Rice",
            previousQuantity: "50kg",
            quantity: "35kg",
            unit: "kg",
            remaining: "35kg",
            calculatedBy: "Celery inventory task",
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
          data: {
            ingredientName: "Beef",
            quantity: "25kg",
            unit: "kg",
            orderId: "ORD-2023-05-23-001",
            supplier: "UzMeat Suppliers",
            calculatedBy: "Celery order management task",
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
          data: {
            name: "Flour",
            quantity: "5kg",
            threshold: "10kg",
            calculatedBy: "Celery threshold monitoring task",
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
          data: {
            rate: "17.3%",
            threshold: "15%",
            month: "May 2025",
            calculatedBy: "Celery monthly efficiency calculation task",
          },
        },
      ]

      // In a real app, you would add these to the WebSocket context
      // For now, we'll just use them directly
      setFilteredNotifications(sampleNotifications)
    }
  }, [notifications])

  // If the WebSocket context is not available yet, show a loading state
  if (!websocketContext) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300 animate-pulse" />
            <p className="mt-4 text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Modern header section */}
      <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-8 mb-8 overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
              <p className="text-amber-100 max-w-xl">Track system activities and updates</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => markAllAsRead()}
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark All Read
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>All</span>
              </div>
              <p className="text-2xl font-bold mt-1">{filteredNotifications.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>New</span>
              </div>
              <p className="text-2xl font-bold mt-1">{filteredNotifications.filter((n) => !n.read).length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span>Stock</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {filteredNotifications.filter((n) => n.type.includes("inventory")).length}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                <span>Food</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {filteredNotifications.filter((n) => n.type.includes("meal")).length}
              </p>
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
              New
            </TabsTrigger>
            <TabsTrigger value="meal" className="data-[state=active]:bg-white">
              Food
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white">
              Stock
            </TabsTrigger>
            <TabsTrigger value="order" className="data-[state=active]:bg-white">
              Buy
            </TabsTrigger>
            <TabsTrigger value="alert" className="data-[state=active]:bg-white">
              Warn
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Sort
          </Button>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {activeTab === "all"
                  ? "All Alerts"
                  : activeTab === "unread"
                    ? "New Alerts"
                    : activeTab === "alert"
                      ? "System Warnings"
                      : activeTab === "meal"
                        ? "Food Updates"
                        : activeTab === "inventory"
                          ? "Stock Changes"
                          : "Purchase Orders"}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length === 0
                  ? "No alerts to display"
                  : `Showing ${filteredNotifications.length} alert${filteredNotifications.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No alerts to display</p>
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
                                  Warn
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
                          <div className="mt-1">
                            <p className="text-gray-700 font-medium">{notification.message}</p>

                            {/* Detailed information section */}
                            <div className="mt-2 text-sm text-gray-600">
                              {notification.type.includes("meal_served") && notification.data?.ingredients && (
                                <div className="space-y-1">
                                  <div className="font-semibold">Used ingredients:</div>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {notification.data.ingredients.map((ing: any, i: number) => (
                                      <li key={i}>
                                        {ing.name}: {ing.quantity} (Remaining: {ing.remaining})
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Calculated by: Celery meal serving task
                                  </div>
                                </div>
                              )}

                              {notification.type.includes("meal_updated") && notification.data?.changes && (
                                <div className="space-y-1">
                                  <div className="font-semibold">Changes to {notification.data.mealName}:</div>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {notification.data.changes.map((change: any, i: number) => (
                                      <li key={i}>
                                        {change.field}: {change.from} → {change.to}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Calculated by: Celery recipe update task
                                  </div>
                                </div>
                              )}

                              {notification.type.includes("inventory_updated") && notification.data?.name && (
                                <div className="space-y-1">
                                  <div className="font-semibold">Inventory update details:</div>
                                  <div>
                                    Item: {notification.data.name}
                                    <br />
                                    Previous: {notification.data.previousQuantity}
                                    <br />
                                    New: {notification.data.quantity}
                                    <br />
                                    Remaining: {notification.data.remaining}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Calculated by: {notification.data.calculatedBy || "Celery inventory task"}
                                  </div>
                                </div>
                              )}

                              {notification.type.includes("order") && notification.data?.ingredientName && (
                                <div className="space-y-1">
                                  <div className="font-semibold">Order details:</div>
                                  <div>
                                    Order ID: {notification.data.orderId}
                                    <br />
                                    Item: {notification.data.ingredientName}
                                    <br />
                                    Quantity: {notification.data.quantity}
                                    <br />
                                    Supplier: {notification.data.supplier}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Calculated by: {notification.data.calculatedBy || "Celery order task"}
                                  </div>
                                </div>
                              )}

                              {notification.type.includes("alert") && notification.data?.calculatedBy && (
                                <div className="space-y-1">
                                  <div className="font-semibold">Alert details:</div>
                                  {notification.data.name && (
                                    <div>
                                      Item: {notification.data.name}
                                      <br />
                                      Current: {notification.data.quantity}
                                      <br />
                                      Threshold: {notification.data.threshold}
                                    </div>
                                  )}
                                  {notification.data.rate && (
                                    <div>
                                      Period: {notification.data.month}
                                      <br />
                                      Rate: {notification.data.rate}
                                      <br />
                                      Threshold: {notification.data.threshold}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    Calculated by: {notification.data.calculatedBy}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
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
        <h2 className="text-2xl font-bold mb-4">System Info</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alerts & Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Stock warnings when quantity falls below threshold</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Monthly rate monitoring with alerts at 15% threshold</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Real-time updates for all stock and food activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Role-based alert delivery to appropriate staff</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Auto Tasks
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
                  <span>Automatic monthly report generation on the 1st</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Regular stock checks every 6 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>Live updates across the system</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
