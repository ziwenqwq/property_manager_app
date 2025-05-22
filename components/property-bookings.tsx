"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, User, Edit, Trash2 } from "lucide-react"
import EditBookingDialog from "@/components/edit-booking-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBookingsByPropertyId } from "@/lib/data"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { deleteBooking } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"

export default function PropertyBookings({ propertyId }: { propertyId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const refreshBookings = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true)
        const data = await getBookingsByPropertyId(propertyId)
        // Ensure we always have an array, even if the API returns null or undefined
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings")
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [propertyId, refreshTrigger])

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingBooking(null)

    // Trigger a refresh by updating the refreshTrigger state
    refreshBookings()
  }

  const handleDeleteBooking = async () => {
    if (!deletingBookingId) return

    try {
      const result = await deleteBooking(deletingBookingId)

      if (result.success) {
        toast({
          title: "Viewing deleted",
          description: "The viewing has been deleted successfully.",
        })
        refreshBookings()
      } else {
        toast({
          title: "Error deleting viewing",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting viewing:", error)
      toast({
        title: "Error deleting viewing",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeletingBookingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeletingBookingId(booking.id)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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
      <ConfirmationDialog
        title="Delete Viewing"
        description="Are you sure you want to delete this viewing? This action cannot be undone."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBooking}
        variant="destructive"
      />
    </div>
  )
}
