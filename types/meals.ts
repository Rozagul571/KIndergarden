export interface MealIngredient {
  ingredientId: number
  name: string
  quantity: number
  unit: string
}

export interface Meal {
  id: number
  name: string
  description?: string
  ingredients: MealIngredient[]
  imageUrl?: string
}

export interface MealServing {
  id: number
  mealId: number
  mealName: string
  portions: number
  servedBy: string
  servedAt: string
  userId: number
}
