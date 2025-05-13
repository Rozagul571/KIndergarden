"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

// Sample data for demonstration
const weekData = [
  {
    date: "05/05",
    "Beef Stew": 11,
    "Chicken Rice": 16,
    "Vegetable Soup": 9,
  },
  {
    date: "05/06",
    "Beef Stew": 14,
    "Chicken Rice": 0,
    "Vegetable Soup": 0,
  },
  {
    date: "05/07",
    "Beef Stew": 0,
    "Chicken Rice": 0,
    "Vegetable Soup": 10,
  },
  {
    date: "05/08",
    "Beef Stew": 0,
    "Chicken Rice": 18,
    "Vegetable Soup": 0,
  },
  {
    date: "05/09",
    "Beef Stew": 12,
    "Chicken Rice": 0,
    "Vegetable Soup": 0,
  },
  {
    date: "05/10",
    "Beef Stew": 0,
    "Chicken Rice": 0,
    "Vegetable Soup": 8,
  },
  {
    date: "05/11",
    "Beef Stew": 10,
    "Chicken Rice": 15,
    "Vegetable Soup": 0,
  },
]

const monthData = [
  {
    date: "Week 1",
    "Beef Stew": 45,
    "Chicken Rice": 52,
    "Vegetable Soup": 38,
  },
  {
    date: "Week 2",
    "Beef Stew": 48,
    "Chicken Rice": 49,
    "Vegetable Soup": 42,
  },
  {
    date: "Week 3",
    "Beef Stew": 43,
    "Chicken Rice": 55,
    "Vegetable Soup": 35,
  },
  {
    date: "Week 4",
    "Beef Stew": 47,
    "Chicken Rice": 50,
    "Vegetable Soup": 40,
  },
]

interface MealServingsChartProps {
  dateRange: "week" | "month"
}

export function MealServingsChart({ dateRange }: MealServingsChartProps) {
  const data = dateRange === "week" ? weekData : monthData

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip formatter={(value) => [`${value} portions`, ""]} />
        <Legend />
        <Bar dataKey="Beef Stew" fill="#ff7e67" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Chicken Rice" fill="#ffd166" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Vegetable Soup" fill="#06d6a0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
