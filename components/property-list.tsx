"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  MessageSquare,
  Home,
  User,
  SquareIcon as SquareFootIcon,
  Bed,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getProperties } from "@/lib/data"
import type { Property } from "@/lib/types"
import PropertyRating from "@/components/property-rating"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { deleteProperty } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { useRouter } from "next/navigation"

export default async function PropertyList() {
  const properties = await getProperties()

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No properties yet</h3>
        <p className="text-muted-foreground mb-4">Add your first property to get started</p>
        <Button asChild>
          <Link href="/add-property">Add Property</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const result = await deleteProperty(property.id)

      if (result.success) {
        toast({
          title: "Property deleted",
          description: "The property has been deleted successfully.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error deleting property",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error deleting property",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md group">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="aspect-video relative">
          <Image
            src={
              property.photos && property.photos.length > 0
                ? property.photos[0]
                : `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(property.name)}`
            }
            alt={property.name}
            fill
            className="object-cover"
          />
          {property.listingPrice && (
            <Badge className="absolute top-2 right-2">£{property.listingPrice.toLocaleString()}</Badge>
          )}
          <div className="absolute top-2 left-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href={`/properties/${property.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Property
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="absolute bottom-2 left-2">
            <PropertyRating
              propertyId={property.id}
              rating={property.rating}
              size="sm"
              editable={false}
              className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full"
            />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{property.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.bedrooms} beds</span>
              </div>
            )}
            {property.squareFootage && (
              <div className="flex items-center gap-2">
                <SquareFootIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.squareFootage} sq ft</span>
              </div>
            )}
            {property.listingAgent && (
              <div className="flex items-center gap-2 col-span-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{property.listingAgent}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/properties/${property.id}`}>
            <Calendar className="mr-2 h-4 w-4" />
            Book Viewing
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/properties/${property.id}?tab=feedback`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </Link>
        </Button>
      </CardFooter>

      <ConfirmationDialog
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone and will remove all associated viewings and feedback."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Card>
  )
}

export function PropertyListSkeleton() {
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
