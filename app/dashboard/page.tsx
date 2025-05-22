"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, Package, Utensils, ShoppingCart, TrendingUp, BarChart4, Clock, Users } from "lucide-react"
import Link from "next/link"
import { InventorySummary } from "@/components/dashboard/inventory-summary"
import { MealsSummary } from "@/components/dashboard/meals-summary"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [lowStockCount, setLowStockCount] = useState(0)
  const [mealsServedToday, setMealsServedToday] = useState(0)
  const [totalIngredients, setTotalIngredients] = useState(0)
  const [efficiencyRate, setEfficiencyRate] = useState(0)

  // Simulate fetching dashboard data
  useEffect(() => {
    // In a real app, this would be an API call
    setLowStockCount(3)
    setMealsServedToday(45)
    setTotalIngredients(24)
    setEfficiencyRate(92.5)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg"
            >
              <Utensils className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <motion.h2
                className="text-3xl font-bold tracking-tight text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Welcome, {user?.name || "User"}
              </motion.h2>
              <motion.p
                className="text-gray-500"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </motion.p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {(user?.role === "admin" || user?.role === "manager") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/inventory" passHref>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <Package className="mr-2 h-4 w-4" /> Manage Inventory
                  </Button>
                </Link>
              </motion.div>
            )}
            {(user?.role === "admin" || user?.role === "cook") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/meals/serve" passHref>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Utensils className="mr-2 h-4 w-4" /> Serve Meal
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Ingredients</p>
                  <h3 className="text-2xl font-bold text-gray-900">{totalIngredients}</h3>
                  <p className="text-xs text-green-600 mt-1">+2 added this week</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Meals Served Today</p>
                  <h3 className="text-2xl font-bold text-gray-900">{mealsServedToday}</h3>
                  <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Utensils className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                  <h3 className="text-2xl font-bold text-gray-900">{lowStockCount}</h3>
                  <p className="text-xs text-red-600 mt-1">Requires attention</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Efficiency Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">{efficiencyRate}%</h3>
                  <p className="text-xs text-green-600 mt-1">+2.5% from last month</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {(user?.role === "admin" || user?.role === "manager") && (
            <Link href="/inventory" className="block">
              <Card className="h-full border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Package className="h-12 w-12 mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium text-amber-700 mb-2">Inventory</h3>
                    <p className="text-sm text-gray-600">Manage ingredients and stock levels</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {(user?.role === "admin" || user?.role === "cook") && (
            <Link href="/meals" className="block">
              <Card className="h-full border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Utensils className="h-12 w-12 mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium text-amber-700 mb-2">Meals</h3>
                    <p className="text-sm text-gray-600">Create and manage meal recipes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {(user?.role === "admin" || user?.role === "manager") && (
            <Link href="/orders" className="block">
              <Card className="h-full border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <ShoppingCart className="h-12 w-12 mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium text-amber-700 mb-2">Orders</h3>
                    <p className="text-sm text-gray-600">Track and manage ingredient orders</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {(user?.role === "admin" || user?.role === "manager") && (
            <Link href="/tracking" className="block">
              <Card className="h-full border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Users className="h-12 w-12 mb-4 text-amber-500" />
                    <h3 className="text-lg font-medium text-amber-700 mb-2">User Tracking</h3>
                    <p className="text-sm text-gray-600">Monitor meal serving by staff</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </motion.div>

        {/* Dashboard Overview Tabs */}
        {(user?.role === "admin" || user?.role === "manager") && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-amber-100 p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300 rounded-md"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Alerts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="col-span-4"
                >
                  <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-700 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-amber-500" />
                        Inventory Summary
                      </CardTitle>
                      <CardDescription>Current stock levels of top ingredients</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <InventorySummary />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="col-span-3"
                >
                  <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-amber-700 flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-amber-500" />
                        Meals Summary
                      </CardTitle>
                      <CardDescription>Distribution of meals served this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MealsSummary />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest meal servings and inventory updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4">
              <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Ingredients that need to be restocked</CardDescription>
                </CardHeader>
                <CardContent>
                  <LowStockAlert />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
