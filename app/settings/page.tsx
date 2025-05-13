"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    lowStockAlerts: true,
    mealServingNotifications: true,
    orderStatusUpdates: true,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password update failed",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }
    // In a real app, this would call an API
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    })
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.role === "admin" && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={user?.role} disabled />
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationUpdate} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications in the browser.</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts when ingredients are running low.</p>
                    </div>
                    <Switch
                      id="low-stock-alerts"
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, lowStockAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="meal-serving-notifications">Meal Serving Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when meals are served.</p>
                    </div>
                    <Switch
                      id="meal-serving-notifications"
                      checked={notificationSettings.mealServingNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, mealServingNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-status-updates">Order Status Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications when order statuses change.</p>
                    </div>
                    <Switch
                      id="order-status-updates"
                      checked={notificationSettings.orderStatusUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, orderStatusUpdates: checked })
                      }
                    />
                  </div>
                </div>
                <Button type="submit">Save Preferences</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        {user?.role === "admin" && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings (Admin only).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Database Backup Frequency</Label>
                    <select
                      id="backup-frequency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low-stock-threshold">Default Low Stock Threshold (%)</Label>
                    <Input id="low-stock-threshold" type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discrepancy-threshold">Discrepancy Alert Threshold (%)</Label>
                    <Input id="discrepancy-threshold" type="number" defaultValue="15" />
                  </div>
                  <Button>Save System Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
