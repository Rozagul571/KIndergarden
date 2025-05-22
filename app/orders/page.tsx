"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Check,
  X,
  Package,
  Calendar,
  AlertCircle,
  Clock,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useWebSocket } from "@/contexts/websocket-context"
import { useAuth } from "@/hooks/use-auth"
import type { InventoryItem } from "@/types/inventory"
import type { Order } from "@/types/orders"
import type { User } from "@/types/users"

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
]

const initialUsers: User[] = [
  { id: 1, name: "John Smith", role: "admin" },
  { id: 2, name: "Maria Garcia", role: "cook" },
  { id: 3, name: "David Lee", role: "cook" },
  { id: 4, name: "Sarah Johnson", role: "manager" },
  { id: 5, name: "Cook", role: "cook" },
]

const initialOrders: Order[] = [
  {
    id: 1,
    ingredientId: 1,
    ingredientName: "Beef",
    quantity: 10000,
    unit: "g",
    status: "Pending",
    orderDate: "2025-05-10",
    deliveryDate: null,
    createdBy: 4,
    createdByName: "Sarah Johnson",
  },
  {
    id: 2,
    ingredientId: 5,
    ingredientName: "Rice",
    quantity: 20000,
    unit: "g",
    status: "Delivered",
    orderDate: "2025-05-08",
    deliveryDate: "2025-05-09",
    createdBy: 4,
    createdByName: "Sarah Johnson",
  },
  {
    id: 3,
    ingredientId: 4,
    ingredientName: "Chicken",
    quantity: 5000,
    unit: "g",
    status: "Approved",
    orderDate: "2025-05-09",
    deliveryDate: null,
    createdBy: 4,
    createdByName: "Sarah Johnson",
  },
  {
    id: 4,
    ingredientId: 2,
    ingredientName: "Potato",
    quantity: 15000,
    unit: "g",
    status: "Rejected",
    orderDate: "2025-05-07",
    deliveryDate: null,
    createdBy: 4,
    createdByName: "Sarah Johnson",
  },
  {
    id: 5,
    ingredientId: 1,
    ingredientName: "Beef",
    quantity: 6000,
    unit: "g",
    status: "Pending",
    orderDate: "2025-05-17",
    deliveryDate: null,
    createdBy: 4,
    createdByName: "Sarah Johnson",
  },
]

