"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    } else if (!isLoading && isAuthenticated && requiredRole && !checkPermission(requiredRole)) {
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthenticated, router, requiredRole, checkPermission])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && !checkPermission(requiredRole)) {
    return null
  }

  return <>{children}</>
}
