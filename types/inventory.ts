export interface InventoryItem {
  id: number
  name: string
  quantity: number
  unit: string
  deliveryDate: string
  threshold: number
  status: "Available" | "Low" | "Out of Stock" | "Expired"
}
