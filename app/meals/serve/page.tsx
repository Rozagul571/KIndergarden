"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, Minus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Meal, MealIngredient, MealServing } from "@/types/meals"
import type { InventoryItem } from "@/types/inventory"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useWebSocket } from "@/contexts/websocket-context"
import { useAuth } from "@/hooks/use-auth"

// Sample data for demonstration
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

const initialMeals: Meal[] = [
  {
    id: 1,
    name: "Osh (Plov)",
    description: "Traditional Uzbek rice dish with meat and vegetables",
    ingredients: [
      { ingredientId: 5, name: "Rice", quantity: 100, unit: "g" },
      { ingredientId: 1, name: "Beef", quantity: 80, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 50, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 30, unit: "g" },
      { ingredientId: 3, name: "Salt", quantity: 3, unit: "g" },
      { ingredientId: 14, name: "Cumin", quantity: 2, unit: "g" },
      { ingredientId: 10, name: "Water", quantity: 200, unit: "ml" },
    ],
    imageUrl: "https://www.orexca.com/img/cuisine/plov/uzbek-pilaf.jpg",
  },
  {
    id: 2,
    name: "Lagman",
    description: "Uzbek noodle soup with meat and vegetables",
    ingredients: [
      { ingredientId: 12, name: "Noodles", quantity: 120, unit: "g" },
      { ingredientId: 1, name: "Beef", quantity: 70, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 40, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 30, unit: "g" },
      { ingredientId: 15, name: "Bell Pepper", quantity: 30, unit: "g" },
      { ingredientId: 8, name: "Tomato", quantity: 50, unit: "g" },
      { ingredientId: 3, name: "Salt", quantity: 3, unit: "g" },
      { ingredientId: 10, name: "Water", quantity: 300, unit: "ml" },
    ],
    imageUrl: "https://t4.ftcdn.net/jpg/02/31/48/03/360_F_231480324_BqyB5EmbS8LQg2uPF9SZHLovPQK8MfuO.jpg",
  },
  {
    id: 3,
    name: "Somsa",
    description: "Baked pastry with meat filling",
    ingredients: [
      { ingredientId: 9, name: "Flour", quantity: 80, unit: "g" },
      { ingredientId: 11, name: "Lamb", quantity: 60, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 20, unit: "g" },
      { ingredientId: 3, name: "Salt", quantity: 2, unit: "g" },
      { ingredientId: 14, name: "Cumin", quantity: 1, unit: "g" },
    ],
    imageUrl: "https://www.gazeta.uz/media/img/2023/10/0kTVoA16984691510527_l.jpg",
  },
  {
    id: 4,
    name: "Manti",
    description: "Steamed dumplings with meat and onions",
    ingredients: [
      { ingredientId: 9, name: "Flour", quantity: 70, unit: "g" },
      { ingredientId: 11, name: "Lamb", quantity: 50, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 30, unit: "g" },
      { ingredientId: 3, name: "Salt", quantity: 2, unit: "g" },
      { ingredientId: 10, name: "Water", quantity: 20, unit: "ml" },
    ],
    imageUrl: "https://image.essen-und-trinken.de/13122998/t/au/v5/w960/r1/-/adobestock-148423716-alju.jpg",
  },
  {
    id: 5,
    name: "Shurpa",
    description: "Traditional Uzbek soup with meat and vegetables",
    ingredients: [
      { ingredientId: 11, name: "Lamb", quantity: 80, unit: "g" },
      { ingredientId: 2, name: "Potato", quantity: 70, unit: "g" },
      { ingredientId: 6, name: "Carrot", quantity: 40, unit: "g" },
      { ingredientId: 7, name: "Onion", quantity: 30, unit: "g" },
      { ingredientId: 8, name: "Tomato", quantity: 40, unit: "g" },
      { ingredientId: 3, name: "Salt", quantity: 3, unit: "g" },
      { ingredientId: 10, name: "Water", quantity: 400, unit: "ml" },
    ],
    imageUrl: "https://recipesfriend.com/uploads/recipeimg/1575394112lamb_veg_soup_shurpa%20(2).jpg",
  },
]

