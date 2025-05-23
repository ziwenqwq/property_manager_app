"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { File, FileText, Trash2, Eye, Download } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPropertyFiles } from "@/lib/data"
import { deleteFile, deletePropertyFile } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

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
  const [previewFile, setPreviewFile] = useState<PropertyFile | null>(null)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

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

  const handlePreviewFile = (file: PropertyFile) => {
    // Skip preview for PDFs
    if (file.type === "pdf") {
      return
    }

    setPreviewFile(file)
    setIsPreviewDialogOpen(true)
  }

  const handleDownloadFile = (file: PropertyFile) => {
    try {
      // For PDFs, we'll use a different approach to handle potential CORS issues
      if (file.type === "pdf") {
        // Create a fetch request to get the file as a blob
        fetch(file.url)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok")
            }
            return response.blob()
          })
          .then((blob) => {
            // Create a blob URL for the PDF
            const blobUrl = window.URL.createObjectURL(blob)

            // Create a temporary anchor element to download the file
            const a = document.createElement("a")
            a.href = blobUrl
            a.download = file.name || `document-${file.id}.pdf`
            document.body.appendChild(a)
            a.click()

            // Clean up
            document.body.removeChild(a)
            window.URL.revokeObjectURL(blobUrl)

            toast({
              title: "Download started",
              description: `Downloading ${file.name || "PDF document"}`,
            })
          })
          .catch((error) => {
            console.error("Error downloading PDF:", error)
            toast({
              title: "Download failed",
              description: "There was an error downloading the PDF. Please try again.",
              variant: "destructive",
            })
          })
      } else {
        // For non-PDFs, use the standard download approach
        const a = document.createElement("a")
        a.href = file.url
        a.download = file.name || `file-${file.id}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({
          title: "Download started",
          description: `Downloading ${file.name || "file"}`,
        })
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      })
    }
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
                    onPreviewClick={() => handlePreviewFile(file)}
                    onDownloadClick={() => handleDownloadFile(file)}
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
                      onPreviewClick={() => handlePreviewFile(file)}
                      onDownloadClick={() => handleDownloadFile(file)}
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
                      onPreviewClick={() => handlePreviewFile(file)}
                      onDownloadClick={() => handleDownloadFile(file)}
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
                      onPreviewClick={() => handlePreviewFile(file)}
                      onDownloadClick={() => handleDownloadFile(file)}
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
                      onPreviewClick={() => handlePreviewFile(file)}
                      onDownloadClick={() => handleDownloadFile(file)}
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

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {previewFile?.type === "image" && (
              <div className="relative max-w-full max-h-[70vh]">
                <Image
                  src={previewFile.url || "/placeholder.svg"}
                  alt={previewFile.name}
                  width={800}
                  height={600}
                  className="object-contain max-h-[70vh]"
                />
              </div>
            )}
            {previewFile?.type === "video" && (
              <video src={previewFile.url} controls className="max-w-full max-h-[70vh]" />
            )}
            {previewFile?.type === "audio" && <audio src={previewFile.url} controls className="w-full" />}
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={() => handleDownloadFile(previewFile!)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface FileItemProps {
  file: PropertyFile
  onDeleteClick: () => void
  onPreviewClick: () => void
  onDownloadClick: () => void
  canDelete: boolean
}

function FileItem({ file, onDeleteClick, onPreviewClick, onDownloadClick, canDelete }: FileItemProps) {
  const isImage = file.type === "image"
  const isPdf = file.type === "pdf"
  const isVideo = file.type === "video"
  const isAudio = file.type === "audio"

  return (
    <div className="border rounded-md overflow-hidden group relative">
      {isImage && (
        <div className="aspect-square relative">
          <Image src={file.url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onPreviewClick()
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDownloadClick()
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      {isPdf && (
        <div
          className="aspect-square flex flex-col items-center justify-center bg-muted p-4 relative cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onDownloadClick()
          }}
        >
          <FileText className="h-16 w-16 text-muted-foreground" />
          <span className="mt-2 text-xs text-center">Click to download</span>
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDownloadClick()
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      {isVideo && (
        <div className="aspect-video relative">
          <video src={file.url} className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onPreviewClick()
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDownloadClick()
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      {isAudio && (
        <div className="p-4 relative">
          <audio src={file.url} controls className="w-full" />
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onPreviewClick()
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDownloadClick()
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="p-2 text-xs truncate border-t">{file.name}</div>
      <div className="p-2 pt-0 text-xs text-muted-foreground">{format(new Date(file.createdAt), "MMM d, yyyy")}</div>
    </div>
  )
}
