"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { MessageSquare, Home, ImageIcon, Video, Mic, Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getAllFeedback, type Feedback } from "@/lib/supabase/data"

export default function AllFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFeedback()
  }, [])

  async function loadFeedback() {
    setIsLoading(true)
    try {
      const data = await getAllFeedback()
      setFeedback(data)
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
      <div className="text-center py-12 border rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-muted-foreground mb-4">Add notes for one of your properties</p>
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
                <Link href={`/properties/${item.property_id}`} className="font-medium hover:underline">
                  {item.propertyName}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground">{format(new Date(item.created_at), "MMM d, yyyy")}</div>
            </div>

            <p className="text-sm mb-4">{item.text}</p>

            {item.media && item.media.length > 0 && (
              <Tabs defaultValue="images" className="mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="images" disabled={!item.media.some((m) => m.media_type === "image")}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger value="video" disabled={!item.media.some((m) => m.media_type === "video")}>
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" disabled={!item.media.some((m) => m.media_type === "audio")}>
                    <Mic className="h-4 w-4 mr-2" />
                    Audio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="images" className="mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {item.media
                      .filter((m) => m.media_type === "image")
                      .map((image) => (
                        <div key={image.id} className="aspect-square relative bg-muted rounded-md overflow-hidden">
                          <Image
                            src={image.url || "/placeholder.svg?height=200&width=200"}
                            alt="Feedback image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-2">
                  {item.media
                    .filter((m) => m.media_type === "video")
                    .map((video) => (
                      <div key={video.id} className="aspect-video bg-muted rounded-md overflow-hidden">
                        <video src={video.url} controls className="w-full h-full" />
                      </div>
                    ))}
                </TabsContent>

                <TabsContent value="audio" className="mt-2">
                  {item.media
                    .filter((m) => m.media_type === "audio")
                    .map((audio) => (
                      <div key={audio.id} className="border rounded-md p-2">
                        <audio src={audio.url} controls className="w-full" />
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
