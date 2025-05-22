"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { motion } from "framer-motion"

const data = [
  { name: "Osh (Plov)", value: 35, color: "#f59e0b" },
  { name: "Lagman", value: 25, color: "#fbbf24" },
  { name: "Somsa", value: 20, color: "#fcd34d" },
  { name: "Manti", value: 15, color: "#fde68a" },
  { name: "Shurpa", value: 5, color: "#fef3c7" },
]

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
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} portions (${((value / 100) * 100).toFixed(0)}%)`, "Served"]}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #fcd34d",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            iconSize={10}
            formatter={(value, entry) => {
              const { payload } = entry as any
              return `${value}: ${payload.value} portions`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
