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
import { Edit, Plus, Trash, Check, AlertCircle, Package, Utensils } from "lucide-react"
import type { Meal, MealIngredient } from "@/types/meals"
import type { InventoryItem } from "@/types/inventory"
import Link from "next/link"
import { motion } from "framer-motion"
import { useWebSocket } from "@/contexts/websocket-context"
import { useToast } from "@/hooks/use-toast"

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

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
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

  const { toast } = useToast()
  const { sendMessage } = useWebSocket()

  useEffect(() => {
    if (sendMessage) {
      sendMessage(JSON.stringify({ type: "meals_page_viewed" }))
    }
  }, [sendMessage])

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

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.ingredients?.length) return

    const newId = Math.max(0, ...meals.map((meal) => meal.id)) + 1
    const mealToAdd: Meal = {
      id: newId,
      name: newMeal.name,
      description: newMeal.description || "",
      ingredients: newMeal.ingredients as MealIngredient[],
      imageUrl: newMeal.imageUrl || "/placeholder.svg?height=100&width=100",
    }

    setMeals([...meals, mealToAdd])
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
  }

  const handleAddIngredientToMeal = () => {
    if (!newIngredient.ingredientId || !newIngredient.quantity) return

    const inventoryItem = inventory.find((item) => item.id === newIngredient.ingredientId)
    if (!inventoryItem) return

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

    setNewIngredient({
      ingredientId: 0,
      name: "",
      quantity: 0,
      unit: "g",
    })
  }

  const handleUpdateMeal = () => {
    if (!selectedMeal) return

    const updatedMeals = meals.map((meal) => (meal.id === selectedMeal.id ? selectedMeal : meal))

    setMeals(updatedMeals)

    // Send detailed notification about meal update
    if (sendMessage) {
      sendMessage({
        type: "meal_updated_comprehensive",
        message: `Updated meal recipe: ${selectedMeal.name}`,
        data: {
          mealId: selectedMeal.id,
          mealName: selectedMeal.name,
          totalIngredients: selectedMeal.ingredients.length,
          ingredients: selectedMeal.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
          updatedAt: new Date().toISOString(),
        },
      })
    }

    setSelectedMeal(null)
    setIsEditDialogOpen(false)

    toast({
      title: "Meal Updated Successfully",
      description: `${selectedMeal.name} has been updated with ${selectedMeal.ingredients.length} ingredients.`,
    })
  }

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id))

    toast({
      title: "Meal Deleted",
      description: "The meal has been successfully deleted.",
    })
  }

  const handleRemoveIngredientFromMeal = (index: number) => {
    if (!newMeal.ingredients) return

    const updatedIngredients = [...newMeal.ingredients]
    updatedIngredients.splice(index, 1)
    setNewMeal({
      ...newMeal,
      ingredients: updatedIngredients,
    })
  }

  const handleRemoveIngredientFromSelectedMeal = (index: number) => {
    if (!selectedMeal || !selectedMeal.ingredients) return

    const updatedIngredients = [...selectedMeal.ingredients]
    updatedIngredients.splice(index, 1)
    setSelectedMeal({
      ...selectedMeal,
      ingredients: updatedIngredients,
    })
  }

  const startEditMeal = (meal: Meal) => {
    setSelectedMeal(meal)
    setIsEditDialogOpen(true)
  }

  const viewMealIngredients = (meal: Meal) => {
    setSelectedMeal(meal)
    setIsViewIngredientsDialogOpen(true)
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newIngredient.ingredientId}
                        onChange={(e) => setNewIngredient({ ...newIngredient, ingredientId: Number(e.target.value) })}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-700 flex items-center">
              <Utensils className="mr-2 h-6 w-6" />
              Edit Meal: {selectedMeal?.name}
            </DialogTitle>
            <DialogDescription>
              Update the meal recipe and manage ingredients with real-time tracking.
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-6 py-4">
              {/* Basic Meal Info */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold mb-3 text-amber-800 flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-meal-name" className="text-sm font-medium text-gray-700">
                      Meal Name
                    </Label>
                    <Input
                      id="edit-meal-name"
                      value={selectedMeal.name}
                      onChange={(e) => setSelectedMeal({ ...selectedMeal, name: e.target.value })}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-meal-description" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Input
                      id="edit-meal-description"
                      value={selectedMeal.description}
                      onChange={(e) => setSelectedMeal({ ...selectedMeal, description: e.target.value })}
                      className="mt-1 border-amber-300 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Current Ingredients Management */}
              <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-amber-800 flex items-center text-lg">
                  <Package className="mr-2 h-5 w-5" />
                  Current Ingredients
                  <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                    {selectedMeal.ingredients.length} items
                  </Badge>
                </h3>

                <div className="space-y-3">
                  {selectedMeal.ingredients.map((ingredient, index) => {
                    const inventoryItem = inventory.find((item) => item.id === ingredient.ingredientId)
                    const maxAvailable = inventoryItem?.quantity || 0

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-amber-100 p-2 rounded-full">
                              <Package className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                              <p className="text-sm text-gray-500">
                                Available: {maxAvailable} {ingredient.unit}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveIngredientFromSelectedMeal(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Quantity Required ({ingredient.unit})
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max={maxAvailable}
                                value={ingredient.quantity}
                                onChange={(e) => {
                                  const newQuantity = Number(e.target.value)
                                  const oldQuantity = ingredient.quantity

                                  // Update the ingredient quantity
                                  const updatedIngredients = [...selectedMeal.ingredients]
                                  updatedIngredients[index] = { ...ingredient, quantity: newQuantity }
                                  setSelectedMeal({ ...selectedMeal, ingredients: updatedIngredients })

                                  // Send notification about the change
                                  if (sendMessage && newQuantity !== oldQuantity) {
                                    const changeAmount = newQuantity - oldQuantity
                                    const changeType = changeAmount > 0 ? "increased" : "decreased"

                                    sendMessage({
                                      type: "ingredient_quantity_updated",
                                      message: `Ingredient quantity ${changeType} for ${ingredient.name}`,
                                      data: {
                                        ingredientName: ingredient.name,
                                        mealName: selectedMeal.name,
                                        oldQuantity: oldQuantity,
                                        newQuantity: newQuantity,
                                        changeAmount: Math.abs(changeAmount),
                                        changeType: changeType,
                                        unit: ingredient.unit,
                                        availableStock: maxAvailable,
                                      },
                                    })
                                  }
                                }}
                                className="border-amber-300 focus:border-amber-500"
                              />
                              <span className="text-sm text-gray-500 min-w-[40px]">{ingredient.unit}</span>
                            </div>
                            {ingredient.quantity > maxAvailable && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Exceeds available stock by {ingredient.quantity - maxAvailable} {ingredient.unit}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Stock Status</div>
                            <Badge
                              variant={ingredient.quantity <= maxAvailable ? "outline" : "destructive"}
                              className={
                                ingredient.quantity <= maxAvailable ? "bg-green-50 text-green-700 border-green-300" : ""
                              }
                            >
                              {ingredient.quantity <= maxAvailable ? "✓ Available" : "⚠ Insufficient"}
                            </Badge>
                          </div>
                        </div>

                        {/* Quick adjustment buttons */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newQuantity = Math.max(0, ingredient.quantity - 10)
                                const updatedIngredients = [...selectedMeal.ingredients]
                                updatedIngredients[index] = { ...ingredient, quantity: newQuantity }
                                setSelectedMeal({ ...selectedMeal, ingredients: updatedIngredients })

                                if (sendMessage) {
                                  sendMessage({
                                    type: "ingredient_quantity_updated",
                                    message: `Decreased ${ingredient.name} by 10 ${ingredient.unit}`,
                                    data: {
                                      ingredientName: ingredient.name,
                                      mealName: selectedMeal.name,
                                      oldQuantity: ingredient.quantity,
                                      newQuantity: newQuantity,
                                      changeAmount: 10,
                                      changeType: "decreased",
                                      unit: ingredient.unit,
                                    },
                                  })
                                }
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              -10
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newQuantity = Math.min(maxAvailable, ingredient.quantity + 10)
                                const updatedIngredients = [...selectedMeal.ingredients]
                                updatedIngredients[index] = { ...ingredient, quantity: newQuantity }
                                setSelectedMeal({ ...selectedMeal, ingredients: updatedIngredients })

                                if (sendMessage) {
                                  sendMessage({
                                    type: "ingredient_quantity_updated",
                                    message: `Increased ${ingredient.name} by 10 ${ingredient.unit}`,
                                    data: {
                                      ingredientName: ingredient.name,
                                      mealName: selectedMeal.name,
                                      oldQuantity: ingredient.quantity,
                                      newQuantity: newQuantity,
                                      changeAmount: 10,
                                      changeType: "increased",
                                      unit: ingredient.unit,
                                    },
                                  })
                                }
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              +10
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Add New Ingredient Section */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4 text-blue-800 flex items-center text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Ingredient
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-ingredient-select" className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Ingredient
                    </Label>
                    <select
                      id="edit-ingredient-select"
                      className="flex h-10 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={newIngredient.ingredientId}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value)
                        const selectedItem = inventory.find((item) => item.id === selectedId)
                        setNewIngredient({
                          ...newIngredient,
                          ingredientId: selectedId,
                          unit: selectedItem?.unit || "g",
                        })
                      }}
                    >
                      <option value={0}>Choose an ingredient...</option>
                      {inventory
                        .filter((item) => !selectedMeal.ingredients.some((ing) => ing.ingredientId === item.id))
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit} available)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="edit-ingredient-quantity" className="text-sm font-medium text-gray-700 mb-2 block">
                      Quantity
                    </Label>
                    <Input
                      id="edit-ingredient-quantity"
                      type="number"
                      min="0"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
                      className="border-blue-300 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (!newIngredient.ingredientId || !newIngredient.quantity) return

                      const inventoryItem = inventory.find((item) => item.id === newIngredient.ingredientId)
                      if (!inventoryItem) return

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

                      // Send notification about adding new ingredient
                      if (sendMessage) {
                        sendMessage({
                          type: "ingredient_added_to_meal",
                          message: `Added ${inventoryItem.name} to ${selectedMeal.name}`,
                          data: {
                            ingredientName: inventoryItem.name,
                            mealName: selectedMeal.name,
                            quantity: newIngredient.quantity,
                            unit: inventoryItem.unit,
                            availableStock: inventoryItem.quantity,
                          },
                        })
                      }

                      setNewIngredient({
                        ingredientId: 0,
                        name: "",
                        quantity: 0,
                        unit: "g",
                      })
                    }}
                    disabled={!newIngredient.ingredientId || !newIngredient.quantity}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="bg-gray-50 px-6 py-4 -mx-6 -mb-6 mt-6">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">Total ingredients: {selectedMeal?.ingredients.length || 0}</div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateMeal} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