export default function OrdersPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { sendMessage } = useWebSocket()
  const [inventory] = useState<InventoryItem[]>(initialInventory)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [orderSorting, setOrderSorting] = useState<"newest" | "oldest">("newest")
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [isMarkDeliveredDialogOpen, setIsMarkDeliveredDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    ingredientId: 0,
    quantity: 1000,
    unit: "g",
    orderDate: new Date().toISOString().split("T")[0],
    status: "Pending",
    createdBy: user?.id || 4, // Default to Sarah Johnson if no user
    createdByName: user?.name || "Sarah Johnson",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0])
  const [deliveryNotes, setDeliveryNotes] = useState("")

  // Update filtered orders when orders or search term changes
  useEffect(() => {
    let filtered = [...orders]

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort orders
    filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime()
      const dateB = new Date(b.orderDate).getTime()
      return orderSorting === "newest" ? dateB - dateA : dateA - dateB
    })

    setFilteredOrders(filtered)
  }, [orders, searchTerm, orderSorting])

  // Set isInitialLoad to false after initial render
  useEffect(() => {
    if (isInitialLoad) {
      setTimeout(() => {
        setIsInitialLoad(false)
      }, 500)
    }
  }, [isInitialLoad])

  // Update newOrder when user changes
  useEffect(() => {
    if (user) {
      setNewOrder((prev) => ({
        ...prev,
        createdBy: user.id,
        createdByName: user.name,
      }))
    }
  }, [user])

  const handleCreateOrder = () => {
    if (!newOrder.ingredientId || !newOrder.quantity) return

    const ingredient = inventory.find((item) => item.id === newOrder.ingredientId)
    if (!ingredient) return

    const newId = Math.max(0, ...orders.map((order) => order.id)) + 1
    const orderToAdd: Order = {
      id: newId,
      ingredientId: newOrder.ingredientId,
      ingredientName: ingredient.name,
      quantity: Number(newOrder.quantity),
      unit: ingredient.unit,
      status: "Pending",
      orderDate: newOrder.orderDate || new Date().toISOString().split("T")[0],
      deliveryDate: null,
      createdBy: user?.id || 4, // Default to Sarah Johnson if no user
      createdByName: user?.name || "Sarah Johnson",
    }

    // Add new order to the beginning of the array
    setOrders([orderToAdd, ...orders])

    // Send WebSocket message about the new order
    sendMessage({
      type: "order_created",
      message: `New order for ${orderToAdd.quantity} ${orderToAdd.unit} of ${orderToAdd.ingredientName} created by ${orderToAdd.createdByName}`,
      data: orderToAdd,
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      },
    })

    toast({
      title: "Order Created",
      description: `Order for ${orderToAdd.quantity} ${orderToAdd.unit} of ${orderToAdd.ingredientName} has been created.`,
    })

    setNewOrder({
      ingredientId: 0,
      quantity: 1000,
      unit: "g",
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      createdBy: user?.id || 4,
      createdByName: user?.name || "Sarah Johnson",
    })
    setIsCreateOrderDialogOpen(false)
  }

  const handleUpdateOrderStatus = (id: number, status: "Approved" | "Rejected" | "Delivered") => {
    const orderToUpdate = orders.find((order) => order.id === id)
    if (!orderToUpdate) return

    const updatedOrders = orders.map((order) => {
      if (order.id === id) {
        const updatedOrder = {
          ...order,
          status,
          deliveryDate: status === "Delivered" ? deliveryDate : order.deliveryDate,
        }
        return updatedOrder
      }
      return order
    })

    setOrders(updatedOrders)

    // Send WebSocket message about the status update
    sendMessage({
      type: "order_status_update",
      message: `Order #${id} for ${orderToUpdate.ingredientName} has been ${status.toLowerCase()} by ${user?.name || "Sarah Johnson"}`,
      data: {
        id,
        ingredientName: orderToUpdate.ingredientName,
        status,
        deliveryDate: status === "Delivered" ? deliveryDate : null,
        updatedBy: user?.name || "Sarah Johnson",
        updatedAt: new Date().toISOString(),
      },
      user: {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      },
      timestamp: new Date().toISOString(),
    })

    toast({
      title: `Order ${status}`,
      description: `Order #${id} for ${orderToUpdate.ingredientName} has been ${status.toLowerCase()}.`,
    })
  }

  const handleMarkDelivered = () => {
    if (!selectedOrder) return

    handleUpdateOrderStatus(selectedOrder.id, "Delivered")
    setSelectedOrder(null)
    setIsMarkDeliveredDialogOpen(false)
    setDeliveryDate(new Date().toISOString().split("T")[0])
    setDeliveryNotes("")
  }

  const startMarkDelivered = (order: Order) => {
    setSelectedOrder(order)
    setIsMarkDeliveredDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "Approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Check className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "Delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <Package className="w-3 h-3 mr-1" /> Delivered
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-l-4 border-l-amber-500 hover:bg-amber-50"
      case "Approved":
        return "border-l-4 border-l-blue-500 hover:bg-blue-50"
      case "Delivered":
        return "border-l-4 border-l-green-500 hover:bg-green-50"
      case "Rejected":
        return "border-l-4 border-l-red-500 hover:bg-red-50"
      default:
        return ""
    }
  }

  const getPendingOrders = () => {
    return orders.filter((order) => order.status === "Pending")
  }

  const getApprovedOrders = () => {
    return orders.filter((order) => order.status === "Approved")
  }

  const getDeliveredOrders = () => {
    return orders.filter((order) => order.status === "Delivered")
  }

  const getRejectedOrders = () => {
    return orders.filter((order) => order.status === "Rejected")
  }

  // Function to export orders as CSV
  const exportToCSV = () => {
    try {
      const headers = ["ID", "Ingredient", "Quantity", "Unit", "Status", "Order Date", "Delivery Date", "Created By"]
      const csvRows = [
        headers.join(","),
        ...filteredOrders.map((order) => {
          return [
            order.id,
            order.ingredientName,
            order.quantity,
            order.unit,
            order.status,
            order.orderDate,
            order.deliveryDate || "",
            order.createdByName,
          ].join(",")
        }),
      ]

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `${filteredOrders.length} orders exported to CSV`,
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the orders to CSV",
        variant: "destructive",
      })
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
          Orders Management
        </h1>
        <div className="flex space-x-2">
          <Button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Export to CSV
          </Button>
          <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="border-amber-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-amber-700">Create New Order</DialogTitle>
                <DialogDescription>Order ingredients for the kitchen inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ingredient-select" className="text-right text-amber-700">
                    Ingredient
                  </Label>
                  <Select
                    value={newOrder.ingredientId?.toString() || ""}
                    onValueChange={(value) => setNewOrder({ ...newOrder, ingredientId: Number(value) })}
                  >
                    <SelectTrigger className="col-span-3 border-amber-200">
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.quantity} {item.unit} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          setNewOrder({ ...newOrder, quantity: Math.max(0, Number(newOrder.quantity) - 100) })
                        }
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                        className="flex-1 border-amber-200 focus:border-amber-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-amber-300"
                        onClick={() => setNewOrder({ ...newOrder, quantity: Number(newOrder.quantity) + 100 })}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Select
                        value={newOrder.unit || "g"}
                        onValueChange={(value) => setNewOrder({ ...newOrder, unit: value })}
                      >
                        <SelectTrigger className="w-[100px] border-amber-200">
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
                    <Slider
                      value={[Number(newOrder.quantity)]}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={(values) => setNewOrder({ ...newOrder, quantity: values[0] })}
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
                  <Label htmlFor="order-date" className="text-right text-amber-700">
                    Order Date
                  </Label>
                  <Input
                    id="order-date"
                    type="date"
                    value={newOrder.orderDate}
                    onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                    className="col-span-3 border-amber-200 focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right text-amber-700">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Any special instructions"
                    className="col-span-3 border-amber-200 focus:border-amber-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOrderDialogOpen(false)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={!newOrder.ingredientId || !newOrder.quantity}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Create Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        <Input
          placeholder="Search orders by ID or ingredient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-amber-200 focus:border-amber-500"
        />
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            <Select value={orderSorting} onValueChange={(value: "newest" | "oldest") => setOrderSorting(value)}>
              <SelectTrigger className="border-amber-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => setSearchTerm("")}
          >
            Clear Filters
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-amber-200 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {getPendingOrders().length} Orders
                </Badge>
              </div>
              <h3 className="text-xl font-bold mt-4 text-amber-700">Pending</h3>
              <Progress
                value={(getPendingOrders().length / orders.length) * 100}
                className="h-2 mt-2 bg-amber-100"
                indicatorColor="bg-amber-500"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-blue-200 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <Check className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {getApprovedOrders().length} Orders
                </Badge>
              </div>
              <h3 className="text-xl font-bold mt-4 text-blue-700">Approved</h3>
              <Progress
                value={(getApprovedOrders().length / orders.length) * 100}
                className="h-2 mt-2 bg-blue-100"
                indicatorColor="bg-blue-500"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-green-200 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {getDeliveredOrders().length} Orders
                </Badge>
              </div>
              <h3 className="text-xl font-bold mt-4 text-green-700">Delivered</h3>
              <Progress
                value={(getDeliveredOrders().length / orders.length) * 100}
                className="h-2 mt-2 bg-green-100"
                indicatorColor="bg-green-500"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-red-200 shadow-md hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="p-2 rounded-full bg-red-100">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {getRejectedOrders().length} Orders
                </Badge>
              </div>
              <h3 className="text-xl font-bold mt-4 text-red-700">Rejected</h3>
              <Progress
                value={(getRejectedOrders().length / orders.length) * 100}
                className="h-2 mt-2 bg-red-100"
                indicatorColor="bg-red-500"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-amber-100 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            Pending ({getPendingOrders().length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            Approved ({getApprovedOrders().length})
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            Delivered ({getDeliveredOrders().length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300"
          >
            Rejected ({getRejectedOrders().length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">All Orders</CardTitle>
              <CardDescription>View and manage all ingredient orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={isInitialLoad ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-lg border ${getStatusColor(order.status)} transition-all duration-300`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-500 text-sm">#{order.id}</span>
                              <h3 className="font-bold text-lg">{order.ingredientName}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                <span>
                                  {order.quantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ordered: {order.orderDate}</span>
                              </div>
                              {order.deliveryDate && (
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  <span>Delivered: {order.deliveryDate}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">By: {order.createdByName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            {order.status === "Pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                  <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, "Rejected")}
                                  className="border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {order.status === "Approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startMarkDelivered(order)}
                                className="border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                              >
                                <Package className="h-4 w-4 mr-1" /> Mark Delivered
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <AlertCircle className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? "Try a different search term or clear filters"
                        : "Create your first order to get started"}
                    </p>
                    <Button
                      onClick={() => setIsCreateOrderDialogOpen(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Order
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">Pending Orders</CardTitle>
              <CardDescription>Orders waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              {getPendingOrders().length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {getPendingOrders().map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg border border-l-4 border-l-amber-500 hover:bg-amber-50 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-500 text-sm">#{order.id}</span>
                              <h3 className="font-bold text-lg">{order.ingredientName}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                <span>
                                  {order.quantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ordered: {order.orderDate}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">By: {order.createdByName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "Rejected")}
                              className="border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Clock className="mx-auto h-12 w-12 text-amber-400 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No pending orders</h3>
                    <p className="text-gray-500 mb-4">There are currently no orders waiting for approval</p>
                    <Button
                      onClick={() => setIsCreateOrderDialogOpen(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Order
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">Approved Orders</CardTitle>
              <CardDescription>Orders that have been approved and are awaiting delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              {getApprovedOrders().length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {getApprovedOrders().map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg border border-l-4 border-l-blue-500 hover:bg-blue-50 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-500 text-sm">#{order.id}</span>
                              <h3 className="font-bold text-lg">{order.ingredientName}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                <span>
                                  {order.quantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ordered: {order.orderDate}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">By: {order.createdByName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startMarkDelivered(order)}
                              className="border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <Package className="h-4 w-4 mr-1" /> Mark Delivered
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Check className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No approved orders</h3>
                    <p className="text-gray-500 mb-4">There are currently no approved orders awaiting delivery</p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivered">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">Delivered Orders</CardTitle>
              <CardDescription>Orders that have been delivered and added to inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              {getDeliveredOrders().length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {getDeliveredOrders().map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg border border-l-4 border-l-green-500 hover:bg-green-50 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-500 text-sm">#{order.id}</span>
                              <h3 className="font-bold text-lg">{order.ingredientName}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                <span>
                                  {order.quantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ordered: {order.orderDate}</span>
                              </div>
                              {order.deliveryDate && (
                                <div className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  <span>Delivered: {order.deliveryDate}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">By: {order.createdByName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Package className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No delivered orders</h3>
                    <p className="text-gray-500 mb-4">There are currently no delivered orders in the system</p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-700">Rejected Orders</CardTitle>
              <CardDescription>Orders that have been rejected.</CardDescription>
            </CardHeader>
            <CardContent>
              {getRejectedOrders().length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {getRejectedOrders().map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg border border-l-4 border-l-red-500 hover:bg-red-50 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-500 text-sm">#{order.id}</span>
                              <h3 className="font-bold text-lg">{order.ingredientName}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="h-4 w-4" />
                                <span>
                                  {order.quantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ordered: {order.orderDate}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">By: {order.createdByName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <X className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No rejected orders</h3>
                    <p className="text-gray-500 mb-4">There are currently no rejected orders in the system</p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mark Delivered Dialog */}
      <Dialog open={isMarkDeliveredDialogOpen} onOpenChange={setIsMarkDeliveredDialogOpen}>
        <DialogContent className="border-amber-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-amber-700">Mark Order as Delivered</DialogTitle>
            <DialogDescription>
              Confirm delivery of {selectedOrder?.quantity} {selectedOrder?.unit} of {selectedOrder?.ingredientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-date" className="text-right text-amber-700">
                Delivery Date
              </Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="col-span-3 border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-notes" className="text-right text-amber-700">
                Notes
              </Label>
              <Input
                id="delivery-notes"
                placeholder="Any notes about the delivery"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="col-span-3 border-amber-200 focus:border-amber-500"
              />
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-700">Delivery Summary</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                This will mark the order as delivered and add {selectedOrder?.quantity} {selectedOrder?.unit} of{" "}
                {selectedOrder?.ingredientName} to your inventory.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMarkDeliveredDialogOpen(false)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button onClick={handleMarkDelivered} className="bg-green-600 hover:bg-green-700 text-white">
              <Calendar className="mr-2 h-4 w-4" /> Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
