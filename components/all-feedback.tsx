"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { MessageSquare, Home, ImageIcon, Video, Mic, Edit } from "lucide-react"
import EditFeedbackDialog from "@/components/edit-feedback-dialog"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getAllFeedback } from "@/lib/data"
import type { Feedback } from "@/lib/types"

export default function AllFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    setFeedback(getAllFeedback())
  }, [])

  const handleEditComplete = () => {
    setIsEditDialogOpen(false)
    setEditingFeedback(null)
    // Refresh the feedback list
    setFeedback(getAllFeedback())
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
        <p className="text-muted-foreground mb-4">Add feedback for one of your properties</p>
        <Button asChild>
          <Link href="/">Browse Properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {feedback.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <Link href={`/properties/${item.propertyId}`} className="font-medium hover:underline">
                  {item.propertyName}
                </Link>
              </div>
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
                            src="/placeholder.svg?height=200&width=200"
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
            </div>
          </CardContent>
        </Card>
      ))}
      <EditFeedbackDialog
        feedback={editingFeedback}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEditComplete={handleEditComplete}
      />
    </div>
  )
}
