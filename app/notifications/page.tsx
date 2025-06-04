"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, AlertTriangle, Edit, Plus, Utensils } from "lucide-react"

interface Notification {
  id: string
  type: string
  message: string
  createdAt: string
  read: boolean
  data?: any
}

const getNotificationIcon = (type: string) => {
  if (type.includes("success")) return <CheckCircle className="h-5 w-5 text-green-600" />
  if (type.includes("error")) return <AlertTriangle className="h-5 w-5 text-red-600" />
  if (type.includes("ingredient_quantity_updated")) return <Edit className="h-5 w-5 text-blue-600" />
  if (type.includes("ingredient_added_to_meal")) return <Plus className="h-5 w-5 text-green-600" />
  if (type.includes("meal_updated_comprehensive")) return <Utensils className="h-5 w-5 text-purple-600" />
  return <Bell className="h-5 w-5 text-gray-600" />
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Simulate fetching notifications from an API
    const fetchNotifications = async () => {
      // Replace with your actual API endpoint
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "success",
          message: "Your order has been placed successfully!",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "2",
          type: "error",
          message: "Payment failed. Please try again.",
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: false,
        },
        {
          id: "3",
          type: "ingredient_quantity_updated",
          message: "Ingredient quantity updated",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: false,
          data: {
            ingredientName: "Tomato",
            mealName: "Pasta",
            oldQuantity: 2,
            newQuantity: 3,
            unit: "units",
            changeType: "added",
            changeAmount: 1,
            availableStock: 10,
          },
        },
        {
          id: "4",
          type: "ingredient_added_to_meal",
          message: "Ingredient added to meal",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: false,
          data: {
            ingredientName: "Onion",
            mealName: "Soup",
            quantity: 1,
            unit: "unit",
            availableStock: 5,
          },
        },
        {
          id: "5",
          type: "meal_updated_comprehensive",
          message: "Meal updated",
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          read: false,
          data: {
            mealName: "Pizza",
            totalIngredients: 6,
            updatedAt: new Date().toISOString(),
          },
        },
      ]

      setNotifications(mockNotifications)
    }

    fetchNotifications()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="bg-white rounded-md shadow-sm p-4 border">
              <div className="flex items-center space-x-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <time dateTime={notification.createdAt} className="text-gray-500 text-xs">
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                  </div>
                  {notification.type === "ingredient_quantity_updated" && notification.data && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Ingredient:</span>
                          <span>{notification.data.ingredientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Meal:</span>
                          <span>{notification.data.mealName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Change:</span>
                          <span className="font-mono text-blue-700">
                            {notification.data.oldQuantity} → {notification.data.newQuantity} {notification.data.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Amount {notification.data.changeType}:</span>
                          <span className="font-semibold text-blue-600">
                            {notification.data.changeAmount} {notification.data.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {notification.type === "ingredient_added_to_meal" && notification.data && (
                    <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Ingredient:</span>
                          <span>{notification.data.ingredientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Added to meal:</span>
                          <span>{notification.data.mealName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Quantity:</span>
                          <span className="font-mono text-green-700">
                            {notification.data.quantity} {notification.data.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Stock available:</span>
                          <span className="text-green-600">
                            {notification.data.availableStock} {notification.data.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {notification.type === "meal_updated_comprehensive" && notification.data && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-200">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">Meal updated:</span>
                          <span>{notification.data.mealName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total ingredients:</span>
                          <span className="font-semibold text-purple-600">{notification.data.totalIngredients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Updated at:</span>
                          <span className="text-purple-600">
                            {new Date(notification.data.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default NotificationsPage
