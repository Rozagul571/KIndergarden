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
import { Edit, Trash, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "cook" | "manager"
  createdAt: string
}

// Sample data for demonstration
const initialUsers: User[] = [
  {
    id: 1,
    name: "John Smith",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2025-01-01T10:00:00",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "cook@example.com",
    role: "cook",
    createdAt: "2025-01-02T10:00:00",
  },
  {
    id: 3,
    name: "David Lee",
    email: "cook2@example.com",
    role: "cook",
    createdAt: "2025-01-03T10:00:00",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "manager@example.com",
    role: "manager",
    createdAt: "2025-01-04T10:00:00",
  },
]

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "cook" as "admin" | "cook" | "manager",
  })

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(0, ...users.map((user) => user.id)) + 1
    const userToAdd: User = {
      id: newId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, userToAdd])
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "cook",
    })
    setIsAddDialogOpen(false)
    toast({
      title: "User added",
      description: `${userToAdd.name} has been added as a ${userToAdd.role}.`,
    })
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return

    const updatedUsers = users.map((user) => (user.id === selectedUser.id ? selectedUser : user))

    setUsers(updatedUsers)
    setSelectedUser(null)
    setIsEditDialogOpen(false)
    toast({
      title: "User updated",
      description: `${selectedUser.name}'s information has been updated.`,
    })
  }

  const handleDeleteUser = (id: number) => {
    const userToDelete = users.find((user) => user.id === id)
    setUsers(users.filter((user) => user.id !== id))
    toast({
      title: "User deleted",
      description: `${userToDelete?.name} has been removed from the system.`,
    })
  }

  const startEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>
      case "cook":
        return <Badge variant="secondary">Cook</Badge>
      case "manager":
        return <Badge variant="outline">Manager</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with specific role permissions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirm-password" className="text-right">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "cook" | "manager" })}
                  >
                    <option value="cook">Cook</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and their permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => startEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <select
                  id="edit-role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as "admin" | "cook" | "manager" })
                  }
                >
                  <option value="cook">Cook</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reset-password" className="text-right">
                  Reset Password
                </Label>
                <div className="col-span-3">
                  <Button variant="outline" size="sm">
                    Send Password Reset Link
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
