"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts"

// Sample data for demonstration
const weekData = [
  {
    date: "05/05",
    served: 36,
    possible: 40,
  },
  {
    date: "05/06",
    served: 14,
    possible: 18,
  },
  {
    date: "05/07",
    served: 10,
    possible: 12,
  },
  {
    date: "05/08",
    served: 18,
    possible: 20,
  },
  {
    date: "05/09",
    served: 12,
    possible: 15,
  },
  {
    date: "05/10",
    served: 8,
    possible: 10,
  },
  {
    date: "05/11",
    served: 25,
    possible: 25,
  },
]

const monthData = [
  {
    date: "Week 1",
    served: 135,
    possible: 150,
  },
  {
    date: "Week 2",
    served: 139,
    possible: 155,
  },
  {
    date: "Week 3",
    served: 133,
    possible: 160,
  },
  {
    date: "Week 4",
    served: 137,
    possible: 145,
  },
]

interface EfficiencyChartProps {
  dateRange: "week" | "month"
}

export function EfficiencyChart({ dateRange }: EfficiencyChartProps) {
  const data = dateRange === "week" ? weekData : monthData

  return (
    <ResponsiveContainer width="100%" height={200}>
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
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => [`${value} portions`, ""]} />
        <Legend />
        <Bar dataKey="served" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Portions Served" />
        <Bar dataKey="possible" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Possible Portions" />
        <ReferenceLine y={0} stroke="#404040" />
      </BarChart>
    </ResponsiveContainer>
  )
}
