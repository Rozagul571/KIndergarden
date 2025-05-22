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
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  checkPermission: (requiredRole: string | string[]) => boolean
}

// Sample users with Uzbek names
const sampleUsers = [
  {
    id: 1,
    name: "Rozagul Nodirbekova",
    email: "admin@example.com",
    password: "Rozagul",
    role: "admin",
  },
  {
    id: 2,
    name: "Mukhlisa Karimova",
    email: "cook@example.com",
    password: "Mukhlisa",
    role: "cook",
  },
  {
    id: 3,
    name: "Fatima Azizova",
    email: "fatima@example.com",
    password: "Fatima123",
    role: "cook",
  },
  {
    id: 4,
    name: "Dilshod Umarov",
    email: "manager@example.com",
    password: "Dilshod123",
    role: "manager",
  },
  {
    id: 5,
    name: "Aziza Tursunova",
    email: "aziza@example.com",
    password: "Aziza123",
    role: "cook",
  },
  {
    id: 6,
    name: "Rustam Kamolov",
    email: "rustam@example.com",
    password: "Rustam123",
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
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // In a real app, this would be an API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const foundUser = sampleUsers.find((u) => (u.email === email || u.name === email) && u.password === password)

        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser
          setUser(userWithoutPassword as User)
          localStorage.setItem("user", JSON.stringify(userWithoutPassword))
          setIsLoading(false)

          // Redirect to dashboard after successful login
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard"
          }

          resolve(true)
        } else {
          setIsLoading(false)
          resolve(false)
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

        // In a real app, we would add this user to the database
        // For now, we'll just simulate a successful registration
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

    if (user.role === "admin") return true // Admin has access to everything

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }

    return user.role === requiredRole
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
