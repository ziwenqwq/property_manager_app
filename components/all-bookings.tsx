"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Clock, Home, User, Edit } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getAllBookings } from "@/lib/data"
import type { Booking } from "@/lib/types"
import EditBookingDialog from "@/components/edit-booking-dialog"

export default function AllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    setBookings(getAllBookings())
  }, [])

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingBooking(null)
    // Refresh the bookings list
    setBookings(getAllBookings())
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
                  <Link href={`/properties/${booking.propertyId}`} className="font-medium hover:underline">
                    {booking.propertyName}
                  </Link>
                  {booking.status && (
                    <Badge
                      className={cn(
                        "ml-2",
                        booking.status === "completed" && "bg-green-500",
                        booking.status === "scheduled" && "bg-blue-500",
                        booking.status === "cancelled" && "bg-red-500",
                      )}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-row items-center gap-4 text-sm">
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

              <div className="space-y-1">
                {booking.name && booking.name !== "Unspecified" && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Estate Agent: {booking.name}</span>
                  </div>
                )}
              </div>
            </div>

            {booking.notes && <div className="mt-2 text-sm border-t pt-2">{booking.notes}</div>}
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
      <EditBookingDialog
        booking={editingBooking}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />
    </div>
  )
}
