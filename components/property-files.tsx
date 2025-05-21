"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { FileIcon, ImageIcon, FileText, Mic, ExternalLink, Download, X } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { getFeedbackByPropertyId } from "@/lib/data"
import type { Property, Feedback } from "@/lib/types"

interface PropertyFilesProps {
  property: Property
}

export default function PropertyFiles({ property }: PropertyFilesProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    setFeedback(getFeedbackByPropertyId(property.id))
  }, [property.id])

  // Collect all feedback media
  const feedbackImages: { url: string; source: string }[] = []
  const feedbackVideos: { url: string; source: string }[] = []
  const feedbackAudio: { url: string; source: string }[] = []

  feedback.forEach((item) => {
    if (item.images && item.images.length > 0) {
      item.images.forEach((image) => {
        feedbackImages.push({ url: image, source: `Feedback from ${new Date(item.createdAt).toLocaleDateString()}` })
      })
    }
    if (item.video) {
      feedbackVideos.push({ url: item.video, source: `Feedback from ${new Date(item.createdAt).toLocaleDateString()}` })
    }
    if (item.audio) {
      feedbackAudio.push({ url: item.audio, source: `Feedback from ${new Date(item.createdAt).toLocaleDateString()}` })
    }
  })

  // Count total files by category
  const photosCount = property.photos?.length || 0
  const floorplansCount = property.floorplans?.length || 0
  const pdfCount = property.listingPdf ? 1 : 0
  const feedbackMediaCount = feedbackImages.length + feedbackVideos.length + feedbackAudio.length

  // Check if there are any files
  const hasFiles = photosCount > 0 || floorplansCount > 0 || pdfCount > 0 || feedbackMediaCount > 0

  if (!hasFiles) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files yet</h3>
        <p className="text-muted-foreground">Upload photos, floor plans, or add feedback with media</p>
      </div>
    )
  }

  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsLightboxOpen(true)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">
            All Files
            <Badge variant="secondary" className="ml-2">
              {photosCount + floorplansCount + pdfCount + feedbackMediaCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="photos" disabled={photosCount === 0}>
            Photos
            {photosCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {photosCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="floorplans" disabled={floorplansCount === 0}>
            Floor Plans
            {floorplansCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {floorplansCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={pdfCount === 0}>
            Documents
            {pdfCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pdfCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="feedback" disabled={feedbackMediaCount === 0}>
            Feedback Media
            {feedbackMediaCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {feedbackMediaCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Property Photos */}
          {photosCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Property Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.photos?.map((photo, index) => (
                    <div
                      key={`photo-${index}`}
                      className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        openLightbox(photo)
                      }}
                    >
                      <Image
                        src={photo || "/placeholder.svg"}
                        alt={`Property photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === (property.coverPhotoIndex || 0) && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Floor Plans */}
          {floorplansCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FileIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Floor Plans
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {property.floorplans?.map((plan, index) => (
                    <div
                      key={`floorplan-${index}`}
                      className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        openLightbox(plan)
                      }}
                    >
                      <Image
                        src={plan || "/placeholder.svg"}
                        alt={`Floor plan ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Listing PDF */}
          {property.listingPdf && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  Documents
                </h3>
                <div className="border rounded-md p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium">Property Listing</p>
                      <p className="text-sm text-muted-foreground">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={property.listingPdf} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={property.listingPdf} download>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Media */}
          {feedbackMediaCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Feedback Media
                </h3>

                {/* Feedback Images */}
                {feedbackImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {feedbackImages.map((image, index) => (
                        <div
                          key={`feedback-image-${index}`}
                          className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            openLightbox(image.url)
                          }}
                        >
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={`Feedback image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">
                            {image.source}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Videos */}
                {feedbackVideos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Videos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {feedbackVideos.map((video, index) => (
                        <div key={`feedback-video-${index}`} className="border rounded-md p-3">
                          <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                            <video src={video.url} controls className="w-full h-full" />
                          </div>
                          <p className="text-xs text-muted-foreground">{video.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Audio */}
                {feedbackAudio.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Audio</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {feedbackAudio.map((audio, index) => (
                        <div key={`feedback-audio-${index}`} className="border rounded-md p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <Mic className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm">{audio.source}</p>
                          </div>
                          <audio src={audio.url} controls className="w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          {photosCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {property.photos?.map((photo, index) => (
                <div
                  key={`photo-tab-${index}`}
                  className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    openLightbox(photo)
                  }}
                >
                  <Image
                    src={photo || "/placeholder.svg"}
                    alt={`Property photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === (property.coverPhotoIndex || 0) && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No photos yet</h3>
              <p className="text-muted-foreground">Upload property photos by editing the property</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="floorplans" className="space-y-4">
          {floorplansCount > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.floorplans?.map((plan, index) => (
                <div
                  key={`floorplan-tab-${index}`}
                  className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    openLightbox(plan)
                  }}
                >
                  <Image
                    src={plan || "/placeholder.svg"}
                    alt={`Floor plan ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No floor plans yet</h3>
              <p className="text-muted-foreground">Upload floor plans by editing the property</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {property.listingPdf ? (
            <div className="border rounded-md p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-10 w-10 text-muted-foreground mr-4" />
                <div>
                  <p className="font-medium">Property Listing</p>
                  <p className="text-sm text-muted-foreground">PDF Document</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={property.listingPdf} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={property.listingPdf} download>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground">Upload a listing PDF by editing the property</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {feedbackMediaCount > 0 ? (
            <>
              {/* Feedback Images */}
              {feedbackImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {feedbackImages.map((image, index) => (
                      <div
                        key={`feedback-image-tab-${index}`}
                        className="aspect-square relative bg-muted rounded-md overflow-hidden group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          openLightbox(image.url)
                        }}
                      >
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={`Feedback image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">
                          {image.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Videos */}
              {feedbackVideos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Videos</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feedbackVideos.map((video, index) => (
                      <div key={`feedback-video-tab-${index}`} className="border rounded-md p-3">
                        <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                          <video src={video.url} controls className="w-full h-full" />
                        </div>
                        <p className="text-xs text-muted-foreground">{video.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Audio */}
              {feedbackAudio.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Audio</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {feedbackAudio.map((audio, index) => (
                      <div key={`feedback-audio-tab-${index}`} className="border rounded-md p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Mic className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm">{audio.source}</p>
                        </div>
                        <audio src={audio.url} controls className="w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No feedback media yet</h3>
              <p className="text-muted-foreground">Add feedback with images, video, or audio recordings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedImage && (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <div className="aspect-[4/3] md:aspect-[16/9] relative">
                <Image src={selectedImage || "/placeholder.svg"} alt="File preview" fill className="object-contain" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLightboxOpen(false)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
