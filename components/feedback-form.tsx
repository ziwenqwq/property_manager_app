"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X, ImageIcon, Video, Mic } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addFeedback } from "@/lib/data"

const formSchema = z.object({
  text: z.string().min(1, "Feedback text is required"),
  images: z.any().optional(),
  video: z.any().optional(),
  audio: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function FeedbackForm({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      images: undefined,
      video: undefined,
      audio: undefined,
    },
  })

  function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    // In a real app, you would upload files here
    // For this demo, we'll just simulate the process

    setTimeout(() => {
      addFeedback({
        ...values,
        propertyId,
        images: imageFiles.length > 0 ? imageFiles.map((f) => URL.createObjectURL(f)) : undefined,
        video: videoFile ? URL.createObjectURL(videoFile) : undefined,
        audio: audioFile ? URL.createObjectURL(audioFile) : audioURL,
      })

      setIsSubmitting(false)
      form.reset()
      setImageFiles([])
      setVideoFile(null)
      setAudioFile(null)
      setAudioURL(null)
      router.refresh()

      // Force a refresh of the page to show the new feedback immediately
      window.location.reload()
    }, 1000)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImageFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        form.setValue("audio", audioBlob) // Update the form value

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      // The form value will be updated in the onstop callback when audioURL is set
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts about this property..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Tabs defaultValue="images">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Mic className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                        <label htmlFor="images" className="cursor-pointer text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Upload Images</span>
                          <span className="text-xs text-muted-foreground block mt-1">
                            Click to browse (can select multiple)
                          </span>
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                const newFiles = Array.from(e.target.files)
                                setImageFiles((prev) => [...prev, ...newFiles])
                                onChange(newFiles)
                              }
                            }}
                            {...field}
                          />
                        </label>
                      </div>

                      {imageFiles.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative border rounded-md p-2">
                              <div className="text-xs truncate">{file.name}</div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="video" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="video"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      {videoFile ? (
                        <div className="flex items-center p-2 border rounded-md">
                          <span className="flex-1 truncate">{videoFile.name}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setVideoFile(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                          <label htmlFor="video" className="cursor-pointer text-center">
                            <Video className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">Upload Video</span>
                            <span className="text-xs text-muted-foreground block mt-1">Click to browse</span>
                            <Input
                              id="video"
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setVideoFile(e.target.files[0])
                                  onChange(e.target.files[0])
                                }
                              }}
                              {...field}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="audio"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        {audioURL ? (
                          <div className="border rounded-md p-2">
                            <audio src={audioURL} controls className="w-full" />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => {
                                setAudioURL(null)
                                onChange(null)
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove Recording
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant={isRecording ? "destructive" : "outline"}
                              onClick={isRecording ? stopRecording : startRecording}
                            >
                              <Mic className="h-4 w-4 mr-2" />
                              {isRecording ? "Stop Recording" : "Record Audio"}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="text-center text-sm text-muted-foreground">or</div>

                      {audioFile ? (
                        <div className="flex items-center p-2 border rounded-md">
                          <span className="flex-1 truncate">{audioFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAudioFile(null)
                              onChange(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                          <label htmlFor="audio" className="cursor-pointer text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">Upload Audio</span>
                            <span className="text-xs text-muted-foreground block mt-1">Click to browse</span>
                            <Input
                              id="audio"
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setAudioFile(e.target.files[0])
                                  onChange(e.target.files[0])
                                }
                              }}
                              {...field}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Form>
  )
}
