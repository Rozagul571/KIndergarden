"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts"

// Sample data for demonstration
const weekData = [
  {
    date: "05/05",
    consumption: 2500,
    delivery: 0,
  },
  {
    date: "05/06",
    consumption: 3200,
    delivery: 5000,
  },
  {
    date: "05/07",
    consumption: 2800,
    delivery: 0,
  },
  {
    date: "05/08",
    consumption: 3500,
    delivery: 8000,
  },
  {
    date: "05/09",
    consumption: 2900,
    delivery: 0,
  },
  {
    date: "05/10",
    consumption: 3100,
    delivery: 4000,
  },
  {
    date: "05/11",
    consumption: 2700,
    delivery: 3000,
  },
]

const monthData = [
  {
    date: "Week 1",
    consumption: 15000,
    delivery: 18000,
  },
  {
    date: "Week 2",
    consumption: 16500,
    delivery: 12000,
  },
  {
    date: "Week 3",
    consumption: 14800,
    delivery: 20000,
  },
  {
    date: "Week 4",
    consumption: 18200,
    delivery: 15000,
  },
]

interface InventoryUsageChartProps {
  dateRange: "week" | "month"
}

export function InventoryUsageChart({ dateRange }: InventoryUsageChartProps) {
  const data = dateRange === "week" ? weekData : monthData

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}g`}
        />
        <Tooltip formatter={(value) => [`${value}g`, ""]} />
        <Legend />
        <Line type="monotone" dataKey="consumption" stroke="#f43f5e" activeDot={{ r: 8 }} name="Consumption" />
        <Line type="monotone" dataKey="delivery" stroke="#0ea5e9" name="Delivery" />
      </LineChart>
    </ResponsiveContainer>
  )
}
