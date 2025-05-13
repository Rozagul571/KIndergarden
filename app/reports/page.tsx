"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { InventoryUsageChart } from "@/components/reports/inventory-usage-chart"
import { MealServingsChart } from "@/components/reports/meal-servings-chart"
import { EfficiencyChart } from "@/components/reports/efficiency-chart"
import type { MealServing } from "@/types/meals"

// Sample data for demonstration
const initialServings: MealServing[] = [
  {
    id: 1,
    mealId: 1,
    mealName: "Beef Stew",
    portions: 10,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-11T09:30:00",
    userId: 2,
  },
  {
    id: 2,
    mealId: 2,
    mealName: "Chicken Rice",
    portions: 15,
    servedBy: "David Lee",
    servedAt: "2025-05-11T12:15:00",
    userId: 3,
  },
  {
    id: 3,
    mealId: 3,
    mealName: "Vegetable Soup",
    portions: 8,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-10T11:45:00",
    userId: 2,
  },
  {
    id: 4,
    mealId: 1,
    mealName: "Beef Stew",
    portions: 12,
    servedBy: "David Lee",
    servedAt: "2025-05-09T10:00:00",
    userId: 3,
  },
  {
    id: 5,
    mealId: 2,
    mealName: "Chicken Rice",
    portions: 18,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-08T12:30:00",
    userId: 2,
  },
  {
    id: 6,
    mealId: 3,
    mealName: "Vegetable Soup",
    portions: 10,
    servedBy: "David Lee",
    servedAt: "2025-05-07T11:15:00",
    userId: 3,
  },
  {
    id: 7,
    mealId: 1,
    mealName: "Beef Stew",
    portions: 14,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-06T09:45:00",
    userId: 2,
  },
  {
    id: 8,
    mealId: 2,
    mealName: "Chicken Rice",
    portions: 16,
    servedBy: "David Lee",
    servedAt: "2025-05-05T12:00:00",
    userId: 3,
  },
  {
    id: 9,
    mealId: 3,
    mealName: "Vegetable Soup",
    portions: 9,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-04T11:30:00",
    userId: 2,
  },
  {
    id: 10,
    mealId: 1,
    mealName: "Beef Stew",
    portions: 11,
    servedBy: "David Lee",
    servedAt: "2025-05-03T10:15:00",
    userId: 3,
  },
]

// Sample efficiency data
const efficiencyData = {
  totalPortionsServed: 123,
  totalPossiblePortions: 140,
  discrepancyRate: 12.14,
  isAboveThreshold: true,
}

export default function ReportsPage() {
  const [servings] = useState<MealServing[]>(initialServings)
  const [dateRange, setDateRange] = useState<"week" | "month">("week")

  const getServingsByStaff = () => {
    const staffMap = new Map<string, number>()

    servings.forEach((serving) => {
      const current = staffMap.get(serving.servedBy) || 0
      staffMap.set(serving.servedBy, current + serving.portions)
    })

    return Array.from(staffMap.entries()).map(([name, portions]) => ({
      name,
      portions,
    }))
  }

  const getServingsByMeal = () => {
    const mealMap = new Map<string, number>()

    servings.forEach((serving) => {
      const current = mealMap.get(serving.mealName) || 0
      mealMap.set(serving.mealName, current + serving.portions)
    })

    return Array.from(mealMap.entries()).map(([name, portions]) => ({
      name,
      portions,
    }))
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as "week" | "month")}>
            <TabsList>
              <TabsTrigger value="week">Last Week</TabsTrigger>
              <TabsTrigger value="month">Last Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {efficiencyData.isAboveThreshold && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Efficiency Warning</AlertTitle>
          <AlertDescription>
            The discrepancy rate is {efficiencyData.discrepancyRate.toFixed(2)}%, which is above the 10% threshold. This
            may indicate potential misuse or waste of ingredients.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingredient Usage</CardTitle>
            <CardDescription>Tracking ingredient consumption and delivery over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <InventoryUsageChart dateRange={dateRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Servings</CardTitle>
            <CardDescription>Number of portions served by meal type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <MealServingsChart dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Metrics</CardTitle>
            <CardDescription>Comparison of actual vs. possible portions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <EfficiencyChart dateRange={dateRange} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Portions Served</h3>
                <p className="text-2xl font-bold">{efficiencyData.totalPortionsServed}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Possible Portions</h3>
                <p className="text-2xl font-bold">{efficiencyData.totalPossiblePortions}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Discrepancy</h3>
                <p className="text-2xl font-bold">
                  <Badge variant={efficiencyData.isAboveThreshold ? "destructive" : "outline"}>
                    {efficiencyData.discrepancyRate.toFixed(2)}%
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
            <CardDescription>Portions served by each staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="text-right">Portions Served</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getServingsByStaff().map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell className="text-right">{staff.portions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Meal Serving History</CardTitle>
          <CardDescription>Detailed log of all meal servings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Meal</TableHead>
                <TableHead>Portions</TableHead>
                <TableHead>Served By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servings
                .slice()
                .reverse()
                .map((serving) => (
                  <TableRow key={serving.id}>
                    <TableCell>{new Date(serving.servedAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{serving.mealName}</TableCell>
                    <TableCell>{serving.portions}</TableCell>
                    <TableCell>{serving.servedBy}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
