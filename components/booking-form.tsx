"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createBooking } from "@/lib/actions"
import { Clock } from "lucide-react"

interface BookingFormProps {
  propertyId: string
  onSuccess?: () => void
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a viewing date",
        variant: "destructive",
      })
      return
    }

    if (!time) {
      toast({
        title: "Time required",
        description: "Please enter a viewing time",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("propertyId", propertyId)

      // Get the estate agent name from the form
      const estateAgent = (formData.get("estateAgent") as string) || "Unspecified"

      // Make sure we're using the correct field name for the server action
      formData.set("name", estateAgent)

      const result = await createBooking(formData)

      if (result.success) {
        toast({
          title: "Viewing scheduled",
          description: "The viewing has been scheduled successfully.",
        })

        // Reset form using the ref
        if (formRef.current) {
          formRef.current.reset()
        }

        setSelectedDate(undefined)
        setTime("")

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }

        // Use a safer approach to refresh the page after a short delay
        setTimeout(() => {
          try {
            router.refresh()
          } catch (refreshError) {
            console.error("Error refreshing page:", refreshError)
            // If router.refresh() fails, use a more direct approach
            window.location.reload()
          }
        }, 500)
      } else {
        toast({
          title: "Error scheduling viewing",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error scheduling viewing",
        description:
          "An unexpected error occurred, but your booking may have been saved. Please refresh the page to check.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="estateAgent">Estate Agent's Name (optional)</Label>
        <Input id="estateAgent" name="estateAgent" placeholder="Enter estate agent's name" className="mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Viewing Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                id="date"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && <input type="hidden" name="date" value={selectedDate.toISOString()} />}
        </div>

        <div>
          <Label htmlFor="time">Viewing Time</Label>
          <div className="relative mt-1">
            <Input
              id="time"
              name="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
            <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special arrangements or details about the viewing"
          className="mt-1 resize-none"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Viewing Information"}
      </Button>
    </form>
  )
}

export default BookingForm
