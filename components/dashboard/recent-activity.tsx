import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Maria Garcia served 10 portions of Beef Stew</p>
          <p className="text-sm text-muted-foreground">Today at 9:30 AM</p>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>DL</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">David Lee served 15 portions of Chicken Rice</p>
          <p className="text-sm text-muted-foreground">Today at 12:15 PM</p>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">John Smith added 5kg of Beef to inventory</p>
          <p className="text-sm text-muted-foreground">Today at 8:45 AM</p>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Sarah Johnson updated Vegetable Soup recipe</p>
          <p className="text-sm text-muted-foreground">Yesterday at 3:20 PM</p>
        </div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Maria Garcia served 8 portions of Vegetable Soup</p>
          <p className="text-sm text-muted-foreground">Yesterday at 11:45 AM</p>
        </div>
      </div>
    </div>
  )
}
