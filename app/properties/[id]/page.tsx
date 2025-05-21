"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
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
import PropertyPhotoGallery from "@/components/property-photo-gallery"

export default function PropertyPage({ params }: { params: { id: string } }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const property = getPropertyById(params.id)

  if (!property) {
    console.error(`Property with ID ${params.id} not found`)
    notFound()
  }

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    window.location.reload()
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
        <Button onClick={() => setIsEditDialogOpen(true)} className="bg-[#89B0AE] hover:bg-[#89B0AE]/90 text-white">
          <Edit className="mr-2 h-4 w-4" />
          Edit Listing
        </Button>
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
              <PropertyPhotoGallery photos={property.photos || []} coverPhotoIndex={property.coverPhotoIndex || 0} />

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
              <PropertyFiles property={property} />
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
              <BookingForm propertyId={params.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Feedback</CardTitle>
              <CardDescription>Record feedback about this property</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackForm propertyId={params.id} />
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
    </div>
  )
}
