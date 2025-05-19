"use client"

import type React from "react"

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
import { useToast } from "@/hooks/use-toast"
import { addProperty, uploadPropertyImage } from "@/lib/supabase/data"

const formSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().optional(),
  listing_agent: z.string().optional(),
  listing_price: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  square_footage: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  bedrooms: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  listing_url: z.string().url().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export default function AddPropertyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propertyImages, setPropertyImages] = useState<File[]>([])
  const [floorplanImages, setFloorplanImages] = useState<File[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      listing_agent: "",
      listing_price: "",
      square_footage: "",
      bedrooms: "",
      listing_url: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // 1. Add the property to the database
      const newProperty = await addProperty(values)

      if (!newProperty) {
        throw new Error("Failed to add property")
      }

      // 2. Upload property images if any
      const propertyImagePromises = propertyImages.map((file) => uploadPropertyImage(newProperty.id, file, false))

      // 3. Upload floorplan images if any
      const floorplanImagePromises = floorplanImages.map((file) => uploadPropertyImage(newProperty.id, file, true))

      // Wait for all uploads to complete
      await Promise.all([...propertyImagePromises, ...floorplanImagePromises])

      toast({
        title: "Success",
        description: "Property added successfully",
      })

      // Navigate to the property detail page
      router.push(`/properties/${newProperty.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePropertyImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPropertyImages((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  function handleFloorplanChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFloorplanImages((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  function removePropertyImage(index: number) {
    setPropertyImages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeFloorplan(index: number) {
    setFloorplanImages((prev) => prev.filter((_, i) => i !== index))
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
            name="listing_agent"
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
            name="listing_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Price" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="square_footage"
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
          name="listing_url"
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
          <div>
            <FormLabel htmlFor="propertyImages">Property Images</FormLabel>
            <div className="mt-1">
              <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                <label htmlFor="propertyImages" className="cursor-pointer text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Upload Property Images</span>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Click to browse (can select multiple)
                  </span>
                  <Input
                    id="propertyImages"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePropertyImageChange}
                  />
                </label>
              </div>

              {propertyImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {propertyImages.map((file, index) => (
                    <div key={index} className="relative border rounded-md p-2">
                      <div className="text-xs truncate">{file.name}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removePropertyImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="floorplans">Floor Plans</FormLabel>
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
                    onChange={handleFloorplanChange}
                  />
                </label>
              </div>

              {floorplanImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {floorplanImages.map((file, index) => (
                    <div key={index} className="relative border rounded-md p-2">
                      <div className="text-xs truncate">{file.name}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeFloorplan(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Adding Property..." : "Add Property"}
        </Button>
      </form>
    </Form>
  )
}
