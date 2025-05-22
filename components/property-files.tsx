"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { File, FileText, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPropertyFiles } from "@/lib/data"
import { deleteFile, deletePropertyFile } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [files, setFiles] = useState<PropertyFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingFileType, setDeletingFileType] = useState<string>("")

  useEffect(() => {
    async function fetchFiles() {
      try {
        setIsLoading(true)
        const data = await getPropertyFiles(propertyId)
        setFiles(data)
      } catch (err) {
        console.error("Error fetching property files:", err)
        setError("Failed to load files")
        setFiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [propertyId, refreshTrigger])

  const refreshFiles = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDeleteFile = async () => {
    if (!deletingFileId) return

    try {
      let result

      // Use different delete functions based on file type
      if (
        deletingFileId.startsWith("photo-") ||
        deletingFileId.startsWith("floorplan-") ||
        deletingFileId.startsWith("listing-pdf")
      ) {
        result = await deletePropertyFile(propertyId, deletingFileId)
      } else {
        result = await deleteFile(deletingFileId)
      }

      if (result.success) {
        toast({
          title: "File deleted",
          description: `The ${deletingFileType} has been deleted successfully.`,
        })
        refreshFiles()
        router.refresh()
      } else {
        toast({
          title: "Error deleting file",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error deleting file",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeletingFileId(null)
      setDeletingFileType("")
      setIsDeleteDialogOpen(false)
    }
  }

  const confirmDeleteFile = (fileId: string, fileType: string) => {
    setDeletingFileId(fileId)
    // Set a more descriptive file type based on the file category
    const file = files.find((f) => f.id === fileId)
    const displayType =
      file?.category === "property_photo"
        ? "property photo"
        : file?.category === "floorplan"
          ? "floorplan"
          : file?.category === "listing_pdf"
            ? "document"
            : file?.category === "feedback_media"
              ? "feedback media"
              : fileType
    setDeletingFileType(displayType)
    setIsDeleteDialogOpen(true)
  }

  // Group files by category
  const propertyPhotos = files.filter((file) => file.category === "property_photo")
  const floorplans = files.filter((file) => file.category === "floorplan")
  const listingPdfs = files.filter((file) => file.category === "listing_pdf")
  const feedbackMedia = files.filter((file) => file.category === "feedback_media")

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded"></div>
          ))}
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
        <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No files available</h3>
        <p className="text-muted-foreground">This property doesn't have any files or attachments yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Files ({files.length})</TabsTrigger>
          {propertyPhotos.length > 0 && <TabsTrigger value="photos">Photos ({propertyPhotos.length})</TabsTrigger>}
          {floorplans.length > 0 && <TabsTrigger value="floorplans">Floorplans ({floorplans.length})</TabsTrigger>}
          {listingPdfs.length > 0 && <TabsTrigger value="pdfs">Documents ({listingPdfs.length})</TabsTrigger>}
          {feedbackMedia.length > 0 && (
            <TabsTrigger value="feedback">Feedback Media ({feedbackMedia.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Files</CardTitle>
              <CardDescription>All files and attachments for this property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onDeleteClick={() => confirmDeleteFile(file.id, file.type)}
                    canDelete={true} // Enable delete for all files
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {propertyPhotos.length > 0 && (
          <TabsContent value="photos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Photos</CardTitle>
                <CardDescription>Photos of the property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {propertyPhotos.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDeleteClick={() => confirmDeleteFile(file.id, file.type)}
                      canDelete={true} // Enable delete for property photos
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {floorplans.length > 0 && (
          <TabsContent value="floorplans" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Floorplans</CardTitle>
                <CardDescription>Floorplans and layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {floorplans.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDeleteClick={() => confirmDeleteFile(file.id, file.type)}
                      canDelete={true} // Enable delete for floorplans
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {listingPdfs.length > 0 && (
          <TabsContent value="pdfs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Listing PDFs and other documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {listingPdfs.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDeleteClick={() => confirmDeleteFile(file.id, file.type)}
                      canDelete={true} // Enable delete for documents
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {feedbackMedia.length > 0 && (
          <TabsContent value="feedback" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Media</CardTitle>
                <CardDescription>Media attached to feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {feedbackMedia.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDeleteClick={() => confirmDeleteFile(file.id, file.type)}
                      canDelete={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <ConfirmationDialog
        title={`Delete ${deletingFileType}`}
        description={`Are you sure you want to delete this ${deletingFileType}? This action cannot be undone.`}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteFile}
        variant="destructive"
      />
    </div>
  )
}

interface FileItemProps {
  file: PropertyFile
  onDeleteClick: () => void
  canDelete: boolean
}

function FileItem({ file, onDeleteClick, canDelete }: FileItemProps) {
  const isImage = file.type === "image"
  const isPdf = file.type === "pdf"
  const isVideo = file.type === "video"
  const isAudio = file.type === "audio"

  return (
    <div className="border rounded-md overflow-hidden group relative">
      {isImage && (
        <div className="aspect-square relative">
          <Image src={file.url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
          {canDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {isPdf && (
        <div className="aspect-square flex items-center justify-center bg-muted p-4 relative">
          <FileText className="h-16 w-16 text-muted-foreground" />
          {canDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {isVideo && (
        <div className="aspect-video relative">
          <video src={file.url} className="w-full h-full object-cover" />
          {canDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {isAudio && (
        <div className="p-4 relative">
          <audio src={file.url} controls className="w-full" />
          {canDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDeleteClick}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      <div className="p-2 text-xs truncate border-t">{file.name}</div>
      <div className="p-2 pt-0 text-xs text-muted-foreground">{format(new Date(file.createdAt), "MMM d, yyyy")}</div>
    </div>
  )
}
