"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"

const data = [
  {
    name: "Beef",
    quantity: 5000,
  },
  {
    name: "Potato",
    quantity: 8000,
  },
  {
    name: "Chicken",
    quantity: 3000,
  },
  {
    name: "Rice",
    quantity: 10000,
  },
  {
    name: "Carrot",
    quantity: 4000,
  },
  {
    name: "Onion",
    quantity: 3500,
  },
  {
    name: "Tomato",
    quantity: 2500,
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}g`}
          />
          <Tooltip
            formatter={(value) => [`${value}g`, "Quantity"]}
            labelFormatter={(label) => `Ingredient: ${label}`}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #fcd34d",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            cursor={{ fill: "rgba(251, 191, 36, 0.1)" }}
          />
          <Bar dataKey="quantity" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={1500} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
