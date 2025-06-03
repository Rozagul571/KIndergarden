"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Plus, Trash, ShoppingCart, MinusCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import type { InventoryItem } from "@/types/inventory"
import { useWebSocket } from "@/contexts/websocket-context"

// Sample data for demonstration
const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Rice",
    quantity: 5000,
    unit: "kg",
    deliveryDate: "2025-05-10",
    threshold: 1000,
    status: "Available",
  },
  {
    id: 2,
    name: "Beef",
    quantity: 500,
    unit: "kg",
    deliveryDate: "2025-05-08",
    threshold: 2000,
    status: "Low",
  },
  {
    id: 3,
    name: "Carrots",
    quantity: 1500,
    unit: "kg",
    deliveryDate: "2025-05-05",
    threshold: 500,
    status: "Available",
  },
  {
    id: 4,
    name: "Onions",
    quantity: 300,
    unit: "kg",
    deliveryDate: "2025-05-11",
    threshold: 800,
    status: "Low",
  },
  {
    id: 5,
    name: "Flour",
    quantity: 10000,
    unit: "kg",
    deliveryDate: "2025-05-07",
    threshold: 2000,
    status: "Available",
  },
  {
    id: 6,
    name: "Potatoes",
    quantity: 0,
    unit: "kg",
    deliveryDate: "2025-05-09",
    threshold: 1000,
    status: "Out of Stock",
  },
  {
    id: 7,
    name: "Salt",
    quantity: 3500,
    unit: "kg",
    deliveryDate: "2025-05-10",
    threshold: 800,
    status: "Available",
  },
]

