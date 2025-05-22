"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Filter, Search, Users, Utensils } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useWebSocket } from "@/contexts/websocket-context"
import { useToast } from "@/hooks/use-toast"

// Sample data for demonstration
interface MealServingRecord {
  id: number
  staffName: string
  staffRole: string
  mealName: string
  portions: number
  timestamp: string
}

const initialServings: MealServingRecord[] = [
  {
    id: 1,
    staffName: "Maria Garcia",
    staffRole: "cook",
    mealName: "Osh (Plov)",
    portions: 10,
    timestamp: "2025-05-11T09:30:00",
  },
  {
    id: 2,
    staffName: "David Lee",
    staffRole: "cook",
    mealName: "Lagman",
    portions: 15,
    timestamp: "2025-05-11T12:15:00",
  },
  {
    id: 3,
    staffName: "Maria Garcia",
    staffRole: "cook",
    mealName: "Somsa",
    portions: 8,
    timestamp: "2025-05-10T11:45:00",
  },
  {
    id: 4,
    staffName: "Sarah Johnson",
    staffRole: "manager",
    mealName: "Manti",
    portions: 12,
    timestamp: "2025-05-10T10:30:00",
  },
  {
    id: 5,
    staffName: "David Lee",
    staffRole: "cook",
    mealName: "Shurpa",
    portions: 6,
    timestamp: "2025-05-09T13:20:00",
  },
  {
    id: 6,
    staffName: "Maria Garcia",
    staffRole: "cook",
    mealName: "Osh (Plov)",
    portions: 14,
    timestamp: "2025-05-09T09:15:00",
  },
  {
    id: 7,
    staffName: "John Smith",
    staffRole: "admin",
    mealName: "Lagman",
    portions: 10,
    timestamp: "2025-05-08T11:30:00",
  },
  {
    id: 8,
    staffName: "David Lee",
    staffRole: "cook",
    mealName: "Somsa",
    portions: 20,
    timestamp: "2025-05-08T10:00:00",
  },
  {
    id: 9,
    staffName: "Cook",
    staffRole: "cook",
    mealName: "Osh (Plov)",
    portions: 5,
    timestamp: "2025-05-07T14:30:00",
  },
]

export default function UserTrackingPage() {
  const [servings, setServings] = useState<MealServingRecord[]>(initialServings)
  const [filteredServings, setFilteredServings] = useState<MealServingRecord[]>(initialServings)
  const [searchTerm, setSearchTerm] = useState("")
  const [staffFilter, setStaffFilter] = useState("all")
  const [mealFilter, setMealFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const { notifications, lastMessage } = useWebSocket()
  const { toast } = useToast()

  // Get unique staff names and meal names for filters
  const staffNames = Array.from(new Set(servings.map((s) => s.staffName)))
  const mealNames = Array.from(new Set(servings.map((s) => s.mealName)))

  // Listen for new meal servings via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === "meal_served") {
      try {
        const data = lastMessage.data
        if (data && data.mealName && data.portions && data.servedBy) {
          // Create a new serving record from the WebSocket data
          const newServing: MealServingRecord = {
            id: Date.now(), // Use timestamp as ID
            staffName: data.servedBy,
            staffRole: lastMessage.user?.role || "cook",
            mealName: data.mealName,
            portions: data.portions,
            timestamp: data.servedAt || new Date().toISOString(),
          }

          // Add to servings
          setServings((prev) => [newServing, ...prev])

          toast({
            title: "New Meal Serving",
            description: `${newServing.staffName} served ${newServing.portions} portions of ${newServing.mealName}`,
          })
        }
      } catch (error) {
        console.error("Error processing meal serving notification:", error)
      }
    }
  }, [lastMessage, toast])

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...servings]

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) => s.staffName.toLowerCase().includes(term) || s.mealName.toLowerCase().includes(term),
      )
    }

    // Apply staff filter
    if (staffFilter !== "all") {
      filtered = filtered.filter((s) => s.staffName === staffFilter)
    }

    // Apply meal filter
    if (mealFilter !== "all") {
      filtered = filtered.filter((s) => s.mealName === mealFilter)
    }

    // Apply date range filter
    if (dateRange.from) {
      filtered = filtered.filter((s) => new Date(s.timestamp) >= dateRange.from!)
    }
    if (dateRange.to) {
      filtered = filtered.filter((s) => new Date(s.timestamp) <= dateRange.to!)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredServings(filtered)
  }, [searchTerm, staffFilter, mealFilter, dateRange, servings])

  // Function to export data as CSV
  const exportToCSV = () => {
    try {
      const headers = ["Staff Name", "Staff Role", "Meal Name", "Portions", "Date", "Time"]
      const csvRows = [
        headers.join(","),
        ...filteredServings.map((s) => {
          const date = new Date(s.timestamp)
          return [
            s.staffName,
            s.staffRole,
            s.mealName,
            s.portions,
            format(date, "yyyy-MM-dd"),
            format(date, "HH:mm:ss"),
          ].join(",")
        }),
      ]

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `meal_servings_${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `${filteredServings.length} records exported to CSV`,
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data to CSV",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Meal Tracking</h1>
          <p className="text-gray-500">Monitor which staff members served which meals</p>
        </div>
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </motion.div>

      <Card className="mb-6 border-amber-200 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-700 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-amber-500" />
            Filters
          </CardTitle>
          <CardDescription>Filter meal servings by staff, meal, or date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search staff or meal..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mealFilter} onValueChange={setMealFilter}>
              <SelectTrigger>
                <Utensils className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter by meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                {mealNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-amber-700 flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-500" />
            Meal Serving Records
          </CardTitle>
          <CardDescription>
            Showing {filteredServings.length} of {servings.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Portions</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No records found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredServings.map((serving) => {
                  const date = new Date(serving.timestamp)
                  return (
                    <TableRow key={serving.id} className="hover:bg-amber-50">
                      <TableCell className="font-medium">{serving.staffName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            serving.staffRole === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : serving.staffRole === "manager"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {serving.staffRole}
                        </Badge>
                      </TableCell>
                      <TableCell>{serving.mealName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {serving.portions}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {format(date, "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {format(date, "h:mm a")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
