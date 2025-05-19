"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { MessageSquare, ImageIcon, Video, Mic, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { Feedback, FeedbackMedia } from "@/lib/supabase/data"

export default function PropertyFeedback({ propertyId }: { propertyId: string }) {
  const [feedback, setFeedback] = useState<(Feedback & { media?: FeedbackMedia[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFeedback()
  }, [propertyId])

  async function loadFeedback() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          *,
          feedback_media(*)
        `)
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFeedback(
        data.map((item) => ({
          ...item,
          media: item.feedback_media,
        })) || [],
      )
    } catch (error) {
      console.error("Error loading feedback:", error)
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-muted-foreground">Be the first to leave notes for this property</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Notes</h3>
      <div className="grid gap-4">
        {feedback.map((item) => {
          // Group media by type
          const images = item.media?.filter((m) => m.media_type === "image") || []
          const videos = item.media?.filter((m) => m.media_type === "video") || []
          const audio = item.media?.filter((m) => m.media_type === "audio") || []

          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">Notes</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <p className="text-sm mb-4">{item.text}</p>

                {(images.length > 0 || videos.length > 0 || audio.length > 0) && (
                  <Tabs
                    defaultValue={images.length > 0 ? "images" : videos.length > 0 ? "video" : "audio"}
                    className="mt-4"
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="images" disabled={images.length === 0}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Images
                      </TabsTrigger>
                      <TabsTrigger value="video" disabled={videos.length === 0}>
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="audio" disabled={audio.length === 0}>
                        <Mic className="h-4 w-4 mr-2" />
                        Audio
                      </TabsTrigger>
                    </TabsList>

                    {images.length > 0 && (
                      <TabsContent value="images" className="mt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {images.map((image) => (
                            <div key={image.id} className="aspect-square relative bg-muted rounded-md overflow-hidden">
                              <Image
                                src={image.url || "/placeholder.svg"}
                                alt="Feedback image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}

                    {videos.length > 0 && (
                      <TabsContent value="video" className="mt-2">
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <video src={videos[0].url} controls className="w-full h-full" />
                        </div>
                      </TabsContent>
                    )}

                    {audio.length > 0 && (
                      <TabsContent value="audio" className="mt-2">
                        <div className="border rounded-md p-2">
                          <audio src={audio[0].url} controls className="w-full" />
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
