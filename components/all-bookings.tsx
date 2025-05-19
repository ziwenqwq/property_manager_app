"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock, Home, User, Trash2, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getAllBookings, deleteBooking, type Booking } from "@/lib/supabase/data"

export default function AllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    setIsLoading(true)
    try {
      const data = await getAllBookings()
      setBookings(data)
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    setIsDeleting(bookingId)
    try {
      const success = await deleteBooking(bookingId)
      if (success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        })
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId))
      } else {
        throw new Error("Failed to delete booking")
      }
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No viewings scheduled</h3>
        <p className="text-muted-foreground mb-4">Schedule a viewing for one of your properties</p>
        <Button asChild>
          <Link href="/">Browse Properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <Link href={`/properties/${booking.property_id}`} className="font-medium hover:underline">
                    {booking.propertyName}
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {booking.estate_agent && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Agent: {booking.estate_agent}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteBooking(booking.id)}
                  disabled={isDeleting === booking.id}
                >
                  {isDeleting === booking.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {booking.notes && <div className="mt-2 text-sm border-t pt-2">{booking.notes}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
