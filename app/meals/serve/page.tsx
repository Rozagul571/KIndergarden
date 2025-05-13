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
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check } from "lucide-react"
import type { Meal, MealIngredient, MealServing } from "@/types/meals"
import type { InventoryItem } from "@/types/inventory"
import type { User } from "@/types/users"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ChefLogo } from "@/components/chef-logo"

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

const initialUsers: User[] = [
  { id: 1, name: "John Smith", role: "admin" },
  { id: 2, name: "Maria Garcia", role: "cook" },
  { id: 3, name: "David Lee", role: "cook" },
  { id: 4, name: "Sarah Johnson", role: "manager" },
]

const initialServings: MealServing[] = [
  {
    id: 1,
    mealId: 1,
    mealName: "Osh (Plov)",
    portions: 10,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-11T09:30:00",
    userId: 2,
  },
  {
    id: 2,
    mealId: 2,
    mealName: "Lagman",
    portions: 15,
    servedBy: "David Lee",
    servedAt: "2025-05-11T12:15:00",
    userId: 3,
  },
  {
    id: 3,
    mealId: 3,
    mealName: "Somsa",
    portions: 8,
    servedBy: "Maria Garcia",
    servedAt: "2025-05-10T11:45:00",
    userId: 2,
  },
]

export default function ServeMealsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [meals] = useState<Meal[]>(initialMeals)
  const [users] = useState<User[]>(initialUsers)
  const [servings, setServings] = useState<MealServing[]>(initialServings)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [portions, setPortions] = useState<number>(1)
  const [selectedUserId, setSelectedUserId] = useState<number>(0)
  const [isServeDialogOpen, setIsServeDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [insufficientIngredients, setInsufficientIngredients] = useState<MealIngredient[]>([])
  const [servingSuccess, setServingSuccess] = useState(false)
  const { toast } = useToast()

  // Simulate WebSocket connection for real-time updates
  useEffect(() => {
    if (servingSuccess) {
      // In a real app, this would be sent via WebSocket
      const notificationMessage = `${users.find((u) => u.id === selectedUserId)?.name} served ${portions} portions of ${selectedMeal?.name} at ${new Date().toLocaleTimeString()}`

      toast({
        title: "Meal Served",
        description: notificationMessage,
      })
    }
  }, [servingSuccess, selectedMeal, portions, selectedUserId, users, toast])

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
    if (!selectedMeal || !portions || !selectedUserId) return

    const insufficient = checkIngredientsAvailability(selectedMeal, portions)

    if (insufficient.length > 0) {
      setInsufficientIngredients(insufficient)
      return
    }

    setIsConfirmDialogOpen(true)
  }

  const confirmServeMeal = () => {
    if (!selectedMeal || !portions || !selectedUserId) return

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
    const user = users.find((u) => u.id === selectedUserId)
    if (!user) return

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

    // Reset form
    setTimeout(() => {
      setServingSuccess(false)
      setSelectedMeal(null)
      setPortions(1)
      setSelectedUserId(0)
    }, 3000)
  }

  const startServeMeal = (meal: Meal) => {
    setSelectedMeal(meal)
    setPortions(1)
    setSelectedUserId(0)
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
                    disabled={possiblePortions === 0}
                  >
                    <ChefLogo className="mr-2 h-4 w-4" /> Serve Meal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <Card className="border-amber-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-700">Recent Meal Servings</CardTitle>
          <CardDescription>History of meals served recently.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead>Portions</TableHead>
                <TableHead>Served By</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servings
                .slice()
                .reverse()
                .map((serving) => (
                  <TableRow key={serving.id}>
                    <TableCell className="font-medium">{serving.mealName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700">
                        {serving.portions}
                      </Badge>
                    </TableCell>
                    <TableCell>{serving.servedBy}</TableCell>
                    <TableCell>{new Date(serving.servedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Serve Meal Dialog */}
      <Dialog open={isServeDialogOpen} onOpenChange={setIsServeDialogOpen}>
        <DialogContent className="border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Serve {selectedMeal?.name}</DialogTitle>
            <DialogDescription>Specify how many portions to serve and who is serving the meal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {insufficientIngredients.length > 0 && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Insufficient Ingredients</AlertTitle>
                <AlertDescription>
                  <p>You don't have enough of the following ingredients:</p>
                  <ul className="list-disc list-inside mt-2">
                    {insufficientIngredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name} - Need {ingredient.quantity * portions} {ingredient.unit}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="portions" className="text-right">
                Portions
              </Label>
              <Input
                id="portions"
                type="number"
                min="1"
                value={portions}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  setPortions(value > 0 ? value : 1)
                  setInsufficientIngredients([])
                }}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user-select" className="text-right">
                Served By
              </Label>
              <select
                id="user-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value={0}>Select staff member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Maximum Possible</Label>
              <div className="col-span-3">
                <Badge className="bg-amber-50 border-amber-300 text-amber-700 font-bold">
                  {selectedMeal ? calculatePossiblePortions(selectedMeal) : 0} portions
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServeDialogOpen(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleServeMeal}
              disabled={!portions || !selectedUserId || portions <= 0}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Serve Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Confirm Meal Serving</DialogTitle>
            <DialogDescription>
              Are you sure you want to serve {portions} portions of {selectedMeal?.name}? This will deduct the required
              ingredients from your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2 text-amber-700">Ingredients to be used:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMeal?.ingredients.map((ingredient, index) => {
                  const inventoryItem = inventory.find((item) => item.id === ingredient.ingredientId)
                  const required = ingredient.quantity * portions

                  return (
                    <TableRow key={index}>
                      <TableCell>{ingredient.name}</TableCell>
                      <TableCell>
                        {required} {ingredient.unit}
                      </TableCell>
                      <TableCell>
                        {inventoryItem?.quantity} {ingredient.unit}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button onClick={confirmServeMeal} className="bg-amber-500 hover:bg-amber-600 text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
