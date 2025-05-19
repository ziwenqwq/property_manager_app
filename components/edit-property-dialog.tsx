"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { updateProperty } from "@/lib/supabase/data"
import type { Property } from "@/lib/supabase/data"

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

interface EditPropertyDialogProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComplete: () => void
}

export default function EditPropertyDialog({ property, open, onOpenChange, onEditComplete }: EditPropertyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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

  // Update form values when property changes or dialog opens
  useEffect(() => {
    if (property && open) {
      form.reset({
        name: property.name || "",
        address: property.address || "",
        listing_agent: property.listing_agent || "",
        listing_price: property.listing_price ? property.listing_price.toString() : "",
        square_footage: property.square_footage ? property.square_footage.toString() : "",
        bedrooms: property.bedrooms ? property.bedrooms.toString() : "",
        listing_url: property.listing_url || "",
      })
    }
  }, [property, open, form])

  async function onSubmit(values: FormValues) {
    if (!property) return

    setIsSubmitting(true)

    try {
      const updatedProperty = await updateProperty(property.id, values)

      if (!updatedProperty) {
        throw new Error("Failed to update property")
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
      })

      onEditComplete()
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                      <Textarea placeholder="Enter property address" {...field} value={field.value || ""} />
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
                        <Input placeholder="Agent name" {...field} value={field.value || ""} />
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
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
