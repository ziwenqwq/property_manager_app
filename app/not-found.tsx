// Add a custom not-found page to handle cases where properties don't exist
import Link from "next/link"
import { Home } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <Home className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The property you're looking for doesn't exist or may have been removed.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Return to Properties
        </Link>
      </Button>
    </div>
  )
}
