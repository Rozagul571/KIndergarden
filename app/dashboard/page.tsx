"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowUpRight, Package, PieChart } from "lucide-react"
import Link from "next/link"
import { InventorySummary } from "@/components/dashboard/inventory-summary"
import { MealsSummary } from "@/components/dashboard/meals-summary"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { motion } from "framer-motion"
import { ChefLogo } from "@/components/chef-logo"

export default function DashboardPage() {
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
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between space-y-2"
        >
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <Link href="/inventory" passHref>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Package className="mr-2 h-4 w-4" /> Manage Inventory
              </Button>
            </Link>
            <Link href="/meals/serve" passHref>
              <Button
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <ChefLogo className="mr-2 h-4 w-4" /> Serve Meal
              </Button>
            </Link>
          </div>
        </motion.div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-amber-100 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
            >
              Alerts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <motion.div variants={item}>
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Total Ingredients</CardTitle>
                    <Package className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900">24</div>
                    <p className="text-xs text-amber-600">+2 added this week</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Meals Served Today</CardTitle>
                    <ChefLogo className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900">45</div>
                    <p className="text-xs text-amber-600">+12% from yesterday</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Low Stock Items</CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900">3</div>
                    <p className="text-xs text-amber-600">Requires attention</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Efficiency Rate</CardTitle>
                    <PieChart className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900">92.5%</div>
                    <p className="text-xs text-amber-600">+2.5% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="col-span-4"
              >
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-amber-700">Inventory Summary</CardTitle>
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
                    <CardTitle className="text-amber-700">Meals Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MealsSummary />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="col-span-4"
              >
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-amber-700">Recent Activity</CardTitle>
                    <CardDescription>Latest meal servings and inventory updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivity />
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="col-span-3"
              >
                <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-amber-700">Low Stock Alerts</CardTitle>
                    <CardDescription>Ingredients that need to be restocked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LowStockAlert />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700">Analytics</AlertTitle>
              <AlertDescription className="text-amber-600">
                Detailed analytics and reports are available in the Reports section.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-amber-700">Monthly Usage Trends</CardTitle>
                  <CardDescription>Ingredient usage over the past month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <Link href="/reports" className="flex flex-col items-center text-center">
                    <PieChart className="h-16 w-16 mb-2 text-amber-400" />
                    <p className="text-sm text-amber-600">View detailed analytics in Reports</p>
                    <Button variant="link" className="mt-2 text-amber-700 hover:text-amber-900">
                      Go to Reports <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-amber-700">Efficiency Metrics</CardTitle>
                  <CardDescription>Comparison of expected vs. actual meal servings</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <Link href="/reports" className="flex flex-col items-center text-center">
                    <PieChart className="h-16 w-16 mb-2 text-amber-400" />
                    <p className="text-sm text-amber-600">View detailed analytics in Reports</p>
                    <Button variant="link" className="mt-2 text-amber-700 hover:text-amber-900">
                      Go to Reports <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="alerts" className="space-y-4">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>Potatoes are running low (500g remaining). Please restock soon.</AlertDescription>
            </Alert>
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>Chicken is running low (300g remaining). Please restock soon.</AlertDescription>
            </Alert>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700">Efficiency Warning</AlertTitle>
              <AlertDescription className="text-amber-600">
                Last week's discrepancy rate was 12.5%, which is above the 10% threshold.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
