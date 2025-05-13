export interface Order {
  id: number
  ingredientId: number
  ingredientName: string
  quantity: number
  unit: string
  status: "Pending" | "Approved" | "Delivered" | "Rejected"
  orderDate: string
  deliveryDate: string | null
  createdBy: number
  createdByName: string
}
