"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, CheckCheck, Trash2, Package, ShoppingCart, Utensils, User, AlertCircle } from "lucide-react"
import { useWebSocket } from "@/contexts/websocket-context"
import { motion } from "framer-motion"
import { format } from "date-fns"

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useWebSocket()
  const [activeTab, setActiveTab] = useState("all")

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") return !notification.read
    if (activeTab === "read") return notification.read
    return true
  })

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.timestamp).toLocaleDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
      return groups
    },
    {} as Record<string, typeof notifications>,
  )

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    if (type.includes("order")) return <ShoppingCart className="h-5 w-5" />
    if (type.includes("inventory") || type.includes("delivery")) return <Package className="h-5 w-5" />
    if (type.includes("meal")) return <Utensils className="h-5 w-5" />
    if (type.includes("user")) return <User className="h-5 w-5" />
    return <AlertCircle className="h-5 w-5" />
  }

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    if (type.includes("order")) return "bg-blue-100 text-blue-600"
    if (type.includes("inventory") || type.includes("delivery")) return "bg-green-100 text-green-600"
    if (type.includes("meal")) return "bg-amber-100 text-amber-600"
    if (type.includes("user")) return "bg-purple-100 text-purple-600"
    return "bg-gray-100 text-gray-600"
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with system activities</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead()}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            disabled={!notifications.some((n) => !n.read)}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </motion.div>

      <Card className="border-amber-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-amber-500" />
            System Notifications
          </CardTitle>
          <CardDescription>You have {notifications.filter((n) => !n.read).length} unread notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-amber-100 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
              >
                Read
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notifications found</div>
              ) : (
                Object.entries(groupedNotifications)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, dateNotifications]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {dateNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border ${
                            notification.read ? "bg-gray-50 border-gray-200" : "bg-white border-amber-200 shadow-sm"
                          } transition-all duration-300`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {notification.type.charAt(0).toUpperCase() +
                                    notification.type.slice(1).replace(/_/g, " ")}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(notification.timestamp), "h:mm a")}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              {notification.triggeredBy && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Triggered by: {notification.triggeredBy.name} ({notification.triggeredBy.role})
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-3">
                                <div>
                                  {!notification.read ? (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                      Unread
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                      Read
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <Check className="h-4 w-4 mr-1" /> Mark as Read
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No unread notifications</div>
              ) : (
                Object.entries(groupedNotifications)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, dateNotifications]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {dateNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg border border-amber-200 bg-white shadow-sm transition-all duration-300"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {notification.type.charAt(0).toUpperCase() +
                                    notification.type.slice(1).replace(/_/g, " ")}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(notification.timestamp), "h:mm a")}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              {notification.triggeredBy && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Triggered by: {notification.triggeredBy.name} ({notification.triggeredBy.role})
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-3">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Unread
                                </Badge>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Mark as Read
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No read notifications</div>
              ) : (
                Object.entries(groupedNotifications)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, dateNotifications]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {dateNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg border border-gray-200 bg-gray-50 transition-all duration-300"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {notification.type.charAt(0).toUpperCase() +
                                    notification.type.slice(1).replace(/_/g, " ")}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(notification.timestamp), "h:mm a")}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              {notification.triggeredBy && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  Triggered by: {notification.triggeredBy.name} ({notification.triggeredBy.role})
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-3">
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                  Read
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
