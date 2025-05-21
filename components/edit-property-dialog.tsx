"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, X, ImageIcon, Check } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProperty } from "@/lib/data"
import type { Property } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().optional(),
  listingAgent: z.string().optional(),
  listingPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  squareFootage: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  bedrooms: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  listingUrl: z.string().url().optional().or(z.literal("")),
  photos: z.any().optional(),
  coverPhotoIndex: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditPropertyDialogProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComplete: () => void
}

export default function EditPropertyDialog({ property, open, onOpenChange, onEditComplete }: EditPropertyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      listingAgent: "",
      listingPrice: "",
      squareFootage: "",
      bedrooms: "",
      listingUrl: "",
      photos: undefined,
      coverPhotoIndex: 0,
    },
  })

  // Update form values when property changes or dialog opens
  useEffect(() => {
    if (property && open) {
      form.reset({
        name: property.name,
        address: property.address || "",
        listingAgent: property.listingAgent || "",
        listingPrice: property.listingPrice?.toString() || "",
        squareFootage: property.squareFootage?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        listingUrl: property.listingUrl || "",
        coverPhotoIndex: property.coverPhotoIndex || 0,
      })
      setExistingPhotos(property.photos || [])
      setSelectedCoverIndex(property.coverPhotoIndex || 0)
    }
  }, [property, open, form])

  function onSubmit(values: FormValues) {
    if (!property) return

    setIsSubmitting(true)

    // Generate URLs for new photo files
    const newPhotoUrls = photoFiles.map((file) => URL.createObjectURL(file))

    // Combine existing and new photos
    const allPhotos = [...existingPhotos, ...newPhotoUrls]

    setTimeout(() => {
      updateProperty(property.id, {
        ...values,
        // Preserve fields that aren't in the form
        listingPdf: property.listingPdf,
        floorplans: property.floorplans,
        rating: property.rating,
        photos: allPhotos,
        coverPhotoIndex: selectedCoverIndex,
      })

      setIsSubmitting(false)
      onEditComplete()
    }, 500)
  }

  function handleRemoveExistingPhoto(index: number) {
    const updatedPhotos = [...existingPhotos]
    updatedPhotos.splice(index, 1)
    setExistingPhotos(updatedPhotos)

    // Update cover photo index if needed
    if (selectedCoverIndex === index) {
      setSelectedCoverIndex(0)
    } else if (selectedCoverIndex > index) {
      setSelectedCoverIndex(selectedCoverIndex - 1)
    }
  }

  function handleSetAsCover(index: number, isNewPhoto = false) {
    const actualIndex = isNewPhoto ? existingPhotos.length + index : index
    setSelectedCoverIndex(actualIndex)
    form.setValue("coverPhotoIndex", actualIndex)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update the details for this property. Click save when you're done.</DialogDescription>
        </DialogHeader>

        {property && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Property Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter property address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="listingAgent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Agent</FormLabel>
                          <FormControl>
                            <Input placeholder="Agent name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="listingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Price (£)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Price" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="squareFootage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Footage</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Area in sq ft" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Number of bedrooms"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="listingUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="photos" className="space-y-4 pt-4">
                  {existingPhotos.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Existing Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingPhotos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square bg-muted rounded-md overflow-hidden border"
                          >
                            <Image
                              src={photo || "/placeholder.svg"}
                              alt={`Property photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSetAsCover(index)}
                                className={selectedCoverIndex === index ? "bg-green-500 hover:bg-green-600" : ""}
                              >
                                {selectedCoverIndex === index ? (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Cover
                                  </>
                                ) : (
                                  "Set as Cover"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveExistingPhoto(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {selectedCoverIndex === index && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Cover
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="photos"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel htmlFor="add-photos">Add New Photos</FormLabel>
                        <FormControl>
                          <div className="mt-1">
                            <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                              <label htmlFor="add-photos" className="cursor-pointer text-center">
                                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Upload Property Photos</span>
                                <span className="text-xs text-muted-foreground block mt-1">
                                  Click to browse (can select multiple)
                                </span>
                                <Input
                                  id="add-photos"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.length) {
                                      const newFiles = Array.from(e.target.files)
                                      setPhotoFiles((prev) => [...prev, ...newFiles])
                                      onChange(newFiles.length > 0 ? newFiles : undefined)
                                    }
                                  }}
                                  {...field}
                                />
                              </label>
                            </div>

                            {photoFiles.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                {photoFiles.map((file, index) => (
                                  <div key={index} className="relative group border rounded-md p-2">
                                    <div className="text-xs truncate mb-2">{file.name}</div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs flex-1"
                                        onClick={() => handleSetAsCover(index, true)}
                                      >
                                        Set as Cover
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const updatedFiles = photoFiles.filter((_, i) => i !== index)
                                          setPhotoFiles(updatedFiles)
                                          onChange(updatedFiles.length > 0 ? updatedFiles : undefined)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
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
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
