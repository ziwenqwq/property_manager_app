import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import AddPropertyForm from "@/components/add-property-form"

export default function AddPropertyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
        <div className="bg-card p-6 rounded-lg border">
          <AddPropertyForm />
        </div>
      </div>
    </div>
  )
}
