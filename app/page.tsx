import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import PropertyList from "@/components/property-list"
import AddPropertyForm from "@/components/add-property-form"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Manager</h1>
          <p className="text-muted-foreground mt-1">Manage your properties, viewings, and notes in one place</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/add-property">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/bookings">View All Bookings</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Properties</h2>
            <p className="text-sm text-muted-foreground">Click the menu on each property to edit details</p>
          </div>
          <Suspense fallback={<PropertyListSkeleton />}>
            <PropertyList />
          </Suspense>
        </section>

        <section className="bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Quick Add Property</h2>
          <AddPropertyForm />
        </section>
      </div>
    </div>
  )
}

function PropertyListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
    </div>
  )
}
