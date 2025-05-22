"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronLeft,
  Calendar,
  MessageSquare,
  User,
  PoundSterling,
  SquareIcon as SquareFootIcon,
  Bed,
  Edit,
  FileIcon,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BookingForm from "@/components/booking-form"
import FeedbackForm from "@/components/feedback-form"
import PropertyBookings from "@/components/property-bookings"
import PropertyFeedback from "@/components/property-feedback"
import PropertyFiles from "@/components/property-files"
import PropertyRating from "@/components/property-rating"
import { getPropertyById } from "@/lib/data"
import EditPropertyDialog from "@/components/edit-property-dialog"
import { deleteProperty } from "@/lib/actions"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"

// Update the PropertyPage component to include delete functionality
export default function PropertyPage({ params }: { params: { id: string } }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function loadProperty() {
      setIsLoading(true)
      const propertyData = await getPropertyById(params.id)
      setProperty(propertyData)
      setIsLoading(false)
    }

    loadProperty()
  }, [params.id, refreshTrigger])

  const handleDelete = async () => {
    try {
      const result = await deleteProperty(params.id)

      if (result.success) {
        toast({
          title: "Property deleted",
          description: "The property has been deleted successfully.",
        })
        router.push("/")
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#89B0AE]"></div>
        </div>
      </div>
    )
  }

  if (!property) {
    console.error(`Property with ID ${params.id} not found`)
    notFound()
  }

  const refreshPage = () => {
    setRefreshTrigger((prev) => prev + 1)
    router.refresh()
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)

    // Force a reload of the property data
    getPropertyById(params.id).then((updatedProperty) => {
      if (updatedProperty) {
        setProperty(updatedProperty)
        console.log("Updated property data:", updatedProperty)
      }
    })

    // Force a refresh of the page
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditDialogOpen(true)} className="bg-[#89B0AE] hover:bg-[#89B0AE]/90 text-white">
            <Edit className="mr-2 h-4 w-4" />
            Edit Listing
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Property
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{property.name}</CardTitle>
                  {property.address && <CardDescription>{property.address}</CardDescription>}
                </div>
                <PropertyRating propertyId={property.id} rating={property.rating} size="lg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative mb-4 bg-muted rounded-md overflow-hidden">
                {property.photos && property.photos.length > 0 ? (
                  <Image
                    src={property.photos[0] || "/placeholder.svg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/placeholder.svg?height=400&width=800"
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {property.listingAgent && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.listingAgent}</span>
                  </div>
                )}
                {property.listingPrice && (
                  <div className="flex items-center gap-2">
                    <PoundSterling className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">£{property.listingPrice.toLocaleString()}</span>
                  </div>
                )}
                {property.squareFootage && (
                  <div className="flex items-center gap-2">
                    <SquareFootIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.squareFootage} sq ft</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bedrooms} beds</span>
                  </div>
                )}
              </div>

              {property.listingUrl && (
                <Button variant="outline" className="w-full sm:w-auto mb-4" asChild>
                  <a href={property.listingUrl} target="_blank" rel="noopener noreferrer">
                    View Listing
                  </a>
                </Button>
              )}

              {property.floorplans && property.floorplans.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Floor Plans</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.floorplans.map((plan: string, index: number) => (
                      <div key={index} className="aspect-square relative bg-muted rounded-md overflow-hidden">
                        <Image
                          src={plan || "/placeholder.svg"}
                          alt={`Floor plan ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="bookings">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Viewings
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileIcon className="mr-2 h-4 w-4" />
                Files
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bookings" className="space-y-4 pt-4">
              <PropertyBookings propertyId={params.id} />
            </TabsContent>
            <TabsContent value="feedback" className="space-y-4 pt-4">
              <PropertyFeedback propertyId={params.id} />
            </TabsContent>
            <TabsContent value="files" className="space-y-4 pt-4">
              <PropertyFiles propertyId={params.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Viewing Information</CardTitle>
              <CardDescription>Record details about property viewings</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm
                propertyId={params.id}
                onSuccess={() => {
                  refreshPage()
                  // Force a hard refresh after a short delay
                  setTimeout(() => {
                    window.location.href = window.location.href
                  }, 300)
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Feedback</CardTitle>
              <CardDescription>Record feedback about this property</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackForm
                propertyId={params.id}
                onSuccess={() => {
                  refreshPage()
                  // Force a hard refresh after a short delay
                  setTimeout(() => {
                    window.location.href = window.location.href
                  }, 300)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <EditPropertyDialog
        property={property}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />

      <ConfirmationDialog
        title="Delete Property"
        description="Are you sure you want to delete this property? This action cannot be undone and will remove all associated viewings and feedback."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
