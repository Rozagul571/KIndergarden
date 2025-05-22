"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { motion } from "framer-motion"

const data = [
  {
    name: "Beef",
    quantity: 5000,
    threshold: 1000,
  },
  {
    name: "Potato",
    quantity: 8000,
    threshold: 2000,
  },
  {
    name: "Chicken",
    quantity: 3000,
    threshold: 800,
  },
  {
    name: "Rice",
    quantity: 10000,
    threshold: 2000,
  },
  {
    name: "Carrot",
    quantity: 4000,
    threshold: 1000,
  },
  {
    name: "Onion",
    quantity: 3500,
    threshold: 800,
  },
  {
    name: "Tomato",
    quantity: 2500,
    threshold: 600,
  },
]

export function InventorySummary() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[350px]"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: "Ingredients", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}g`}
            label={{ value: "Quantity (g)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "quantity") return [`${value}g`, "Current Quantity"]
              if (name === "threshold") return [`${value}g`, "Threshold Level"]
              return [value, name]
            }}
            labelFormatter={(label) => `Ingredient: ${label}`}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #fcd34d",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            cursor={{ fill: "rgba(251, 191, 36, 0.1)" }}
          />
          <Legend
            formatter={(value) => {
              if (value === "quantity") return "Current Quantity"
              if (value === "threshold") return "Threshold Level"
              return value
            }}
          />
          <Bar
            dataKey="quantity"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            barSize={30}
            name="quantity"
          />
          <Bar
            dataKey="threshold"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            barSize={30}
            name="threshold"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
