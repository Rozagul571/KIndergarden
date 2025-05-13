import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function LowStockAlert() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Potatoes</p>
          <p className="text-xs text-muted-foreground">500g remaining (2000g threshold)</p>
        </div>
        <Badge variant="destructive">Critical</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Chicken</p>
          <p className="text-xs text-muted-foreground">300g remaining (800g threshold)</p>
        </div>
        <Badge variant="destructive">Critical</Badge>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Salt</p>
          <p className="text-xs text-muted-foreground">450g remaining (500g threshold)</p>
        </div>
        <Badge variant="outline">Low</Badge>
      </div>
      <div className="pt-2">
        <Link href="/inventory" passHref>
          <Button variant="outline" className="w-full">
            Manage Inventory
          </Button>
        </Link>
      </div>
    </div>
  )
}
