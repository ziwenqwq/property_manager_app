"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, User, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBookingsByPropertyId, removeBooking } from "@/lib/data"
import type { Booking } from "@/lib/types"

export default function PropertyBookings({ propertyId }: { propertyId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    setBookings(getBookingsByPropertyId(propertyId))
  }, [propertyId])

  const handleDeleteBooking = (bookingId: string) => {
    removeBooking(bookingId)
    setBookings(getBookingsByPropertyId(propertyId))
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No viewings scheduled</h3>
        <p className="text-muted-foreground">Schedule a viewing to keep track of your appointments</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Scheduled Viewings</h3>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.time}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteBooking(booking.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {booking.estateAgent && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Agent: {booking.estateAgent}</span>
                </div>
              )}

              {booking.notes && <div className="mt-3 text-sm border-t pt-3">{booking.notes}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