export default function InventoryPage() {
  const { toast } = useToast()
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    quantity: 1000,
    unit: "kg",
    deliveryDate: new Date().toISOString().split("T")[0],
    threshold: 200,
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(inventory)

  const { sendMessage, lastMessage, connected } = useWebSocket()

  useEffect(() => {
    if (lastMessage) {
      // Handle different types of messages
      if (lastMessage.type === "inventory_update") {
        // Update the inventory item in state
        setInventory((prev) =>
          prev.map((item) => (item.id === lastMessage.data.id ? { ...item, ...lastMessage.data } : item)),
        )

        // Show a notification
        toast({
          title: "Inventory Updated",
          description: `${lastMessage.data.name} quantity is now ${lastMessage.data.quantity} ${lastMessage.data.unit}`,
        })
      }
    }
  }, [lastMessage, toast])

  // Update filtered inventory when inventory or search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInventory(inventory)
    } else {
      const filtered = inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredInventory(filtered)
    }
  }, [inventory, searchTerm])

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity) return

    const newId = Math.max(0, ...inventory.map((item) => item.id)) + 1
    let itemStatus = "Available"

    if (Number(newItem.quantity) <= 0) {
      itemStatus = "Out of Stock"
    } else if (Number(newItem.quantity) <= Number(newItem.threshold)) {
      itemStatus = "Low"
    }

    const itemToAdd = {
      id: newId,
      name: newItem.name,
      quantity: Number(newItem.quantity),
      unit: newItem.unit || "kg",
      deliveryDate: newItem.deliveryDate || new Date().toISOString().split("T")[0],
      threshold: Number(newItem.threshold) || 0,
      status: itemStatus,
    }

    const updatedInventory = [...inventory, itemToAdd]
    setInventory(updatedInventory)

    // Send WebSocket message about the new item
    sendMessage({
      type: "inventory_created",
      message: `${itemToAdd.name} has been added to inventory`,
      data: itemToAdd,
    })

    toast({
      title: "Ingredient Added",
      description: `${itemToAdd.name} has been added to inventory.`,
    })

    setNewItem({
      name: "",
      quantity: 1000,
      unit: "kg",
      deliveryDate: new Date().toISOString().split("T")[0],
      threshold: 200,
      status: "Available",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditItem = () => {
    if (!editingItem) return

    // Update status based on quantity and threshold
    let updatedStatus = editingItem.status
    if (editingItem.quantity <= 0) {
      updatedStatus = "Out of Stock"
    } else if (editingItem.quantity <= editingItem.threshold) {
      updatedStatus = "Low"
    } else {
      updatedStatus = "Available"
    }

    const updatedItem = {
      ...editingItem,
      status: updatedStatus,
    }

    const updatedInventory = inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    setInventory(updatedInventory)

    // Send WebSocket message about the edited item
    sendMessage({
      type: "inventory_updated",
      message: `${updatedItem.name} has been updated`,
      data: updatedItem,
    })

    toast({
      title: "Ingredient Updated",
      description: `${updatedItem.name} has been updated.`,
    })

    setEditingItem(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteItem = (id: number) => {
    const itemToDelete = inventory.find((item) => item.id === id)
    if (!itemToDelete) return

    setInventory(inventory.filter((item) => item.id !== id))

    // Send WebSocket message about the deleted item
    sendMessage({
      type: "inventory_deleted",
      message: `${itemToDelete.name} has been removed from inventory`,
      data: { id, name: itemToDelete.name },
    })

    toast({
      title: "Ingredient Deleted",
      description: `${itemToDelete.name} has been removed from inventory.`,
    })
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

        const updatedItem = {
          ...item,
          quantity: newQuantity,
          deliveryDate: new Date().toISOString().split("T")[0],
          status: newStatus,
        }

        // Send WebSocket message about the delivery
        sendMessage({
          type: "inventory_delivery",
          message: `${deliveryItem.deliveryQuantity} ${item.unit} of ${item.name} has been added to inventory`,
          data: {
            id: updatedItem.id,
            name: updatedItem.name,
            previousQuantity: item.quantity,
            deliveryQuantity: deliveryItem.deliveryQuantity,
            newQuantity: newQuantity,
            unit: updatedItem.unit,
          },
        })

        return updatedItem
      }
      return item
    })

    setInventory(updatedInventory)

    const deliveredItem = inventory.find((item) => item.id === deliveryItem.id)

    toast({
      title: "Delivery Recorded",
      description: `${deliveryItem.deliveryQuantity} ${deliveredItem?.unit} of ${deliveredItem?.name} has been added to inventory.`,
    })

    setDeliveryItem({
      id: 0,
      name: "",
      deliveryQuantity: 0,
    })
    setIsDeliveryDialogOpen(false)
  }

  const handleCreateOrder = () => {
    // In a real app, this would create an order in the database
    const orderItem = inventory.find((item) => item.id === deliveryItem.id)
    if (!orderItem) return

    toast({
      title: "Order Created",
      description: `Order for ${deliveryItem.deliveryQuantity} ${orderItem.unit} of ${orderItem.name} has been created.`,
    })

    // Send WebSocket message about the order
    sendMessage({
      type: "order_created",
      message: `Order for ${orderItem.name} has been created`,
      data: {
        ingredientId: orderItem.id,
        ingredientName: orderItem.name,
        quantity: deliveryItem.deliveryQuantity,
        unit: orderItem.unit,
      },
    })

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
      deliveryQuantity: 500,
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

        const updatedItem = {
          ...item,
          quantity: newQuantity,
          status: newStatus,
        }

        // Send WebSocket message about the quantity update
        sendMessage({
          type: "inventory_updated",
          message: `${item.name} quantity updated to ${newQuantity} ${item.unit}`,
          data: updatedItem,
        })

        return updatedItem
      }
      return item
    })

    setInventory(updatedInventory)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Available
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            Low
          </Badge>
        )
      case "Out of Stock":
        return (
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-300">
            Out of Stock
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="destructive" className="bg-purple-50 text-purple-700 border-purple-300">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLowStockItems = () => {
    return inventory.filter((item) => item.status === "Low" || item.status === "Out of Stock")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 border-green-200"
      case "Low":
        return "bg-amber-100 border-amber-200"
      case "Out of Stock":
        return "bg-red-100 border-red-200"
      case "Expired":
        return "bg-purple-100 border-purple-200"
      default:
        return "bg-gray-100 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Stock Management
        </h1>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="border-amber-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-amber-700">Add New Item</DialogTitle>
                <DialogDescription>Enter the details of the new item to add to stock.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-amber-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3 border-amber-200 focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right text-amber-700">
                    Quantity
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-amber-300"
                        onClick={() =>
                          setNewItem({ ...newItem, quantity: Math.max(0, Number(newItem.quantity) - 100) })
                        }
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        className="flex-1 border-amber-200 focus:border-amber-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-amber-300"
                        onClick={() => setNewItem({ ...newItem, quantity: Number(newItem.quantity) + 100 })}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                        <SelectTrigger className="w-[100px] border-amber-200">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kilograms</SelectItem>
                          <SelectItem value="g">grams</SelectItem>
                          <SelectItem value="l">liters</SelectItem>
                          <SelectItem value="ml">milliliters</SelectItem>
                          <SelectItem value="pcs">pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Slider
                      value={[Number(newItem.quantity)]}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={(values) => setNewItem({ ...newItem, quantity: values[0] })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>0</span>
                      <span>2500</span>
                      <span>5000</span>
                      <span>7500</span>
                      <span>10000</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryDate" className="text-right text-amber-700">
                    Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={newItem.deliveryDate}
                    onChange={(e) => setNewItem({ ...newItem, deliveryDate: e.target.value })}
                    className="col-span-3 border-amber-200 focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="threshold" className="text-right text-amber-700">
                    Low Stock Threshold
                  </Label>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-amber-300"
                        onClick={() =>
                          setNewItem({ ...newItem, threshold: Math.max(0, Number(newItem.threshold) - 50) })
                        }
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                        id="threshold"
                        type="number"
                        value={newItem.threshold}
                        onChange={(e) => setNewItem({ ...newItem, threshold: Number(e.target.value) })}
                        className="flex-1 border-amber-200 focus:border-amber-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-amber-300"
                        onClick={() => setNewItem({ ...newItem, threshold: Number(newItem.threshold) + 50 })}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <Slider
                      value={[Number(newItem.threshold)]}
                      min={0}
                      max={2000}
                      step={50}
                      onValueChange={(values) => setNewItem({ ...newItem, threshold: values[0] })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-amber-700">
                      <span>0</span>
                      <span>500</span>
                      <span>1000</span>
                      <span>1500</span>
                      <span>2000</span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium">Preview Status:</span>
                    <span className="ml-2">
                      {getStatusBadge(
                        Number(newItem.quantity) <= 0
                          ? "Out of Stock"
                          : Number(newItem.quantity) <= Number(newItem.threshold)
                            ? "Low"
                            : "Available",
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    This is how the item will appear in your inventory based on the quantity and threshold values.
                  </p>
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
                  onClick={handleAddItem}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                >
                  Add Ingredient
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {getLowStockItems().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Low Stock Alert</AlertTitle>
            <AlertDescription className="text-red-600">
              {getLowStockItems().length} ingredients are running low or out of stock and need to be restocked.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-4"
      >
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-amber-200 focus:border-amber-500"
        />
      </motion.div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-amber-100 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            All Ingredients
          </TabsTrigger>
          <TabsTrigger
            value="low"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            Low Stock ({getLowStockItems().length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">All Ingredients</CardTitle>
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
                  <AnimatePresence>
                    {filteredInventory.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className={`border-b hover:bg-amber-50 transition-colors ${getStatusColor(item.status)}`}
                      >
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 border-amber-300"
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
                              className="h-6 w-6 border-amber-300"
                              onClick={() => updateItemQuantity(item.id, true)}
                            >
                              <PlusCircle className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.status === "Out of Stock"
                                  ? "bg-red-500"
                                  : item.status === "Low"
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (item.quantity / (item.threshold * 5)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>{item.deliveryDate}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startDelivery(item)}
                              className="border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                            >
                              Add Delivery
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startOrder(item)}
                              className="border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" /> Order
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(item)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="low">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">Low Stock Ingredients</CardTitle>
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
                  <AnimatePresence>
                    {getLowStockItems().map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`border-b hover:bg-amber-50 transition-colors ${getStatusColor(item.status)}`}
                      >
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.status === "Out of Stock" ? "bg-red-500" : "bg-amber-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (item.quantity / item.threshold) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.threshold} {item.unit}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startDelivery(item)}
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              Add Delivery
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startOrder(item)}
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" /> Order
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-amber-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Edit Ingredient</DialogTitle>
            <DialogDescription>Update the details of this ingredient.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right text-amber-700">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="col-span-3 border-amber-200 focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right text-amber-700">
                  Quantity
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-amber-300"
                      onClick={() =>
                        setEditingItem({ ...editingItem, quantity: Math.max(0, editingItem.quantity - 100) })
                      }
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      id="edit-quantity"
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                      className="flex-1 border-amber-200 focus:border-amber-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-amber-300"
                      onClick={() => setEditingItem({ ...editingItem, quantity: editingItem.quantity + 100 })}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Select
                      value={editingItem.unit}
                      onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}
                    >
                      <SelectTrigger className="w-[100px] border-amber-200">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kilograms</SelectItem>
                        <SelectItem value="g">grams</SelectItem>
                        <SelectItem value="ml">milliliters</SelectItem>
                        <SelectItem value="l">liters</SelectItem>
                        <SelectItem value="pcs">pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Slider
                    value={[editingItem.quantity]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={(values) => setEditingItem({ ...editingItem, quantity: values[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>0</span>
                    <span>2500</span>
                    <span>5000</span>
                    <span>7500</span>
                    <span>10000</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-threshold" className="text-right text-amber-700">
                  Low Stock Threshold
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-amber-300"
                      onClick={() =>
                        setEditingItem({ ...editingItem, threshold: Math.max(0, editingItem.threshold - 50) })
                      }
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Input
                      id="edit-threshold"
                      type="number"
                      value={editingItem.threshold}
                      onChange={(e) => setEditingItem({ ...editingItem, threshold: Number(e.target.value) })}
                      className="flex-1 border-amber-200 focus:border-amber-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-amber-300"
                      onClick={() => setEditingItem({ ...editingItem, threshold: editingItem.threshold + 50 })}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <Slider
                    value={[editingItem.threshold]}
                    min={0}
                    max={2000}
                    step={50}
                    onValueChange={(values) => setEditingItem({ ...editingItem, threshold: values[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>0</span>
                    <span>500</span>
                    <span>1000</span>
                    <span>1500</span>
                    <span>2000</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Preview Status:</span>
                  <span className="ml-2">
                    {getStatusBadge(
                      editingItem.quantity <= 0
                        ? "Out of Stock"
                        : editingItem.quantity <= editingItem.threshold
                          ? "Low"
                          : "Available",
                    )}
                  </span>
                </div>
                <p className="text-xs text-amber-700">
                  This is how the item will appear in your inventory based on the quantity and threshold values.\
                </
