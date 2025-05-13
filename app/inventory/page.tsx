"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Plus, Trash, ShoppingCart, MinusCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { InventoryItem } from "@/types/inventory"

// Sample data for demonstration
const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Beef",
    quantity: 5000,
    unit: "g",
    deliveryDate: "2025-05-10",
    threshold: 1000,
    status: "Available",
  },
  {
    id: 2,
    name: "Potato",
    quantity: 500,
    unit: "g",
    deliveryDate: "2025-05-08",
    threshold: 2000,
    status: "Low",
  },
  {
    id: 3,
    name: "Salt",
    quantity: 1500,
    unit: "g",
    deliveryDate: "2025-05-05",
    threshold: 500,
    status: "Available",
  },
  {
    id: 4,
    name: "Chicken",
    quantity: 3000,
    unit: "g",
    deliveryDate: "2025-05-11",
    threshold: 800,
    status: "Available",
  },
  {
    id: 5,
    name: "Rice",
    quantity: 10000,
    unit: "g",
    deliveryDate: "2025-05-07",
    threshold: 2000,
    status: "Available",
  },
  {
    id: 6,
    name: "Carrot",
    quantity: 0,
    unit: "g",
    deliveryDate: "2025-05-09",
    threshold: 1000,
    status: "Out of Stock",
  },
  {
    id: 7,
    name: "Onion",
    quantity: 3500,
    unit: "g",
    deliveryDate: "2025-05-10",
    threshold: 800,
    status: "Available",
  },
  {
    id: 8,
    name: "Tomato",
    quantity: 2500,
    unit: "g",
    deliveryDate: "2025-05-11",
    threshold: 600,
    status: "Available",
  },
  {
    id: 9,
    name: "Flour",
    quantity: 7000,
    unit: "g",
    deliveryDate: "2025-05-06",
    threshold: 1500,
    status: "Available",
  },
  {
    id: 10,
    name: "Water",
    quantity: 50000,
    unit: "ml",
    deliveryDate: "2025-05-08",
    threshold: 10000,
    status: "Available",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    quantity: 0,
    unit: "g",
    deliveryDate: new Date().toISOString().split("T")[0],
    threshold: 0,
    status: "Available",
  })
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deliveryItem, setDeliveryItem] = useState<Partial<InventoryItem & { deliveryQuantity: number }>>({
    id: 0,
    name: "",
    deliveryQuantity: 0,
  })
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity) return

    const newId = Math.max(0, ...inventory.map((item) => item.id)) + 1
    const itemToAdd = {
      id: newId,
      name: newItem.name,
      quantity: Number(newItem.quantity),
      unit: newItem.unit || "g",
      deliveryDate: newItem.deliveryDate || new Date().toISOString().split("T")[0],
      threshold: Number(newItem.threshold) || 0,
      status: newItem.status || "Available",
    }

    setInventory([...inventory, itemToAdd])
    setNewItem({
      name: "",
      quantity: 0,
      unit: "g",
      deliveryDate: new Date().toISOString().split("T")[0],
      threshold: 0,
      status: "Available",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditItem = () => {
    if (!editingItem) return

    const updatedInventory = inventory.map((item) => (item.id === editingItem.id ? editingItem : item))

    setInventory(updatedInventory)
    setEditingItem(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteItem = (id: number) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const handleDelivery = () => {
    if (!deliveryItem.id || !deliveryItem.deliveryQuantity) return

    const updatedInventory = inventory.map((item) => {
      if (item.id === deliveryItem.id) {
        const newQuantity = item.quantity + Number(deliveryItem.deliveryQuantity)
        let newStatus = item.status

        if (newQuantity === 0) {
          newStatus = "Out of Stock"
        } else if (newQuantity <= item.threshold) {
          newStatus = "Low"
        } else {
          newStatus = "Available"
        }

        return {
          ...item,
          quantity: newQuantity,
          deliveryDate: new Date().toISOString().split("T")[0],
          status: newStatus,
        }
      }
      return item
    })

    setInventory(updatedInventory)
    setDeliveryItem({
      id: 0,
      name: "",
      deliveryQuantity: 0,
    })
    setIsDeliveryDialogOpen(false)
  }

  const handleCreateOrder = () => {
    // In a real app, this would create an order in the database
    alert(`Order created for ${deliveryItem.name}`)
    setIsOrderDialogOpen(false)
  }

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const startDelivery = (item: InventoryItem) => {
    setDeliveryItem({
      id: item.id,
      name: item.name,
      deliveryQuantity: 0,
    })
    setIsDeliveryDialogOpen(true)
  }

  const startOrder = (item: InventoryItem) => {
    setDeliveryItem({
      id: item.id,
      name: item.name,
      deliveryQuantity: 1000,
    })
    setIsOrderDialogOpen(true)
  }

  const updateItemQuantity = (id: number, increment: boolean) => {
    const updatedInventory = inventory.map((item) => {
      if (item.id === id) {
        const delta = increment ? 100 : -100
        const newQuantity = Math.max(0, item.quantity + delta)
        let newStatus = item.status

        if (newQuantity === 0) {
          newStatus = "Out of Stock"
        } else if (newQuantity <= item.threshold) {
          newStatus = "Low"
        } else {
          newStatus = "Available"
        }

        return {
          ...item,
          quantity: newQuantity,
          status: newStatus,
        }
      }
      return item
    })

    setInventory(updatedInventory)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge variant="outline">Available</Badge>
      case "Low":
        return <Badge variant="warning">Low</Badge>
      case "Out of Stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLowStockItems = () => {
    return inventory.filter((item) => item.status === "Low" || item.status === "Out of Stock")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Ingredient</DialogTitle>
                <DialogDescription>Enter the details of the new ingredient to add to inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grams</SelectItem>
                        <SelectItem value="kg">kilograms</SelectItem>
                        <SelectItem value="ml">milliliters</SelectItem>
                        <SelectItem value="l">liters</SelectItem>
                        <SelectItem value="pcs">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryDate" className="text-right">
                    Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={newItem.deliveryDate}
                    onChange={(e) => setNewItem({ ...newItem, deliveryDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right">
                    Low Stock Threshold
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({ ...newItem, threshold: Number(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select value={newItem.status} onValueChange={(value) => setNewItem({ ...newItem, status: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Ingredient</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {getLowStockItems().length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {getLowStockItems().length} ingredients are running low or out of stock and need to be restocked.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Ingredients</TabsTrigger>
          <TabsTrigger value="low">Low Stock ({getLowStockItems().length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Ingredients</CardTitle>
              <CardDescription>Manage your kitchen inventory and track ingredient quantities.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantity(item.id, false)}
                            disabled={item.quantity === 0}
                          >
                            <MinusCircle className="h-3 w-3" />
                          </Button>
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantity(item.id, true)}
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{item.deliveryDate}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => startDelivery(item)}>
                            Add Delivery
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => startOrder(item)}>
                            <ShoppingCart className="h-4 w-4 mr-1" /> Order
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Ingredients</CardTitle>
              <CardDescription>These ingredients are running low and need to be restocked.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getLowStockItems().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.threshold} {item.unit}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => startDelivery(item)}>
                            Add Delivery
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => startOrder(item)}>
                            <ShoppingCart className="h-4 w-4 mr-1" /> Order
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>Update the details of this ingredient.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  Quantity
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <Select
                    value={editingItem.unit}
                    onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">grams</SelectItem>
                      <SelectItem value="kg">kilograms</SelectItem>
                      <SelectItem value="ml">milliliters</SelectItem>
                      <SelectItem value="l">liters</SelectItem>
                      <SelectItem value="pcs">pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-threshold" className="text-right">
                  Low Stock Threshold
                </Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editingItem.threshold}
                  onChange={(e) => setEditingItem({ ...editingItem, threshold: Number(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingItem.status}
                  onValueChange={(value) => setEditingItem({ ...editingItem, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Delivery</DialogTitle>
            <DialogDescription>Record a new delivery for {deliveryItem.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="delivery-quantity"
                  type="number"
                  value={deliveryItem.deliveryQuantity}
                  onChange={(e) => setDeliveryItem({ ...deliveryItem, deliveryQuantity: Number(e.target.value) })}
                  className="flex-1"
                />
                <Select defaultValue="g">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">grams</SelectItem>
                    <SelectItem value="kg">kilograms</SelectItem>
                    <SelectItem value="ml">milliliters</SelectItem>
                    <SelectItem value="l">liters</SelectItem>
                    <SelectItem value="pcs">pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-date" className="text-right">
                Delivery Date
              </Label>
              <Input
                id="delivery-date"
                type="date"
                value={new Date().toISOString().split("T")[0]}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelivery}>Record Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
            <DialogDescription>Create a new order for {deliveryItem.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-quantity" className="text-right">
                Quantity
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="order-quantity"
                  type="number"
                  value={deliveryItem.deliveryQuantity}
                  onChange={(e) => setDeliveryItem({ ...deliveryItem, deliveryQuantity: Number(e.target.value) })}
                  className="flex-1"
                />
                <Select defaultValue="g">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">grams</SelectItem>
                    <SelectItem value="kg">kilograms</SelectItem>
                    <SelectItem value="ml">milliliters</SelectItem>
                    <SelectItem value="l">liters</SelectItem>
                    <SelectItem value="pcs">pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-date" className="text-right">
                Order Date
              </Label>
              <Input
                id="order-date"
                type="date"
                value={new Date().toISOString().split("T")[0]}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-notes" className="text-right">
                Notes
              </Label>
              <Input id="order-notes" placeholder="Any special instructions" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
