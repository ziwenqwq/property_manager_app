import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import AllBookings from "@/components/all-bookings"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function BookingsPage() {
  // Server-side authentication check
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">All Property Viewings</h1>
      <AllBookings />
    </div>
  )
}