const initialServings: MealServing[] = [
  {
    id: 1,
    mealId: 1,
    mealName: "Osh (Plov)",
    portions: 10,
    servedBy: "Malika Umarova",
    servedAt: "2025-05-11T09:30:00",
    userId: 2,
  },
  {
    id: 2,
    mealId: 2,
    mealName: "Lagman",
    portions: 15,
    servedBy: "Dilnoza Rakhimova",
    servedAt: "2025-05-11T12:15:00",
    userId: 3,
  },
  {
    id: 3,
    mealId: 3,
    mealName: "Somsa",
    portions: 8,
    servedBy: "Malika Umarova",
    servedAt: "2025-05-10T11:45:00",
    userId: 2,
  },
]

export default function ServeMealsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [meals] = useState<Meal[]>(initialMeals)
  const [servings, setServings] = useState<MealServing[]>(initialServings)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [portions, setPortions] = useState<number>(1)
  const [isServeDialogOpen, setIsServeDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [insufficientIngredients, setInsufficientIngredients] = useState<MealIngredient[]>([])
  const [servingSuccess, setServingSuccess] = useState(false)
  const { toast } = useToast()
  const { sendMessage } = useWebSocket()
  const { user } = useAuth()

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

  const checkIngredientsAvailability = (meal: Meal, portionsToServe: number): MealIngredient[] => {
    const insufficient: MealIngredient[] = []

    meal.ingredients.forEach((ingredient) => {
      const inventoryItem = inventory.find((item) => item.id === ingredient.ingredientId)

      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity * portionsToServe) {
        insufficient.push(ingredient)
      }
    })

    return insufficient
  }

  const handleServeMeal = () => {
    if (!selectedMeal || !portions) return

    const insufficient = checkIngredientsAvailability(selectedMeal, portions)

    if (insufficient.length > 0) {
      setInsufficientIngredients(insufficient)
      return
    }

    setIsConfirmDialogOpen(true)
  }

  const confirmServeMeal = () => {
    if (!selectedMeal || !portions || !user) return

    // Deduct ingredients from inventory
    const updatedInventory = [...inventory]
    selectedMeal.ingredients.forEach((ingredient) => {
      const inventoryItemIndex = updatedInventory.findIndex((item) => item.id === ingredient.ingredientId)

      if (inventoryItemIndex !== -1) {
        const newQuantity = updatedInventory[inventoryItemIndex].quantity - ingredient.quantity * portions
        let newStatus = updatedInventory[inventoryItemIndex].status

        if (newQuantity === 0) {
          newStatus = "Out of Stock"
        } else if (newQuantity <= updatedInventory[inventoryItemIndex].threshold) {
          newStatus = "Low"
        } else {
          newStatus = "Available"
        }

        updatedInventory[inventoryItemIndex] = {
          ...updatedInventory[inventoryItemIndex],
          quantity: newQuantity,
          status: newStatus,
        }
      }
    })

    // Add serving record
    const newServing: MealServing = {
      id: Math.max(0, ...servings.map((s) => s.id)) + 1,
      mealId: selectedMeal.id,
      mealName: selectedMeal.name,
      portions: portions,
      servedBy: user.name,
      servedAt: new Date().toISOString(),
      userId: user.id,
    }

    setInventory(updatedInventory)
    setServings([...servings, newServing])
    setIsConfirmDialogOpen(false)
    setIsServeDialogOpen(false)
    setServingSuccess(true)

    // Send notification via WebSocket
    sendMessage({
      type: "meal_served",
      message: `${user.name} served ${portions} portions of ${selectedMeal.name}`,
      user: { name: user.name, role: user.role },
      data: {
        mealId: selectedMeal.id,
        mealName: selectedMeal.name,
        portions: portions,
        servedBy: user.name,
        servedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    })

    // Show toast notification
    toast({
      title: "Meal Served",
      description: `${portions} portions of ${selectedMeal.name} served successfully`,
    })

    // Reset form
    setTimeout(() => {
      setServingSuccess(false)
      setSelectedMeal(null)
      setPortions(1)
    }, 3000)
  }

  const startServeMeal = (meal: Meal) => {
    setSelectedMeal(meal)
    setPortions(1)
    setInsufficientIngredients([])
    setIsServeDialogOpen(true)
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

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Serve Meals
        </h1>
      </motion.div>

      {servingSuccess && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Success!</AlertTitle>
            <AlertDescription className="text-green-600">
              Meal has been served successfully and inventory has been updated.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6"
      >
        {meals.map((meal) => {
          const possiblePortions = calculatePossiblePortions(meal)
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
                    className={`absolute top-2 right-2 ${
                      possiblePortions > 0 ? "bg-white/90 border-amber-300 text-amber-700" : "bg-red-500 text-white"
                    } font-bold text-sm px-3 py-1 shadow-md`}
                  >
                    {possiblePortions} portions available
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => startServeMeal(meal)}
                    disabled={possiblePortions <= 0}
                  >
                    Serve Meal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Serve Meal Dialog */}
      <Dialog open={isServeDialogOpen} onOpenChange={setIsServeDialogOpen}>
        <DialogContent className="sm:max-w-md border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Serve Meal</DialogTitle>
            <DialogDescription>
              {selectedMeal ? `Prepare and serve ${selectedMeal.name} to children` : "Select a meal to serve"}
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-700">Ingredients needed per portion:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMeal.ingredients.map((ingredient) => (
                    <li key={ingredient.ingredientId} className="flex justify-between">
                      <span>{ingredient.name}</span>
                      <span>
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-700">Number of portions:</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-amber-300"
                    onClick={() => setPortions(Math.max(1, portions - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center font-bold text-xl text-amber-700">{portions}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-amber-300"
                    onClick={() => setPortions(portions + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-gray-700">Total ingredients needed:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMeal.ingredients.map((ingredient) => {
                    const inventoryItem = inventory.find((item) => item.id === ingredient.ingredientId)
                    const totalNeeded = ingredient.quantity * portions
                    const isInsufficient = !inventoryItem || inventoryItem.quantity < totalNeeded

                    return (
                      <li
                        key={ingredient.ingredientId}
                        className={`flex justify-between ${isInsufficient ? "text-red-600 font-medium" : ""}`}
                      >
                        <span>{ingredient.name}</span>
                        <span>
                          {totalNeeded} {ingredient.unit}
                          {isInsufficient &&
                            ` (only ${inventoryItem ? inventoryItem.quantity : 0} ${ingredient.unit} available)`}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {insufficientIngredients.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Insufficient ingredients</AlertTitle>
                  <AlertDescription>
                    <p>The following ingredients are not available in sufficient quantity:</p>
                    <ul className="mt-2 list-disc list-inside">
                      {insufficientIngredients.map((ingredient) => (
                        <li key={ingredient.ingredientId}>
                          {ingredient.name} - Need{" "}
                          <span className="font-medium">
                            {ingredient.quantity * portions} {ingredient.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServeDialogOpen(false)} className="border-amber-300">
              Cancel
            </Button>
            <Button
              onClick={handleServeMeal}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Serve {portions} {portions === 1 ? "Portion" : "Portions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Confirm Serving</DialogTitle>
            <DialogDescription>
              Are you sure you want to serve {portions} {portions === 1 ? "portion" : "portions"} of{" "}
              {selectedMeal?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This will deduct the required ingredients from inventory and record the serving.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="border-amber-300 text-amber-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmServeMeal}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
