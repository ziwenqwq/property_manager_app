"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { MessageSquare, ImageIcon, Video, Mic, Edit, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFeedbackByPropertyId } from "@/lib/data"
import type { Feedback } from "@/lib/types"
import EditFeedbackDialog from "@/components/edit-feedback-dialog"
import { Button } from "@/components/ui/button"
import { deleteFeedback } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import ConfirmationDialog from "@/components/confirmation-dialog"

export default function PropertyFeedback({ propertyId }: { propertyId: string }) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshFeedback = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setIsLoading(true)
        const data = await getFeedbackByPropertyId(propertyId)
        // Ensure we always have an array, even if the API returns null or undefined
        setFeedback(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching feedback:", err)
        setError("Failed to load feedback")
        setFeedback([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [propertyId, refreshTrigger])

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingFeedback(null)
    refreshFeedback()
  }

  const handleDeleteFeedback = async () => {
    if (!deletingFeedbackId) return

    try {
      const result = await deleteFeedback(deletingFeedbackId)

      if (result.success) {
        toast({
          title: "Feedback deleted",
          description: "The feedback has been deleted successfully.",
        })
        refreshFeedback()
      } else {
        toast({
          title: "Error deleting feedback",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting feedback:", error)
      toast({
        title: "Error deleting feedback",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeletingFeedbackId(null)
    }
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

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
        <p className="text-muted-foreground">Be the first to leave feedback for this property</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Feedback</h3>
      <div className="grid gap-4">
        {feedback.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">Feedback</div>
                <div className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</div>
              </div>

              <p className="text-sm mb-4">{item.text}</p>

              {(item.images?.length || item.video || item.audio) && (
                <Tabs defaultValue="images" className="mt-4">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="images" disabled={!item.images?.length}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="video" disabled={!item.video}>
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="audio" disabled={!item.audio}>
                      <Mic className="h-4 w-4 mr-2" />
                      Audio
                    </TabsTrigger>
                  </TabsList>

                  {item.images?.length && (
                    <TabsContent value="images" className="mt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {item.images.map((image, index) => (
                          <div key={index} className="aspect-square relative bg-muted rounded-md overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg?height=200&width=200"}
                              alt={`Feedback image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {item.video && (
                    <TabsContent value="video" className="mt-2">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <video src={item.video} controls className="w-full h-full" />
                      </div>
                    </TabsContent>
                  )}

                  {item.audio && (
                    <TabsContent value="audio" className="mt-2">
                      <div className="border rounded-md p-2">
                        <audio src={item.audio} controls className="w-full" />
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              )}
              <div className="flex justify-end mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingFeedback(item)
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeletingFeedbackId(item.id)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <EditFeedbackDialog
        feedback={editingFeedback}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />
      <ConfirmationDialog
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone and will remove all associated media."
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteFeedback}
        variant="destructive"
      />
    </div>
  )
}
