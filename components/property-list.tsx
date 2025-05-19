"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getProperties } from "@/lib/data"
import type { Property } from "@/lib/types"
import EditPropertyDialog from "@/components/edit-property-dialog"

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    setProperties(getProperties())
  }, [])

  const handleEditClick = (property: Property) => {
    setEditingProperty(property)
    setIsEditDialogOpen(true)
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingProperty(null)
    // Refresh the properties list
    setProperties(getProperties())
  }

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
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <Image src="/placeholder.svg?height=300&width=600" alt={property.name} fill className="object-cover" />
              {property.listingPrice && (
                <Badge className="absolute top-2 right-2">${property.listingPrice.toLocaleString()}</Badge>
              )}
              <div className="absolute top-2 left-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleEditClick(property)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Property
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{property.name}</CardTitle>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/properties/${property.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Viewing
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/properties/${property.id}?tab=feedback`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Notes
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <EditPropertyDialog
        property={editingProperty}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />
    </>
  )
}
