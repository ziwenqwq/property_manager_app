"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { updatePropertyRating } from "@/lib/data"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface PropertyRatingProps {
  propertyId: string
  rating: number | null
  size?: "sm" | "md" | "lg"
  editable?: boolean
  className?: string
}

export default function PropertyRating({
  propertyId,
  rating,
  size = "md",
  editable = true,
  className,
}: PropertyRatingProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRating, setNewRating] = useState<number>(rating || 5)

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const handleRatingChange = () => {
    updatePropertyRating(propertyId, newRating)
    setIsDialogOpen(false)
    router.refresh()
    window.location.reload()
  }

  const handleClearRating = () => {
    updatePropertyRating(propertyId, null)
    setIsDialogOpen(false)
    router.refresh()
    window.location.reload()
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1",
          editable && "cursor-pointer hover:opacity-80",
          sizeClasses[size],
          className,
        )}
        onClick={() => editable && setIsDialogOpen(true)}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full",
            size === "sm" ? "h-5 w-5" : size === "md" ? "h-6 w-6" : "h-8 w-8",
            rating ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {rating ? rating : "N/A"}
        </div>
        <Star
          className={cn(
            "fill-current",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5",
            rating ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate this property</DialogTitle>
            <DialogDescription>Select a rating from 1 to 10 for this property, or clear the rating.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-2">
                <div className="text-4xl font-bold text-primary">{newRating}</div>
                <Star className="h-6 w-6 fill-current text-primary" />
              </div>
              <Slider
                value={[newRating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setNewRating(value[0])}
                className="w-full"
              />
              <div className="flex w-full justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClearRating} className="sm:w-auto w-full">
              Clear Rating
            </Button>
            <Button onClick={handleRatingChange} className="sm:w-auto w-full">
              Save Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
