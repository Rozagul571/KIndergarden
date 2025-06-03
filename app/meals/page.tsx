"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash } from "lucide-react"
import type { Meal, MealIngredient } from "@/types/meals"
import type { InventoryItem } from "@/types/inventory"
import Link from "next/link"
import { motion } from "framer-motion"
import { useWebSocket } from "@/contexts/websocket-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// Sample inventory data (ideally fetched from backend)
const initialInventory: InventoryItem[] = [
  { id: 1, name: "Beef", quantity: 5000, unit: "g", deliveryDate: "2025-05-10", threshold: 1000, status: "Available" },
  {
    id: 2,
    name: "Potato",
    quantity: 8000,
    unit: "g",
    deliveryDate: "2025-05-08",
    threshold: 2000,
    status: "Available",
  },
  { id: 3, name: "Salt", quantity: 1500, unit: "g", deliveryDate: "2025-05-05", threshold: 500, status: "Available" },
  {
    id: 4,
    name: "Chicken",
    quantity: 3000,
    unit: "g",
    deliveryDate: "2025-05-11",
    threshold: 800,
    status: "Available",
  },
  { id: 5, name: "Rice", quantity: 10000, unit: "g", deliveryDate: "2025-05-07", threshold: 2000, status: "Available" },
  {
    id: 6,
    name: "Carrot",
    quantity: 4000,
    unit: "g",
    deliveryDate: "2025-05-09",
    threshold: 1000,
    status: "Available",
  },
  { id: 7, name: "Onion", quantity: 3500, unit: "g", deliveryDate: "2025-05-10", threshold: 800, status: "Available" },
  { id: 8, name: "Tomato", quantity: 2500, unit: "g", deliveryDate: "2025-05-11", threshold: 600, status: "Available" },
  { id: 9, name: "Flour", quantity: 7000, unit: "g", deliveryDate: "2025-05-06", threshold: 1500, status: "Available" },
  {
    id: 10,
    name: "Water",
    quantity: 50000,
    unit: "ml",
    deliveryDate: "2025-05-08",
    threshold: 10000,
    status: "Available",
  },
  { id: 11, name: "Lamb", quantity: 4000, unit: "g", deliveryDate: "2025-05-10", threshold: 1000, status: "Available" },
  {
    id: 12,
    name: "Noodles",
    quantity: 6000,
    unit: "g",
    deliveryDate: "2025-05-09",
    threshold: 1500,
    status: "Available",
  },
  {
    id: 13,
    name: "Garlic",
    quantity: 1000,
    unit: "g",
    deliveryDate: "2025-05-08",
    threshold: 300,
    status: "Available",
  },
  { id: 14, name: "Cumin", quantity: 500, unit: "g", deliveryDate: "2025-05-07", threshold: 100, status: "Available" },
  {
    id: 15,
    name: "Bell Pepper",
    quantity: 2000,
    unit: "g",
    deliveryDate: "2025-05-11",
    threshold: 500,
    status: "Available",
  },
]

