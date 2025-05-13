"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Check, X, Package, Calendar } from "lucide-react"
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
]

export default function OrdersPage() {
  const [inventory] = useState<InventoryItem[]>(initialInventory)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [isMarkDeliveredDialogOpen, setIsMarkDeliveredDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    ingredientId: 0,
    quantity: 0,
    unit: "g",
    orderDate: new Date().toISOString().split("T")[0],
    status: "Pending",
    createdBy: 4, // Assuming current user is Sarah Johnson (Manager)
    createdByName: "Sarah Johnson",
  })

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
      createdBy: 4, // Assuming current user is Sarah Johnson (Manager)
      createdByName: "Sarah Johnson",
    }

    setOrders([...orders, orderToAdd])
    setNewOrder({
      ingredientId: 0,
      quantity: 0,
      unit: "g",
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      createdBy: 4,
      createdByName: "Sarah Johnson",
    })
    setIsCreateOrderDialogOpen(false)
  }

  const handleUpdateOrderStatus = (id: number, status: "Approved" | "Rejected" | "Delivered") => {
    const updatedOrders = orders.map((order) => {
      if (order.id === id) {
        const updatedOrder = { ...order, status }
        if (status === "Delivered") {
          updatedOrder.deliveryDate = new Date().toISOString().split("T")[0]
        }
        return updatedOrder
      }
      return order
    })

    setOrders(updatedOrders)
  }

  const handleMarkDelivered = () => {
    if (!selectedOrder) return

    handleUpdateOrderStatus(selectedOrder.id, "Delivered")
    setSelectedOrder(null)
    setIsMarkDeliveredDialogOpen(false)
  }

  const startMarkDelivered = (order: Order) => {
    setSelectedOrder(order)
    setIsMarkDeliveredDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Approved":
        return <Badge variant="secondary">Approved</Badge>
      case "Delivered":
        return <Badge variant="success">Delivered</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>Order ingredients for the kitchen inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ingredient-select" className="text-right">
                    Ingredient
                  </Label>
                  <Select
                    value={newOrder.ingredientId?.toString()}
                    onValueChange={(value) => setNewOrder({ ...newOrder, ingredientId: Number(value) })}
                  >
                    <SelectTrigger className="col-span-3">
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
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Input
                      id="quantity"
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select value={newOrder.unit} onValueChange={(value) => setNewOrder({ ...newOrder, unit: value })}>
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
                    value={newOrder.orderDate}
                    onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input id="notes" placeholder="Any special instructions" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOrderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder}>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending ({getPendingOrders().length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({getApprovedOrders().length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({getDeliveredOrders().length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage all ingredient orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell className="font-medium">{order.ingredientName}</TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.createdByName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {order.status === "Pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.id, "Rejected")}
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {order.status === "Approved" && (
                            <Button variant="outline" size="sm" onClick={() => startMarkDelivered(order)}>
                              <Package className="h-4 w-4 mr-1" /> Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders waiting for approval.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPendingOrders().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell className="font-medium">{order.ingredientName}</TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.createdByName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, "Approved")}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, "Rejected")}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
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
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Orders</CardTitle>
              <CardDescription>Orders that have been approved and are awaiting delivery.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getApprovedOrders().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell className="font-medium">{order.ingredientName}</TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.createdByName}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => startMarkDelivered(order)}>
                          <Package className="h-4 w-4 mr-1" /> Mark Delivered
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
              <CardDescription>Orders that have been delivered and added to inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDeliveredOrders().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell className="font-medium">{order.ingredientName}</TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.deliveryDate}</TableCell>
                      <TableCell>{order.createdByName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mark Delivered Dialog */}
      <Dialog open={isMarkDeliveredDialogOpen} onOpenChange={setIsMarkDeliveredDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Delivered</DialogTitle>
            <DialogDescription>
              Confirm delivery of {selectedOrder?.quantity} {selectedOrder?.unit} of {selectedOrder?.ingredientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delivery-notes" className="text-right">
                Notes
              </Label>
              <Input id="delivery-notes" placeholder="Any notes about the delivery" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkDeliveredDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkDelivered}>
              <Calendar className="mr-2 h-4 w-4" /> Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
