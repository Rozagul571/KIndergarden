"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ChefLogo } from "@/components/chef-logo"
import { Bell, Home, Package, Utensils, ShoppingCart, FileText, Settings, User, Users, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useWebSocket } from "@/contexts/websocket-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNavigation() {
  const pathname = usePathname()
  const { notifications } = useWebSocket()
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout } = useAuth()

  // Update unread count when new notifications arrive
  useEffect(() => {
    const count = notifications?.filter((n) => !n.read).length || 0
    setUnreadCount(count)
  }, [notifications])

  // Reset unread count when visiting notifications page
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnreadCount(0)
    }
  }, [pathname])

  // Define navigation items based on user role
  const getNavItems = () => {
    // Base items that everyone can see
    const baseItems = [{ href: "/dashboard", label: "Dashboard", icon: Home, roles: ["admin", "cook", "manager"] }]

    // Role-specific items
    const roleBasedItems = [
      { href: "/inventory", label: "Inventory", icon: Package, roles: ["admin", "manager"] },
      { href: "/meals", label: "Meals", icon: Utensils, roles: ["admin", "cook"] },
      { href: "/meals/serve", label: "Serve", icon: Utensils, roles: ["admin", "cook"] },
      { href: "/orders", label: "Orders", icon: ShoppingCart, roles: ["admin", "manager"] },
      { href: "/reports", label: "Reports", icon: FileText, roles: ["admin", "manager"] },
      { href: "/tracking", label: "User Tracking", icon: Users, roles: ["admin", "manager"] },
    ]

    // Filter items based on user role
    return [...baseItems, ...roleBasedItems.filter((item) => !user?.role || item.roles.includes(user.role))]
  }

  const navItems = getNavItems()

  return (
    <div className="bg-white border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center mr-6">
              <ChefLogo size="sm" />
              <span className="ml-2 text-xl font-bold text-amber-700">KinderChef</span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                      isActive ? "text-amber-700 bg-amber-50" : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-1" />
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                        layoutId="navbar-indicator"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {/* Only show notifications to admin */}
            {user?.role === "admin" && (
              <Link
                href="/notifications"
                className={`relative p-2 rounded-full ${
                  pathname === "/notifications"
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            )}

            {/* Only show settings to admin */}
            {user?.role === "admin" && (
              <Link
                href="/settings"
                className={`p-2 rounded-full ${
                  pathname === "/settings"
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:text-amber-700 hover:bg-amber-50"
                }`}
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 p-1 rounded-full hover:bg-amber-50">
                  <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center font-medium">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
