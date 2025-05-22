"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  FileIcon,
  ImageIcon,
  FileText,
  FileSpreadsheet,
  Video,
  Mic,
  Download,
  ExternalLink,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPropertyFiles } from "@/lib/data"
import { deleteFile, deletePropertyPhoto, deletePropertyFloorplan, deletePropertyListingPdf } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"

interface PropertyFile {
  id: string
  url: string
  type: string
  category: string
  name: string
  createdAt: string
  feedbackId?: string
}

export default function PropertyFiles({ propertyId }: { propertyId: string }) {
  const [files, setFiles] = useState<PropertyFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function fetchFiles() {
      try {
        setIsLoading(true)
        const data = await getPropertyFiles(propertyId)
        console.log("Files fetched:", data)
        setFiles(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching property files:", err)
        setError("Failed to load files")
        setFiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [propertyId, refreshKey])

  const refreshFiles = () => {
    setRefreshKey((prev) => prev + 1)
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

  if (files.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
        <p className="text-muted-foreground">Upload files using the property edit form or feedback form</p>
      </div>
    )
  }

  // Group files by category
  const filesByCategory = files.reduce(
    (acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = []
      }
      acc[file.category].push(file)
      return acc
    },
    {} as Record<string, PropertyFile[]>,
  )

  const categories = Object.keys(filesByCategory)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Files</h3>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          {categories.includes("property_photo") && (
            <TabsTrigger value="property_photo">
              <ImageIcon className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
          )}
          {categories.includes("floorplan") && (
            <TabsTrigger value="floorplan">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Floor Plans
            </TabsTrigger>
          )}
          {categories.includes("listing_pdf") && (
            <TabsTrigger value="listing_pdf">
              <FileText className="h-4 w-4 mr-2" />
              Listing PDFs
            </TabsTrigger>
          )}
          {categories.includes("feedback_media") && (
            <TabsTrigger value="feedback_media">
              <Mic className="h-4 w-4 mr-2" />
              Feedback Media
            </TabsTrigger>
          )}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filesByCategory[category].map((file, index) => (
                <FileCard
                  key={`${file.id}-${index}`}
                  file={file}
                  index={index}
                  propertyId={propertyId}
                  onDeleteSuccess={refreshFiles}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function FileCard({
  file,
  index,
  propertyId,
  onDeleteSuccess,
}: {
  file: PropertyFile
  index: number
  propertyId: string
  onDeleteSuccess: () => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const isImage = file.type === "image" || file.type === "property_photo" || file.type === "floorplan"
  const isVideo = file.type === "video"
  const isAudio = file.type === "audio"
  const isPdf = file.type === "pdf" || file.url.endsWith(".pdf")

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "property_photo":
        return "Property Photo"
      case "floorplan":
        return "Floor Plan"
      case "listing_pdf":
        return "Listing PDF"
      case "feedback_media":
        return `Feedback ${file.type.charAt(0).toUpperCase() + file.type.slice(1)}`
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      let result = { success: false, error: "Unknown error" }

      // Handle different file types
      if (file.category === "feedback_media" && file.id.includes("-")) {
        // Delete feedback media
        result = await deleteFile(file.id)
      } else if (file.category === "property_photo") {
        // Delete property photo
        result = await deletePropertyPhoto(propertyId, index)
      } else if (file.category === "floorplan") {
        // Delete property floorplan
        result = await deletePropertyFloorplan(propertyId, index)
      } else if (file.category === "listing_pdf") {
        // Delete property listing PDF
        result = await deletePropertyListingPdf(propertyId)
      } else {
        toast({
          title: "Cannot delete file",
          description: "This file type cannot be deleted.",
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      if (result.success) {
        toast({
          title: "File deleted",
          description: "The file has been deleted successfully.",
        })

        // Add a small delay before refreshing the page
        setTimeout(() => {
          // Perform a full page refresh
          window.location.reload()
        }, 1000)
      } else {
        toast({
          title: "Error deleting file",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
        setIsDeleting(false)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error deleting file",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-muted">
        {isImage && (
          <Image src={file.url || "/placeholder.svg"} alt={file.name || "File"} fill className="object-cover" />
        )}
        {isVideo && (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {isAudio && (
          <div className="w-full h-full flex items-center justify-center">
            <Mic className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {isPdf && (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit">
            {getCategoryLabel(file.category)}
          </Badge>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={file.url} download>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </a>
              </Button>
            </div>
            {/* Show delete button for all file types */}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmationDialog
        title={`Delete ${getCategoryLabel(file.category)}`}
        description="Are you sure you want to delete this file? This action cannot be undone."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Card>
  )
}
