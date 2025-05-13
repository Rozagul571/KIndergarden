import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-center">You do not have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This page requires a different role or higher level of access. Please contact your administrator if you
            believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard" passHref>
            <Button>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