// Sample meals data for development/testing
const sampleMeals: Meal[] = [
  {
    id: 1,
    name: "Beef Stew",
    description: "Hearty beef stew with vegetables",
    ingredients: [
      { ingredientId: 1, name: "Beef", quantity: 200, unit: "g" },
      { ingredientId: 2, name: "Potato", quantity: 100, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 50, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 30, unit: "g" },
    ],
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Chicken Soup",
    description: "Nutritious chicken soup",
    ingredients: [
      { ingredientId: 4, name: "Chicken", quantity: 150, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 40, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 25, unit: "g" },
      { ingredientId: 10, name: "Water", quantity: 500, unit: "ml" },
    ],
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Vegetable Rice",
    description: "Healthy vegetable rice",
    ingredients: [
      { ingredientId: 5, name: "Rice", quantity: 80, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 30, unit: "g" },
      { ingredientId: 8, name: "Tomato", quantity: 40, unit: "g" },
      { ingredientId: 15, name: "Bell Pepper", quantity: 25, unit: "g" },
    ],
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
]

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [inventory] = useState<InventoryItem[]>(initialInventory)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewIngredientsDialogOpen, setIsViewIngredientsDialogOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: "",
    description: "",
    ingredients: [],
    imageUrl: "/placeholder.svg?height=100&width=100",
  })
  const [newIngredient, setNewIngredient] = useState<Partial<MealIngredient>>({
    ingredientId: 0,
    name: "",
    quantity: 0,
    unit: "g",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()
  const { sendMessage } = useWebSocket()
  const { user, isAuthenticated } = useAuth()

  // Fetch meals from backend on mount
  useEffect(() => {
    async function fetchMeals() {
      setIsLoading(true)
      setError(null)
      try {
        // For development/testing, use sample data if API is not available
        if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
          console.log("Using sample meals data")
          setMeals(sampleMeals)
          setIsLoading(false)
          return
        }

        let token = null
        if (isAuthenticated && user) {
          token = localStorage.getItem("token")
        }

        const response = await fetch(`/api/meals?token=${token}`)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", errorText)
          throw new Error(`Failed to fetch meals: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server did not return JSON")
        }

        const data = await response.json()
        console.log("Fetched meals:", data)
        setMeals(data)
      } catch (error) {
        console.error("Error fetching meals:", error)
        setError(error instanceof Error ? error.message : "Failed to load meals")
        toast({
          title: "Error",
          description: "Failed to load meals from the backend.",
          variant: "destructive",
        })

        // Fallback to sample data in case of error
        console.log("Using fallback sample meals data")
        setMeals(sampleMeals)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeals()

    if (sendMessage) {
      sendMessage(JSON.stringify({ type: "meals_page_viewed" }))
    }
  }, [sendMessage, toast, isAuthenticated, user])

  const calculatePossiblePortions = (meal: Meal): number => {
    if (!meal.ingredients.length) return 0

    return Math.floor(
      Math.min(
        ...meal.ingredients.map((ingredient) => {
          const inventoryItem = inventory.find((item) => item.id === ingredient.ingredientId)
          if (!inventoryItem) return 0
          return Math.floor(inventoryItem.quantity / ingredient.quantity)
        }),
      ),
    )
  }

  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.ingredients?.length || !user) return

    try {
      const mealToAdd: Meal = {
        id: Math.max(0, ...meals.map((meal) => meal.id)) + 1,
        name: newMeal.name,
        description: newMeal.description || "",
        ingredients: newMeal.ingredients as MealIngredient[],
        imageUrl: newMeal.imageUrl || "/placeholder.svg?height=100&width=100",
      }

      // Optimistically update UI
      setMeals([...meals, mealToAdd])

      // Send notification
      const ingredientsList = mealToAdd.ingredients.map((ing) => `${ing.name}: ${ing.quantity} ${ing.unit}`).join(", ")
      const notificationMessage = `${user.name} added new meal "${mealToAdd.name}" with ingredients: ${ingredientsList}`

      if (sendMessage) {
        sendMessage({
          type: "meal_added",
          message: notificationMessage,
          user: { id: user.id, name: user.name, role: user.role },
          data: {
            mealId: mealToAdd.id,
            mealName: mealToAdd.name,
            description: mealToAdd.description,
            ingredients: mealToAdd.ingredients,
            createdBy: user.name,
            createdAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        })
      }

      // Reset form
      setNewMeal({
        name: "",
        description: "",
        ingredients: [],
        imageUrl: "/placeholder.svg?height=100&width=100",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Meal Added",
        description: "The meal has been successfully added.",
      })

      // Call backend API to save meal
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealToAdd.name,
          description: mealToAdd.description,
          image_url: mealToAdd.imageUrl,
          ingredients: mealToAdd.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error saving meal:", errorText)
        throw new Error("Failed to save meal")
      }

      // Refresh meals list after successful save
      const updatedResponse = await fetch("/api/meals")
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json()
        setMeals(updatedData)
      }
    } catch (error) {
      console.error("Error saving meal:", error)
      toast({
        title: "Error",
        description: "Failed to save meal to the backend.",
        variant: "destructive",
      })
    }
  }

  const handleAddIngredientToMeal = () => {
    if (!newIngredient.ingredientId || !newIngredient.quantity || newIngredient.quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select an ingredient and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const inventoryItem = inventory.find((item) => item.id === newIngredient.ingredientId)
    if (!inventoryItem) return

    // Check if ingredient already exists in the meal
    const existingIngredientIndex =
      newMeal.ingredients?.findIndex((ing) => ing.ingredientId === newIngredient.ingredientId) ?? -1

    if (existingIngredientIndex >= 0 && newMeal.ingredients) {
      // Update existing ingredient quantity
      const updatedIngredients = [...newMeal.ingredients]
      updatedIngredients[existingIngredientIndex] = {
        ...updatedIngredients[existingIngredientIndex],
        quantity: (updatedIngredients[existingIngredientIndex].quantity || 0) + Number(newIngredient.quantity),
      }

      setNewMeal({
        ...newMeal,
        ingredients: updatedIngredients,
      })

      toast({
        title: "Ingredient Updated",
        description: `Updated ${inventoryItem.name} quantity in the meal.`,
      })
    } else {
      // Add new ingredient
      const ingredientToAdd: MealIngredient = {
        ingredientId: newIngredient.ingredientId,
        name: inventoryItem.name,
        quantity: Number(newIngredient.quantity),
        unit: inventoryItem.unit,
      }

      setNewMeal({
        ...newMeal,
        ingredients: [...(newMeal.ingredients || []), ingredientToAdd],
      })
    }

    setNewIngredient({
      ingredientId: 0,
      name: "",
      quantity: 0,
      unit: "g",
    })
  }

  const handleUpdateMeal = async () => {
    if (!selectedMeal || !user) return

    try {
      // Find the original meal to compare changes
      const originalMeal = meals.find((meal) => meal.id === selectedMeal.id)
      if (!originalMeal) return

      // Update meals state
      const updatedMeals = meals.map((meal) => (meal.id === selectedMeal.id ? selectedMeal : meal))
      setMeals(updatedMeals)

      // Detect changes
      const changes: string[] = []
      if (originalMeal.name !== selectedMeal.name) {
        changes.push(`name changed to "${selectedMeal.name}"`)
      }
      if (originalMeal.description !== selectedMeal.description) {
        changes.push(`description updated`)
      }

      // Compare ingredients
      const originalIngredients = originalMeal.ingredients.reduce(
        (acc, ing) => ({ ...acc, [ing.ingredientId]: ing.quantity }),
        {} as Record<number, number>,
      )
      const updatedIngredients = selectedMeal.ingredients.reduce(
        (acc, ing) => ({ ...acc, [ing.ingredientId]: ing.quantity }),
        {} as Record<number, number>,
      )

      selectedMeal.ingredients.forEach((ing) => {
        const originalQty = originalIngredients[ing.ingredientId] || 0
        if (originalQty === 0) {
          changes.push(`added ${ing.name}: ${ing.quantity} ${ing.unit}`)
        } else if (ing.quantity !== originalQty) {
          changes.push(`${ing.name} quantity changed to ${ing.quantity} ${ing.unit}`)
        }
      })

      // Check for removed ingredients
      originalMeal.ingredients.forEach((ing) => {
        if (!updatedIngredients[ing.ingredientId]) {
          changes.push(`removed ${ing.name}`)
        }
      })

      // Send notification
      const notificationMessage = changes.length
        ? `${user.name} updated meal "${selectedMeal.name}": ${changes.join(", ")}`
        : `${user.name} updated meal "${selectedMeal.name}"`

      if (sendMessage) {
        sendMessage({
          type: "meal_updated",
          message: notificationMessage,
          user: { id: user.id, name: user.name, role: user.role },
          data: {
            mealId: selectedMeal.id,
            mealName: selectedMeal.name,
            changes,
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        })
      }

      setSelectedMeal(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Meal Updated",
        description: "The meal has been successfully updated.",
      })

      // Call backend API to update meal
      const response = await fetch(`/api/meals/${selectedMeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedMeal.name,
          description: selectedMeal.description,
          image_url: selectedMeal.imageUrl,
          ingredients: selectedMeal.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error updating meal:", errorText)
        throw new Error("Failed to update meal")
      }

      // Refresh meals list after successful update
      const updatedResponse = await fetch("/api/meals")
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json()
        setMeals(updatedData)
      }
    } catch (error) {
      console.error("Error updating meal:", error)
      toast({
        title: "Error",
        description: "Failed to update meal in the backend.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMeal = async (id: number) => {
    const mealToDelete = meals.find((meal) => meal.id === id)
    if (!mealToDelete || !user) return

    try {
      // Optimistically update UI
      setMeals(meals.filter((meal) => meal.id !== id))

      // Send notification
      const notificationMessage = `${user.name} deleted meal "${mealToDelete.name}"`

      if (sendMessage) {
        sendMessage({
          type: "meal_deleted",
          message: notificationMessage,
          user: { id: user.id, name: user.name, role: user.role },
          data: {
            mealId: mealToDelete.id,
            mealName: mealToDelete.name,
            deletedBy: user.name,
            deletedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        })
      }

      toast({
        title: "Meal Deleted",
        description: "The meal has been successfully deleted.",
      })

      // Call backend API to delete meal
      const response = await fetch(`/api/meals/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error deleting meal:", errorText)
        throw new Error("Failed to delete meal")
      }
    } catch (error) {
      console.error("Error deleting meal:", error)
      toast({
        title: "Error",
        description: "Failed to delete meal from the backend.",
        variant: "destructive",
      })

      // Restore the deleted meal in case of error
      if (mealToDelete) {
        setMeals([...meals.filter((meal) => meal.id !== id), mealToDelete])
      }
    }
  }

  const handleRemoveIngredientFromMeal = (index: number) => {
    if (!newMeal.ingredients || !user) return

    const removedIngredient = newMeal.ingredients[index]
    const updatedIngredients = [...newMeal.ingredients]
    updatedIngredients.splice(index, 1)
    setNewMeal({
      ...newMeal,
      ingredients: updatedIngredients,
    })

    // Send notification
    const notificationMessage = `${user.name} removed ingredient "${removedIngredient.name}" from new meal "${newMeal.name || "Untitled"}"`

    if (sendMessage) {
      sendMessage({
        type: "meal_updated",
        message: notificationMessage,
        user: { id: user.id, name: user.name, role: user.role },
        data: {
          mealName: newMeal.name || "Untitled",
          removedIngredient,
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleRemoveIngredientFromSelectedMeal = (index: number) => {
    if (!selectedMeal || !selectedMeal.ingredients || !user) return

    const removedIngredient = selectedMeal.ingredients[index]
    const updatedIngredients = [...selectedMeal.ingredients]
    updatedIngredients.splice(index, 1)
    setSelectedMeal({
      ...selectedMeal,
      ingredients: updatedIngredients,
    })

    // Send notification
    const notificationMessage = `${user.name} removed ingredient "${removedIngredient.name}" from meal "${selectedMeal.name}"`

    if (sendMessage) {
      sendMessage({
        type: "meal_updated",
        message: notificationMessage,
        user: { id: user.id, name: user.name, role: user.role },
        data: {
          mealId: selectedMeal.id,
          mealName: selectedMeal.name,
          removedIngredient,
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleUpdateIngredientQuantity = (index: number, newQuantity: number) => {
    if (!selectedMeal || !selectedMeal.ingredients || newQuantity <= 0) return

    const updatedIngredients = [...selectedMeal.ingredients]
    const oldQuantity = updatedIngredients[index].quantity
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      quantity: newQuantity,
    }
    setSelectedMeal({
      ...selectedMeal,
      ingredients: updatedIngredients,
    })

    // Send notification
    const ingredient = updatedIngredients[index]
    const notificationMessage = `${user?.name} updated meal "${selectedMeal.name}": ${ingredient.name} quantity changed to ${newQuantity} ${ingredient.unit}`

    if (sendMessage) {
      sendMessage({
        type: "meal_updated",
        message: notificationMessage,
        user: { id: user?.id, name: user?.name, role: user?.role },
        data: {
          mealId: selectedMeal.id,
          mealName: selectedMeal.name,
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.name,
          oldQuantity,
          newQuantity,
          unit: ingredient.unit,
          updatedBy: user?.name,
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      })
    }
  }

  const startEditMeal = (meal: Meal) => {
    setSelectedMeal(meal)
    setIsEditDialogOpen(true)
  }

  const viewMealIngredients = (meal: Meal) => {
    setSelectedMeal(meal)
    setIsViewIngredientsDialogOpen(true)
  }

  const handleIngredientSelect = (ingredientId: number) => {
    const inventoryItem = inventory.find((item) => item.id === ingredientId)
    setNewIngredient({
      ...newIngredient,
      ingredientId,
      unit: inventoryItem?.unit || "g",
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-amber-700">Loading meals...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-red-700 text-lg font-semibold mb-2">Error Loading Meals</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-red-600 mt-2">Using sample data instead.</p>
        </div>

        {/* Rest of the component with sample data */}
        {/* ... */}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Meal Management
        </h1>
        <div className="flex space-x-2">
          <Link href="/meals/serve" passHref>
            <Button
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              Serve Meals
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Plus className="mr-2 h-4 w-4" /> Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Meal</DialogTitle>
                <DialogDescription>Define a new meal with its ingredients and quantities.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meal-name" className="text-right">
                    Meal Name
                  </Label>
                  <Input
                    id="meal-name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meal-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="meal-description"
                    value={newMeal.description}
                    onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="border p-4 rounded-md border-amber-200">
                  <h3 className="font-medium mb-2 text-amber-700">Add Ingredients</h3>
                  <div className="grid grid-cols-12 gap-2 mb-4">
                    <div className="col-span-5">
                      <Label htmlFor="ingredient-select">Ingredient</Label>
                      <select
                        id="ingredient-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={newIngredient.ingredientId}
                        onChange={(e) => handleIngredientSelect(Number(e.target.value))}
                      >
                        <option value={0}>Select ingredient</option>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit} available)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="ingredient-quantity">Quantity</Label>
                      <Input
                        id="ingredient-quantity"
                        type="number"
                        min="0"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="ingredient-unit">Unit</Label>
                      <Input id="ingredient-unit" value={newIngredient.unit} disabled />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button
                        onClick={handleAddIngredientToMeal}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-amber-700">Ingredients in this meal:</h4>
                    {newMeal.ingredients && newMeal.ingredients.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ingredient</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newMeal.ingredients.map((ingredient, index) => (
                            <TableRow key={index}>
                              <TableCell>{ingredient.name}</TableCell>
                              <TableCell>{ingredient.quantity}</TableCell>
                              <TableCell>{ingredient.unit}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveIngredientFromMeal(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No ingredients added yet.</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name || !newMeal.ingredients?.length}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Create Meal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6"
      >
        {meals.map((meal) => {
          const portions = calculatePossiblePortions(meal)
          return (
            <motion.div key={meal.id} variants={item}>
              <Card className="overflow-hidden border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-video relative">
                  <img
                    src={meal.imageUrl || "/placeholder.svg"}
                    alt={meal.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-xl font-bold">{meal.name}</h3>
                      <p className="text-sm text-white/80">{meal.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant={portions > 0 ? "outline" : "destructive"}
                    className={`absolute top-2 right-2 ${
                      portions > 0 ? "bg-white/90 border-amber-300 text-amber-700" : "bg-red-500 text-white"
                    } font-bold text-sm px-3 py-1 shadow-md`}
                  >
                    {portions} portions possible
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      {meal.ingredients.length} ingredients
                    </Badge>
                    <Button
                      variant="link"
                      onClick={() => viewMealIngredients(meal)}
                      className="text-amber-600 hover:text-amber-800 p-0 h-auto"
                    >
                      View ingredients
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditMeal(meal)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-500 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <Card className="border-amber-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-700">All Meals</CardTitle>
          <CardDescription>Manage your meal recipes and track possible portions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead>Possible Portions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map((meal) => {
                const portions = calculatePossiblePortions(meal)
                return (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">{meal.name}</TableCell>
                    <TableCell>{meal.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => viewMealIngredients(meal)}
                        className="text-amber-600 hover:text-amber-800 p-0 h-auto"
                      >
                        View {meal.ingredients.length} ingredients
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={portions > 0 ? "outline" : "destructive"}
                        className={`${
                          portions > 0
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-red-50 border-red-300 text-red-700"
                        } font-bold`}
                      >
                        {portions} portions
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditMeal(meal)}
                          className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Ingredients Dialog */}
      <Dialog open={isViewIngredientsDialogOpen} onOpenChange={setIsViewIngredientsDialogOpen}>
        <DialogContent className="border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">{selectedMeal?.name} Ingredients</DialogTitle>
            <DialogDescription>List of ingredients required for this meal.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMeal?.ingredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>{ingredient.quantity}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsViewIngredientsDialogOpen(false)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Edit Meal</DialogTitle>
            <DialogDescription>Update the meal recipe and ingredients.</DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meal-name" className="text-right">
                  Meal Name
                </Label>
                <Input
                  id="edit-meal-name"
                  value={selectedMeal.name}
                  onChange={(e) => setSelectedMeal({ ...selectedMeal, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-meal-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-meal-description"
                  value={selectedMeal.description}
                  onChange={(e) => setSelectedMeal({ ...selectedMeal, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="border p-4 rounded-md border-amber-200">
                <h3 className="font-medium mb-2 text-amber-700">Ingredients</h3>
                <div className="grid grid-cols-12 gap-2 mb-4">
                  <div className="col-span-5">
                    <Label htmlFor="edit-ingredient-select">Ingredient</Label>
                    <select
                      id="edit-ingredient-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newIngredient.ingredientId}
                      onChange={(e) => handleIngredientSelect(Number(e.target.value))}
                    >
                      <option value={0}>Select ingredient</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="edit-ingredient-quantity">Quantity</Label>
                    <Input
                      id="edit-ingredient-quantity"
                      type="number"
                      min="0"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-ingredient-unit">Unit</Label>
                    <Input id="edit-ingredient-unit" value={newIngredient.unit} disabled />
                  </div>
                  <div className="col-span-2 flex items-end">
                    <Button
                      onClick={() => {
                        if (
                          !newIngredient.ingredientId ||
                          !newIngredient.quantity ||
                          newIngredient.quantity <= 0 ||
                          !user
                        ) {
                          toast({
                            title: "Invalid Input",
                            description: "Please select an ingredient and enter a valid quantity.",
                            variant: "destructive",
                          })
                          return
                        }

                        const inventoryItem = inventory.find((item) => item.id === newIngredient.ingredientId)
                        if (!inventoryItem) return

                        // Check if ingredient already exists in the meal
                        const existingIngredientIndex = selectedMeal.ingredients.findIndex(
                          (ing) => ing.ingredientId === newIngredient.ingredientId,
                        )

                        if (existingIngredientIndex >= 0) {
                          // Update existing ingredient quantity
                          const updatedIngredients = [...selectedMeal.ingredients]
                          updatedIngredients[existingIngredientIndex] = {
                            ...updatedIngredients[existingIngredientIndex],
                            quantity:
                              updatedIngredients[existingIngredientIndex].quantity + Number(newIngredient.quantity),
                          }

                          setSelectedMeal({
                            ...selectedMeal,
                            ingredients: updatedIngredients,
                          })

                          // Send notification
                          const notificationMessage = `${user.name} updated ingredient "${inventoryItem.name}" quantity to ${updatedIngredients[existingIngredientIndex].quantity} ${inventoryItem.unit} in meal "${selectedMeal.name}"`

                          if (sendMessage) {
                            sendMessage({
                              type: "meal_updated",
                              message: notificationMessage,
                              user: { id: user.id, name: user.name, role: user.role },
                              data: {
                                mealId: selectedMeal.id,
                                mealName: selectedMeal.name,
                                updatedIngredient: updatedIngredients[existingIngredientIndex],
                                updatedBy: user.name,
                                updatedAt: new Date().toISOString(),
                              },
                              timestamp: new Date().toISOString(),
                            })
                          }

                          toast({
                            title: "Ingredient Updated",
                            description: `Updated ${inventoryItem.name} quantity in the meal.`,
                          })
                        } else {
                          // Add new ingredient
                          const ingredientToAdd: MealIngredient = {
                            ingredientId: newIngredient.ingredientId,
                            name: inventoryItem.name,
                            quantity: Number(newIngredient.quantity),
                            unit: inventoryItem.unit,
                          }

                          setSelectedMeal({
                            ...selectedMeal,
                            ingredients: [...selectedMeal.ingredients, ingredientToAdd],
                          })

                          // Send notification
                          const notificationMessage = `${user.name} added ingredient "${inventoryItem.name}": ${newIngredient.quantity} ${newIngredient.unit} to meal "${selectedMeal.name}"`

                          if (sendMessage) {
                            sendMessage({
                              type: "meal_updated",
                              message: notificationMessage,
                              user: { id: user.id, name: user.name, role: user.role },
                              data: {
                                mealId: selectedMeal.id,
                                mealName: selectedMeal.name,
                                addedIngredient: ingredientToAdd,
                                updatedBy: user.name,
                                updatedAt: new Date().toISOString(),
                              },
                              timestamp: new Date().toISOString(),
                            })
                          }
                        }

                        setNewIngredient({
                          ingredientId: 0,
                          name: "",
                          quantity: 0,
                          unit: "g",
                        })
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-amber-700">Current ingredients:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMeal.ingredients.map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell>{ingredient.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={ingredient.quantity}
                              onChange={(e) => handleUpdateIngredientQuantity(index, Number(e.target.value))}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredientFromSelectedMeal(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMeal} className="bg-amber-500 hover:bg-amber-600 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
