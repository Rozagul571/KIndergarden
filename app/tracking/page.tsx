"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { format } from "date-fns"
import { Download, Search, Utensils, User, Calendar, Clock, Package, Edit, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/contexts/websocket-context"
import { motion } from "framer-motion"

type MealServing = {
  id: number
  meal: {
    id: number
    name: string
  }
  portions: number
  serving_date: string
  user: {
    id: number
    name: string
    role: string
  }
}

export default function TrackingPage() {
  const [mealServings, setMealServings] = useState<MealServing[]>([])
  const [filteredServings, setFilteredServings] = useState<MealServing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [roleFilter, setRoleFilter] = useState("all")
  const { toast } = useToast()
  const { lastMessage } = useWebSocket()

  // Add this new state for ingredient changes
  const [ingredientChanges, setIngredientChanges] = useState<any[]>([])

  // Fetch meal servings data
  useEffect(() => {
    const fetchMealServings = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data with Uzbek names
        const mockData: MealServing[] = [
          {
            id: 1,
            meal: { id: 1, name: "Osh (Plov)" },
            portions: 15,
            serving_date: "2025-05-23T08:30:00", // Changed to morning time
            user: { id: 2, name: "Og'iloy Tursunova", role: "cook" },
          },
          {
            id: 2,
            meal: { id: 2, name: "Lagman" },
            portions: 12,
            serving_date: "2025-05-23T07:15:00", // Changed to morning time
            user: { id: 3, name: "Muxtasar Azizova", role: "cook" },
          },
          {
            id: 3,
            meal: { id: 3, name: "Somsa" },
            portions: 20,
            serving_date: "2025-05-23T09:45:00", // Changed to morning time
            user: { id: 5, name: "Aziza Rahimova", role: "cook" },
          },
          {
            id: 4,
            meal: { id: 1, name: "Osh (Plov)" },
            portions: 10,
            serving_date: "2025-05-11T09:30:00",
            user: { id: 3, name: "Muxtasar Azizova", role: "cook" },
          },
          {
            id: 5,
            meal: { id: 2, name: "Lagman" },
            portions: 15,
            serving_date: "2025-05-11T08:15:00",
            user: { id: 7, name: "Odina Rustamova", role: "cook" },
          },
          {
            id: 6,
            meal: { id: 3, name: "Somsa" },
            portions: 8,
            serving_date: "2025-05-10T07:45:00",
            user: { id: 3, name: "Muxtasar Azizova", role: "cook" },
          },
          {
            id: 7,
            meal: { id: 4, name: "Manti" },
            portions: 12,
            serving_date: "2025-05-10T08:30:00",
            user: { id: 4, name: "Kamola Umarova", role: "manager" },
          },
          {
            id: 8,
            meal: { id: 5, name: "Shurpa" },
            portions: 6,
            serving_date: "2025-05-09T09:20:00",
            user: { id: 7, name: "Odina Rustamova", role: "cook" },
          },
          {
            id: 9,
            meal: { id: 1, name: "Osh (Plov)" },
            portions: 14,
            serving_date: "2025-05-09T07:15:00",
            user: { id: 3, name: "Muxtasar Azizova", role: "cook" },
          },
          {
            id: 10,
            meal: { id: 2, name: "Lagman" },
            portions: 10,
            serving_date: "2025-05-08T08:30:00",
            user: { id: 1, name: "Surayyo Karimova", role: "admin" },
          },
          {
            id: 11,
            meal: { id: 3, name: "Somsa" },
            portions: 20,
            serving_date: "2025-05-08T07:00:00",
            user: { id: 7, name: "Odina Rustamova", role: "cook" },
          },
          {
            id: 12,
            meal: { id: 4, name: "Manti" },
            portions: 8,
            serving_date: "2025-05-07T09:15:00",
            user: { id: 8, name: "Tanzila Nodirbekova", role: "cook" },
          },
        ]

        setMealServings(mockData)
        setFilteredServings(mockData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching meal servings:", error)
        toast({
          title: "Error",
          description: "Failed to fetch meal servings data",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchMealServings()
  }, [toast])

  // Listen for real-time updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === "meal_served") {
      // In a real app, you would fetch the updated data
      // For now, we'll just show a toast
      toast({
        title: "New Meal Served",
        description: lastMessage.message,
      })
    }
  }, [lastMessage, toast])

  // Add this useEffect to listen for ingredient changes
  useEffect(() => {
    if (
      lastMessage &&
      (lastMessage.type === "ingredient_quantity_updated" ||
        lastMessage.type === "ingredient_added_to_meal" ||
        lastMessage.type === "meal_updated_comprehensive")
    ) {
      const newChange = {
        id: Date.now(),
        type: lastMessage.type,
        user: lastMessage.user,
        data: lastMessage.data,
        timestamp: lastMessage.timestamp || new Date().toISOString(),
      }

      setIngredientChanges((prev) => [newChange, ...prev])

      toast({
        title: "Ingredient Update Tracked",
        description: lastMessage.message,
      })
    }
  }, [lastMessage, toast])

  // Apply filters
  useEffect(() => {
    let filtered = [...mealServings]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (serving) =>
          serving.meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serving.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((serving) => {
        const servingDate = new Date(serving.serving_date)
        return servingDate >= dateRange.from! && servingDate <= dateRange.to!
      })
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((serving) => serving.user.role === roleFilter)
    }

    setFilteredServings(filtered)
  }, [searchTerm, dateRange, roleFilter, mealServings])

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = ["Staff Name", "Role", "Meal", "Portions", "Date", "Time"]
      const rows = filteredServings.map((serving) => [
        serving.user.name,
        serving.user.role,
        serving.meal.name,
        serving.portions,
        format(new Date(serving.serving_date), "MMM dd, yyyy"),
        format(new Date(serving.serving_date), "hh:mm a"),
      ])

      const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `meal-servings-${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Meal servings data has been exported to CSV",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export meal servings data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Meal Tracking</h1>
            <p className="text-gray-500">Track which staff members served which meals</p>
          </div>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter meal servings by staff, date, or role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search by Staff or Meal
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="date-range" className="text-sm font-medium">
                  Date Range
                </label>
                <DateRangePicker id="date-range" value={dateRange} onChange={setDateRange} className="w-full" />
              </div>
              <div className="space-y-2">
                <label htmlFor="role-filter" className="text-sm font-medium">
                  Filter by Role
                </label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger id="role-filter" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cook">Cook</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Serving Records</CardTitle>
            <CardDescription>
              Showing {filteredServings.length} of {mealServings.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              </div>
            ) : filteredServings.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No meal servings found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredServings.map((serving, index) => (
                  <motion.div
                    key={serving.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="bg-amber-100 p-3 rounded-full">
                            <Utensils className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{serving.meal.name}</h3>
                            <div className="flex items-center mt-1 text-gray-500">
                              <User className="h-4 w-4 mr-1" />
                              <span className="font-medium text-gray-700">{serving.user.name}</span>
                              <span className="mx-2">•</span>
                              <Badge
                                className={`${
                                  serving.user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : serving.user.role === "cook"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {serving.user.role.charAt(0).toUpperCase() + serving.user.role.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {format(new Date(serving.serving_date), "MMMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{format(new Date(serving.serving_date), "h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="bg-amber-50 px-3 py-1 rounded-full">
                          <span className="text-amber-800 font-medium">{serving.portions} portions served</span>
                        </div>
                        <div className="text-gray-500 text-sm">ID: #{serving.id}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Real-time Ingredient Changes
            </CardTitle>
            <CardDescription>Live tracking of ingredient modifications and meal updates</CardDescription>
          </CardHeader>
          <CardContent>
            {ingredientChanges.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No ingredient changes yet</h3>
                <p className="mt-2 text-gray-500">Ingredient modifications will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ingredientChanges.slice(0, 10).map((change, index) => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          {change.type === "ingredient_quantity_updated" ? (
                            <Edit className="h-4 w-4 text-blue-600" />
                          ) : change.type === "ingredient_added_to_meal" ? (
                            <Plus className="h-4 w-4 text-green-600" />
                          ) : (
                            <Utensils className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">{change.user?.name || "Unknown User"}</span>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">{change.user?.role || "user"}</Badge>
                          </div>

                          {change.type === "ingredient_quantity_updated" && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">
                                {change.data?.changeType === "increased" ? "Increased" : "Decreased"}{" "}
                                {change.data?.ingredientName}
                              </p>
                              <p>
                                In meal: <span className="font-medium">{change.data?.mealName}</span>
                              </p>
                              <p>
                                Change:{" "}
                                <span className="font-mono bg-gray-100 px-1 rounded">
                                  {change.data?.oldQuantity} → {change.data?.newQuantity} {change.data?.unit}
                                </span>
                              </p>
                              <p>
                                Amount:{" "}
                                <span className="font-medium text-blue-600">
                                  {change.data?.changeAmount} {change.data?.unit}
                                </span>
                              </p>
                            </div>
                          )}

                          {change.type === "ingredient_added_to_meal" && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Added {change.data?.ingredientName} to meal</p>
                              <p>
                                Meal: <span className="font-medium">{change.data?.mealName}</span>
                              </p>
                              <p>
                                Quantity:{" "}
                                <span className="font-mono bg-gray-100 px-1 rounded">
                                  {change.data?.quantity} {change.data?.unit}
                                </span>
                              </p>
                              <p>
                                Stock available:{" "}
                                <span className="text-green-600">
                                  {change.data?.availableStock} {change.data?.unit}
                                </span>
                              </p>
                            </div>
                          )}

                          {change.type === "meal_updated_comprehensive" && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Updated meal recipe</p>
                              <p>
                                Meal: <span className="font-medium">{change.data?.mealName}</span>
                              </p>
                              <p>
                                Total ingredients:{" "}
                                <span className="font-medium text-purple-600">{change.data?.totalIngredients}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{format(new Date(change.timestamp), "MMM dd, yyyy")}</div>
                        <div>{format(new Date(change.timestamp), "hh:mm:ss a")}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
