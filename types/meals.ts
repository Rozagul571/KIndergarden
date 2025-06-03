export interface MealIngredient {
  ingredientId: number
  name: string
  quantity: number
  unit: string
}

export interface Meal {
  id: number
  name: string
  description: string
  ingredients: MealIngredient[]
  imageUrl?: string
}

export interface MealServing {
  id: number
  mealId: number
  mealName: string
  portions: number
  servingDate: string
  userId: number
  userName: string
}
