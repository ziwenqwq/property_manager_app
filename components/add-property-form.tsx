"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProperty } from "@/lib/actions"
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
  listingPdf: z.any().optional(),
  floorplans: z.any().optional(),
  photos: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function AddPropertyForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [floorplanFiles, setFloorplanFiles] = useState<File[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

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
      listingPdf: undefined,
      floorplans: undefined,
      photos: undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData()
      formData.append("name", values.name)
      if (values.address) formData.append("address", values.address)
      if (values.listingAgent) formData.append("listingAgent", values.listingAgent)
      if (values.listingPrice) formData.append("listingPrice", values.listingPrice.toString())
      if (values.squareFootage) formData.append("squareFootage", values.squareFootage.toString())
      if (values.bedrooms) formData.append("bedrooms", values.bedrooms.toString())
      if (values.listingUrl) formData.append("listingUrl", values.listingUrl)

      // Add files
      if (pdfFile) formData.append("listingPdf", pdfFile)

      floorplanFiles.forEach((file) => {
        formData.append("floorplans", file)
      })

      photoFiles.forEach((file) => {
        formData.append("photos", file)
      })

      const result = await createProperty(formData)

      if (result.success && result.propertyId) {
        toast({
          title: "Property added successfully",
          description: "Your property has been added to the system.",
        })
        router.push(`/properties/${result.propertyId}`)
        router.refresh()
      } else {
        toast({
          title: "Error adding property",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error adding property",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input type="number" placeholder="Number of bedrooms" {...field} value={field.value || ""} />
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
              <FormDescription>Optional link to the property listing</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {/* Property Photos Upload */}
          <FormField
            control={form.control}
            name="photos"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel htmlFor="photos">Property Photos</FormLabel>
                <FormControl>
                  <div className="mt-1">
                    <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                      <label htmlFor="photos" className="cursor-pointer text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload Property Photos</span>
                        <span className="text-xs text-muted-foreground block mt-1">
                          Click to browse (can select multiple)
                        </span>
                        <Input
                          id="photos"
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {photoFiles.map((file, index) => (
                          <div key={index} className="relative border rounded-md p-2">
                            <div className="text-xs truncate">{file.name}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                const updatedFiles = photoFiles.filter((_, i) => i !== index)
                                setPhotoFiles(updatedFiles)
                                onChange(updatedFiles)
                              }}
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

          <FormField
            control={form.control}
            name="listingPdf"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel htmlFor="listingPdf">Listing PDF</FormLabel>
                <FormControl>
                  <div className="mt-1">
                    {pdfFile ? (
                      <div className="flex items-center p-2 border rounded-md">
                        <span className="flex-1 truncate">{pdfFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPdfFile(null)
                            onChange(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                        <label htmlFor="listingPdf" className="cursor-pointer text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Upload PDF</span>
                          <span className="text-xs text-muted-foreground block mt-1">Click to browse</span>
                          <Input
                            id="listingPdf"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setPdfFile(file)
                              onChange(file || undefined)
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

          <FormField
            control={form.control}
            name="floorplans"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel htmlFor="floorplans">Floor Plans</FormLabel>
                <FormControl>
                  <div className="mt-1">
                    <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                      <label htmlFor="floorplans" className="cursor-pointer text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload Floor Plans</span>
                        <span className="text-xs text-muted-foreground block mt-1">
                          Click to browse (can select multiple)
                        </span>
                        <Input
                          id="floorplans"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              const newFiles = Array.from(e.target.files)
                              setFloorplanFiles((prev) => [...prev, ...newFiles])
                              onChange(newFiles.length > 0 ? newFiles : undefined)
                            }
                          }}
                          {...field}
                        />
                      </label>
                    </div>

                    {floorplanFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {floorplanFiles.map((file, index) => (
                          <div key={index} className="relative border rounded-md p-2">
                            <div className="text-xs truncate">{file.name}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                const updatedFiles = floorplanFiles.filter((_, i) => i !== index)
                                setFloorplanFiles(updatedFiles)
                                onChange(updatedFiles)
                              }}
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
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Adding Property..." : "Add Property"}
        </Button>
      </form>
    </Form>
  )
}
