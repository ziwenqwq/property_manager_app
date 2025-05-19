"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, User, Edit } from "lucide-react" // Added Edit import
import EditBookingDialog from "@/components/edit-booking-dialog" // Added EditBookingDialog import

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBookingsByPropertyId } from "@/lib/data"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function PropertyBookings({ propertyId }: { propertyId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null) // Added state variable
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // Added state variable

  useEffect(() => {
    setBookings(getBookingsByPropertyId(propertyId))
  }, [propertyId])

  const handleEditComplete = () => {
    // Added function
    setIsEditDialogOpen(false)
    setEditingBooking(null)
    // Refresh the bookings list
    setBookings(getBookingsByPropertyId(propertyId))
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No viewings scheduled</h3>
        <p className="text-muted-foreground">Use the form to schedule a viewing for this property</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Scheduled Viewings</h3>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.time}</span>
                  </div>
                </div>
                {booking.status && (
                  <Badge
                    className={cn(
                      booking.status === "completed" && "bg-green-500",
                      booking.status === "scheduled" && "bg-blue-500",
                      booking.status === "cancelled" && "bg-red-500",
                    )}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="space-y-2 border-t pt-3">
                {booking.name && booking.name !== "Unspecified" && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Estate Agent: {booking.name}</span>
                  </div>
                )}
              </div>
              {booking.notes && <div className="mt-3 text-sm border-t pt-3">{booking.notes}</div>}
              <div className="flex justify-end mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingBooking(booking)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <EditBookingDialog
        booking={editingBooking}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />
    </div>
  )
}
