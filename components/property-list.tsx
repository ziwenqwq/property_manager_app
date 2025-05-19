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
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getProperties, deleteProperty, type Property } from "@/lib/supabase/data"
import EditPropertyDialog from "@/components/edit-property-dialog"

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    setIsLoading(true)
    try {
      const data = await getProperties()
      setProperties(data)
    } catch (error) {
      console.error("Failed to load properties:", error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (property: Property) => {
    setEditingProperty(property)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (propertyId: string) => {
    setDeletingPropertyId(propertyId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingPropertyId) return

    try {
      const success = await deleteProperty(deletingPropertyId)
      if (success) {
        toast({
          title: "Success",
          description: "Property deleted successfully",
        })
        loadProperties()
      } else {
        throw new Error("Failed to delete property")
      }
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingPropertyId(null)
    }
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingProperty(null)
    loadProperties()
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-[200px] w-full mb-4 bg-muted animate-pulse rounded-md" />
              <div className="h-6 w-3/4 mb-2 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-full mb-2 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
      </div>
    )
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
          <Card key={property.id} className="overflow-hidden group relative">
            {/* Make the image and header clickable */}
            <Link href={`/properties/${property.id}`} className="block cursor-pointer">
              <div className="aspect-video relative">
                <Image src="/placeholder.svg?height=300&width=600" alt={property.name} fill className="object-cover" />
                {property.listing_price && (
                  <Badge className="absolute top-2 right-2">${Number(property.listing_price).toLocaleString()}</Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{property.name}</CardTitle>
              </CardHeader>
            </Link>

            {/* Menu button positioned absolutely to avoid interfering with the link */}
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
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(property.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Property
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bedrooms} beds</span>
                  </div>
                )}
                {property.square_footage && (
                  <div className="flex items-center gap-2">
                    <SquareFootIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.square_footage} sq ft</span>
                  </div>
                )}
                {property.listing_agent && (
                  <div className="flex items-center gap-2 col-span-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{property.listing_agent}</span>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this property and all associated data including viewings and notes. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
