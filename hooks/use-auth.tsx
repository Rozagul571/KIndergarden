"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "cook" | "manager"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  checkPermission: (requiredRole: string | string[]) => boolean
}

// Sample users for demonstration
const sampleUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "cook@example.com",
    password: "password123",
    role: "cook",
  },
  {
    id: 3,
    name: "David Lee",
    email: "cook2@example.com",
    password: "password123",
    role: "cook",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // In a real app, this would be an API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = sampleUsers.find((u) => u.email === email && u.password === password)

        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser
          setUser(userWithoutPassword as User)
          localStorage.setItem("user", JSON.stringify(userWithoutPassword))
          setIsLoading(false)
          resolve()
        } else {
          setIsLoading(false)
          reject(new Error("Invalid credentials"))
        }
      }, 1000) // Simulate API delay
    })
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true)

    // In a real app, this would be an API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = sampleUsers.find((u) => u.email === email)
        if (existingUser) {
          setIsLoading(false)
          reject(new Error("Email already in use"))
          return
        }

        // Create new user
        const newUser = {
          id: sampleUsers.length + 1,
          name,
          email,
          role: role as "admin" | "cook" | "manager",
        }

        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
        setIsLoading(false)
        resolve()
      }, 1000) // Simulate API delay
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/auth")
  }

  const checkPermission = (requiredRole: string | string[]) => {
    if (!user) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }

    return user.role === requiredRole || user.role === "admin"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
