"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, PieChart, ShoppingCart, Bell } from "lucide-react"
import { AuthButton } from "@/components/auth-button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ChefLogo } from "@/components/chef-logo"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (!isMounted) {
    return null // Return null on first render to avoid hydration issues
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-200 opacity-20"
              initial={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                x: Math.random() * (windowSize.width || 1200),
                y: Math.random() * (windowSize.height || 800),
              }}
              animate={{
                x: [
                  Math.random() * (windowSize.width || 1200),
                  Math.random() * (windowSize.width || 1200),
                  Math.random() * (windowSize.width || 1200),
                ],
                y: [
                  Math.random() * (windowSize.height || 800),
                  Math.random() * (windowSize.height || 800),
                  Math.random() * (windowSize.height || 800),
                ],
              }}
              transition={{
                duration: Math.random() * 60 + 30,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <ChefLogo className="h-10 w-10" />
              <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                KinderChef
              </span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-1">
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className="relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <span className="relative z-10">Dashboard</span>
                <span className="absolute inset-0 bg-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Button>
            </Link>
            <Link href="/inventory" passHref>
              <Button
                variant="ghost"
                className="relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <span className="relative z-10">Inventory</span>
                <span className="absolute inset-0 bg-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Button>
            </Link>
            <Link href="/meals" passHref>
              <Button
                variant="ghost"
                className="relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <span className="relative z-10">Meals</span>
                <span className="absolute inset-0 bg-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Button>
            </Link>
            <Link href="/orders" passHref>
              <Button
                variant="ghost"
                className="relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <span className="relative z-10">Orders</span>
                <span className="absolute inset-0 bg-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Button>
            </Link>
            <Link href="/reports" passHref>
              <Button
                variant="ghost"
                className="relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <span className="relative z-10">Reports</span>
                <span className="absolute inset-0 bg-amber-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </Button>
            </Link>
            <Link href="/notifications" passHref>
              <Button
                variant="ghost"
                className="relative rounded-full w-10 h-10 p-0 overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <Bell className="h-5 w-5 relative z-10" />
                <span className="absolute inset-0 bg-amber-100 transform scale-0 group-hover:scale-100 transition-transform origin-center duration-300 ease-out rounded-full" />
              </Button>
            </Link>
            <AuthButton />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10"
            style={{
              transform: `translate(${mousePosition.x / 50}px, ${mousePosition.y / 50}px)`,
            }}
          />
          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                >
                  Kindergarten Meal Tracking & Inventory Management
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
                >
                  Efficiently manage kitchen inventory, track meals, and generate reports for your kindergarten.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="space-x-4"
              >
                <Link href="/auth" passHref>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    Get Started
                  </Button>
                </Link>
                <Link href="/meals/serve" passHref>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Serve Meals
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid gap-6 lg:grid-cols-4 lg:gap-12"
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <Package className="h-10 w-10 mb-2 text-amber-500" />
                    <CardTitle className="text-amber-700">Inventory Management</CardTitle>
                    <CardDescription>Track ingredients, record deliveries, and monitor stock levels.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/inventory" passHref>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 transition-all duration-300"
                      >
                        Manage Inventory
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <ChefLogo className="h-10 w-10 mb-2 text-amber-500" />
                    <CardTitle className="text-amber-700">Meal Management</CardTitle>
                    <CardDescription>Create and update meal recipes, serve meals, and track portions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/meals" passHref>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 transition-all duration-300"
                      >
                        Manage Meals
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <ShoppingCart className="h-10 w-10 mb-2 text-amber-500" />
                    <CardTitle className="text-amber-700">Orders</CardTitle>
                    <CardDescription>Create orders for ingredients and track deliveries.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/orders" passHref>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 transition-all duration-300"
                      >
                        Manage Orders
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <PieChart className="h-10 w-10 mb-2 text-amber-500" />
                    <CardTitle className="text-amber-700">Reports & Analytics</CardTitle>
                    <CardDescription>Generate reports, visualize data, and identify potential issues.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/reports" passHref>
                      <Button
                        variant="outline"
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 transition-all duration-300"
                      >
                        View Reports
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KinderChef. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="hover:bg-amber-100 transition-colors duration-300">
              English
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-amber-100 transition-colors duration-300">
              Uzbek
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
