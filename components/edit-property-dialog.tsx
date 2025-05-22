"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, X, Upload, File, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { editProperty } from "@/lib/actions"
import { uploadFile, STORAGE_BUCKETS } from "@/lib/storage"
import type { Property } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"

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
  floorplans: z.any().optional(),
  listingPdf: z.any().optional(),
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
  const [activeTab, setActiveTab] = useState("details")
  const [listingPdfFile, setListingPdfFile] = useState<File | null>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [floorplanFiles, setFloorplanFiles] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [existingFloorplans, setExistingFloorplans] = useState<string[]>([])
  const [existingListingPdf, setExistingListingPdf] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const floorplanInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
      floorplans: undefined,
      listingPdf: undefined,
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
        photos: property.photos || [],
        floorplans: property.floorplans || [],
        listingPdf: property.listingPdf || null,
      })

      // Set existing files
      setExistingPhotos(property.photos || [])
      setExistingFloorplans(property.floorplans || [])
      setExistingListingPdf(property.listingPdf || null)
    }
  }, [property, open, form])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFiles(Array.from(e.target.files))
    }
  }

  const handleFloorplanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFloorplanFiles(Array.from(e.target.files))
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setListingPdfFile(e.target.files[0])
      form.setValue("listingPdf", e.target.files[0])
    }
  }

  const removeExistingPhoto = (index: number) => {
    const updatedPhotos = existingPhotos.filter((_, i) => i !== index)
    setExistingPhotos(updatedPhotos)
    form.setValue("photos", updatedPhotos)
  }

  const removeExistingFloorplan = (index: number) => {
    const updatedFloorplans = existingFloorplans.filter((_, i) => i !== index)
    setExistingFloorplans(updatedFloorplans)
    form.setValue("floorplans", updatedFloorplans)
  }

  const removeExistingPdf = () => {
    setExistingListingPdf(null)
    form.setValue("listingPdf", null)
  }

  async function onSubmit(values: FormValues) {
    if (!property) return

    setIsSubmitting(true)

    try {
      // Upload new files if any
      let newListingPdf = existingListingPdf
      const newPhotos = [...existingPhotos] // Start with existing photos
      const newFloorplans = [...existingFloorplans] // Start with existing floorplans

      // Handle listing PDF upload
      if (listingPdfFile) {
        const filePath = `${uuidv4()}-${listingPdfFile.name}`
        const pdfUrl = await uploadFile(STORAGE_BUCKETS.LISTING_PDFS, filePath, listingPdfFile)
        if (pdfUrl) {
          newListingPdf = pdfUrl
        }
      }

      // Handle photo uploads - only add new photos, don't duplicate existing ones
      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          const filePath = `${uuidv4()}-${file.name}`
          const photoUrl = await uploadFile(STORAGE_BUCKETS.PROPERTY_IMAGES, filePath, file)
          if (photoUrl) {
            newPhotos.push(photoUrl)
          }
        }
      }

      // Handle floorplan uploads - only add new floorplans, don't duplicate existing ones
      if (floorplanFiles.length > 0) {
        for (const file of floorplanFiles) {
          const filePath = `${uuidv4()}-${file.name}`
          const floorplanUrl = await uploadFile(STORAGE_BUCKETS.FLOORPLANS, filePath, file)
          if (floorplanUrl) {
            newFloorplans.push(floorplanUrl)
          }
        }
      }

      console.log("Submitting property update with:", {
        ...values,
        listingPdf: newListingPdf || undefined,
        photos: newPhotos,
        floorplans: newFloorplans,
      })

      // Update property with form values and new files
      const result = await editProperty(property.id, {
        ...values,
        listingPdf: newListingPdf || undefined,
        photos: newPhotos,
        floorplans: newFloorplans,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Property updated successfully",
        })

        // Clear file states to prevent duplicate uploads on subsequent edits
        setPhotoFiles([])
        setFloorplanFiles([])
        setListingPdfFile(null)

        // Close the dialog
        onOpenChange(false)

        // Refresh the page to show the updated data
        router.refresh()

        // Call the onEditComplete callback
        onEditComplete()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update property",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update the details for this property. Click save when you're done.</DialogDescription>
        </DialogHeader>

        {property && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 pt-4">
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

                <TabsContent value="photos" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="photos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Photos</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => photoInputRef.current?.click()}
                                className="w-full"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Photos
                              </Button>
                              <Input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handlePhotoChange}
                              />
                            </div>
                            {photoFiles.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">New Photos to Upload:</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {Array.from(photoFiles).map((file, index) => (
                                    <div key={index} className="relative">
                                      <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                        <img
                                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                                          alt={`New photo ${index + 1}`}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={() => {
                                          setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
                                          const newFiles = photoFiles.filter((_, i) => i !== index)
                                          field.onChange(newFiles.length > 0 ? newFiles : undefined)
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {existingPhotos.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Existing Photos:</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {existingPhotos.map((url, index) => (
                                    <div key={index} className="relative">
                                      <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                        <img
                                          src={url || "/placeholder.svg"}
                                          alt={`Existing photo ${index + 1}`}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={() => {
                                          removeExistingPhoto(index)
                                          const newPhotos = existingPhotos.filter((_, i) => i !== index)
                                          field.onChange(newPhotos.length > 0 ? newPhotos : undefined)
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 pt-4">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="listingPdf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing PDF</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => pdfInputRef.current?.click()}
                                  className="w-full"
                                >
                                  <File className="mr-2 h-4 w-4" />
                                  Upload Listing PDF
                                </Button>
                                <Input
                                  ref={pdfInputRef}
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={handlePdfChange}
                                />
                              </div>
                              {listingPdfFile && (
                                <div className="mt-4 flex items-center justify-between p-3 border rounded-md">
                                  <div className="flex items-center">
                                    <File className="h-5 w-5 mr-2 text-blue-500" />
                                    <span className="text-sm truncate max-w-[200px]">{listingPdfFile.name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setListingPdfFile(null)
                                      field.onChange(null)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {existingListingPdf && !listingPdfFile && (
                                <div className="mt-4 flex items-center justify-between p-3 border rounded-md">
                                  <div className="flex items-center">
                                    <File className="h-5 w-5 mr-2 text-blue-500" />
                                    <span className="text-sm truncate max-w-[200px]">
                                      {existingListingPdf.split("/").pop() || "Listing PDF"}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => window.open(existingListingPdf, "_blank")}
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        removeExistingPdf()
                                        field.onChange(null)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floorplans"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor Plans</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => floorplanInputRef.current?.click()}
                                  className="w-full"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Floor Plans
                                </Button>
                                <Input
                                  ref={floorplanInputRef}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={handleFloorplanChange}
                                />
                              </div>
                              {floorplanFiles.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">New Floor Plans to Upload:</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Array.from(floorplanFiles).map((file, index) => (
                                      <div key={index} className="relative">
                                        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                          <img
                                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                                            alt={`New floor plan ${index + 1}`}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute -top-2 -right-2 h-6 w-6"
                                          onClick={() => {
                                            setFloorplanFiles((prev) => prev.filter((_, i) => i !== index))
                                            const newFiles = floorplanFiles.filter((_, i) => i !== index)
                                            field.onChange(newFiles.length > 0 ? newFiles : undefined)
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {existingFloorplans.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Existing Floor Plans:</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {existingFloorplans.map((url, index) => (
                                      <div key={index} className="relative">
                                        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                          <img
                                            src={url || "/placeholder.svg"}
                                            alt={`Existing floor plan ${index + 1}`}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute -top-2 -right-2 h-6 w-6"
                                          onClick={() => {
                                            removeExistingFloorplan(index)
                                            const newFloorplans = existingFloorplans.filter((_, i) => i !== index)
                                            field.onChange(newFloorplans.length > 0 ? newFloorplans : undefined)
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
