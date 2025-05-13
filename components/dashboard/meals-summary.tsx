"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { motion } from "framer-motion"

const data = [
  { name: "Osh (Plov)", value: 35 },
  { name: "Lagman", value: 25 },
  { name: "Somsa", value: 20 },
  { name: "Manti", value: 15 },
  { name: "Shurpa", value: 5 },
]

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"]

export function MealsSummary() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[300px]"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            animationDuration={1500}
            animationBegin={300}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} portions`, "Served"]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #fcd34d",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
