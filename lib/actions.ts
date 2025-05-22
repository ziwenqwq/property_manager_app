"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import {
  addProperty,
  updateProperty,
  updatePropertyRating,
  addBooking,
  updateBooking,
  addFeedback,
  updateFeedback,
} from "./data"
import { uploadFile, STORAGE_BUCKETS } from "./storage"
import type { Property, Booking, Feedback } from "./types"
import { createServerClient } from "./supabase"

// Property actions
export async function createProperty(
  formData: FormData,
): Promise<{ success: boolean; propertyId?: string; error?: string }> {
  try {
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const listingAgent = formData.get("listingAgent") as string
    const listingPrice = formData.get("listingPrice") ? Number(formData.get("listingPrice")) : undefined
    const squareFootage = formData.get("squareFootage") ? Number(formData.get("squareFootage")) : undefined
    const bedrooms = formData.get("bedrooms") ? Number(formData.get("bedrooms")) : undefined
    const listingUrl = formData.get("listingUrl") as string

    // Handle file uploads
    let listingPdf: string | undefined
    const pdfFile = formData.get("listingPdf") as File
    if (pdfFile && pdfFile.size > 0) {
      const filePath = `${uuidv4()}-${pdfFile.name}`
      listingPdf = await uploadFile(STORAGE_BUCKETS.LISTING_PDFS, filePath, pdfFile)
    }

    // Handle property photos uploads
    const photos: string[] = []
    const photoFiles = formData.getAll("photos") as File[]
    for (const file of photoFiles) {
      if (file && file.size > 0) {
        const filePath = `${uuidv4()}-${file.name}`
        const url = await uploadFile(STORAGE_BUCKETS.PROPERTY_IMAGES, filePath, file)
        if (url) photos.push(url)
      }
    }

    // Handle floorplan uploads
    const floorplans: string[] = []
    const floorplanFiles = formData.getAll("floorplans") as File[]
    for (const file of floorplanFiles) {
      if (file && file.size > 0) {
        const filePath = `${uuidv4()}-${file.name}`
        const url = await uploadFile(STORAGE_BUCKETS.FLOORPLANS, filePath, file)
        if (url) floorplans.push(url)
      }
    }

    const property = await addProperty({
      name,
      address: address || undefined,
      listingAgent: listingAgent || undefined,
      listingPrice,
      squareFootage,
      bedrooms,
      listingUrl: listingUrl || undefined,
      listingPdf,
      floorplans: floorplans.length > 0 ? floorplans : undefined,
      photos: photos.length > 0 ? photos : undefined,
    })

    if (!property) {
      return { success: false, error: "Failed to create property" }
    }

    revalidatePath("/")
    revalidatePath(`/properties/${property.id}`)

    return { success: true, propertyId: property.id }
  } catch (error) {
    console.error("Error creating property:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function editProperty(
  id: string,
  data: Partial<Omit<Property, "id" | "createdAt" | "updatedAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, directly add the floorplans column if it doesn't exist
    const supabase = createServerClient()

    // Check if floorplans column exists
    const { data: columnExists, error: checkError } = await supabase.rpc("check_column_exists", {
      table_name: "properties",
      column_name: "floorplans",
    })

    if (checkError || !columnExists) {
      // Add the floorplans column if it doesn't exist
      await supabase.rpc("execute_sql", {
        sql_query: `
          ALTER TABLE properties ADD COLUMN IF NOT EXISTS floorplans TEXT;
          COMMENT ON COLUMN properties.floorplans IS 'JSON array of floorplan image URLs';
        `,
      })
      console.log("Added floorplans column to properties table")
    }

    // Now update the property
    const property = await updateProperty(id, data)

    if (!property) {
      return { success: false, error: "Failed to update property" }
    }

    revalidatePath("/")
    revalidatePath(`/properties/${id}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating property ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function rateProperty(id: string, rating: number | null): Promise<{ success: boolean; error?: string }> {
  try {
    const property = await updatePropertyRating(id, rating)

    if (!property) {
      return { success: false, error: "Failed to update property rating" }
    }

    revalidatePath("/")
    revalidatePath(`/properties/${id}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating property rating ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Booking actions
export async function createBooking(
  formData: FormData,
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const propertyId = formData.get("propertyId") as string
    const estateAgent = formData.get("estateAgent") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!date || !time) {
      return { success: false, error: "Date and time are required" }
    }

    const booking = await addBooking({
      propertyId,
      date,
      time,
      name: estateAgent || "Unspecified",
      email: "viewing@record.internal", // Default email since it's not in the form
      notes: notes || undefined,
      status: "scheduled", // Default status
    })

    if (!booking) {
      return { success: false, error: "Failed to create booking" }
    }

    revalidatePath("/bookings")
    revalidatePath(`/properties/${propertyId}`)

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function editBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = await updateBooking(id, data)

    if (!booking) {
      return { success: false, error: "Failed to update booking" }
    }

    revalidatePath("/bookings")
    revalidatePath(`/properties/${booking.propertyId}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Feedback actions
export async function createFeedback(
  formData: FormData,
): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
  try {
    const propertyId = formData.get("propertyId") as string
    const text = formData.get("text") as string

    // Handle file uploads
    const images: string[] = []
    const imageFiles = formData.getAll("images") as File[]
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const filePath = `${uuidv4()}-${file.name}`
        const url = await uploadFile(STORAGE_BUCKETS.FEEDBACK_IMAGES, filePath, file)
        if (url) images.push(url)
      }
    }

    let video: string | undefined
    const videoFile = formData.get("video") as File
    if (videoFile && videoFile.size > 0) {
      const filePath = `${uuidv4()}-${videoFile.name}`
      video = await uploadFile(STORAGE_BUCKETS.FEEDBACK_VIDEOS, filePath, videoFile)
    }

    let audio: string | undefined
    const audioFile = formData.get("audio") as File
    if (audioFile && audioFile.size > 0) {
      const filePath = `${uuidv4()}-${audioFile.name}`
      audio = await uploadFile(STORAGE_BUCKETS.FEEDBACK_AUDIO, filePath, audioFile)
    }

    const feedback = await addFeedback({
      propertyId,
      text,
      images: images.length > 0 ? images : undefined,
      video,
      audio,
    })

    if (!feedback) {
      return { success: false, error: "Failed to create feedback" }
    }

    revalidatePath("/feedback")
    revalidatePath(`/properties/${propertyId}`)

    return { success: true, feedbackId: feedback.id }
  } catch (error) {
    console.error("Error creating feedback:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function editFeedback(
  id: string,
  data: Partial<Omit<Feedback, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const feedback = await updateFeedback(id, data)

    if (!feedback) {
      return { success: false, error: "Failed to update feedback" }
    }

    revalidatePath("/feedback")
    revalidatePath(`/properties/${feedback.propertyId}`)

    return { success: true }
  } catch (error) {
    console.error(`Error updating feedback ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete property
export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Delete the property (cascade will handle related records)
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting property ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting property ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete booking
export async function deleteBooking(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Get the property ID before deleting for path revalidation
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("property_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error(`Error fetching booking ${id}:`, fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the booking
    const { error } = await supabase.from("bookings").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting booking ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/bookings")
    if (booking?.property_id) {
      revalidatePath(`/properties/${booking.property_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting booking ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete feedback
export async function deleteFeedback(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Get the property ID before deleting for path revalidation
    const { data: feedback, error: fetchError } = await supabase
      .from("feedback")
      .select("property_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error(`Error fetching feedback ${id}:`, fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the feedback (this will cascade to feedback_media)
    const { error } = await supabase.from("feedback").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting feedback ${id}:`, error)
      return { success: false, error: error.message }
    }

    revalidatePath("/feedback")
    if (feedback?.property_id) {
      revalidatePath(`/properties/${feedback.property_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting feedback ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete file (all file types including property files)
export async function deleteFile(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Check if the ID is a composite ID for images, videos, or audio in the PropertyFeedback component
    if (id.startsWith("image-") || id.startsWith("video-") || id.startsWith("audio-")) {
      const parts = id.split("-")
      const mediaType = parts[0] // 'image', 'video', or 'audio'
      const feedbackId = parts[1]
      const index = parts[2] // Only for images

      // Get the feedback to find the property ID
      const { data: feedback, error: feedbackError } = await supabase
        .from("feedback")
        .select("property_id, text, images, video, audio")
        .eq("id", feedbackId)
        .single()

      if (feedbackError) {
        console.error(`Error fetching feedback ${feedbackId}:`, feedbackError)
        return { success: false, error: feedbackError.message }
      }

      // Update the feedback based on the media type
      const updateData: any = {}

      if (mediaType === "image" && feedback.images) {
        // Remove the image at the specified index
        const images = Array.isArray(feedback.images) ? [...feedback.images] : []
        if (images.length > Number(index)) {
          images.splice(Number(index), 1)
          updateData.images = images.length > 0 ? images : null
        }
      } else if (mediaType === "video") {
        updateData.video = null
      } else if (mediaType === "audio") {
        updateData.audio = null
      }

      // Update the feedback
      const { error: updateError } = await supabase.from("feedback").update(updateData).eq("id", feedbackId)

      if (updateError) {
        console.error(`Error updating feedback ${feedbackId}:`, updateError)
        return { success: false, error: updateError.message }
      }

      // Revalidate paths
      revalidatePath(`/properties/${feedback.property_id}`)
      revalidatePath(`/feedback`)

      return { success: true }
    }

    // Handle property file deletion (photos, floorplans, PDFs)
    if (id.startsWith("photo-") || id.startsWith("floorplan-") || id.startsWith("listing-pdf")) {
      // Extract property ID from the URL or use a different approach
      // For now, we'll need to get the property ID from the current context
      // Since we don't have direct access to propertyId here, we'll need to modify the approach

      // Parse the file ID to determine the type and index
      let fileType: string
      let fileIndex: number | null = null
      const propertyId: string | null = null

      if (id.startsWith("photo-")) {
        fileType = "photo"
        fileIndex = Number.parseInt(id.split("-")[1])
      } else if (id.startsWith("floorplan-")) {
        fileType = "floorplan"
        fileIndex = Number.parseInt(id.split("-")[1])
      } else if (id.startsWith("listing-pdf")) {
        fileType = "pdf"
      } else {
        return { success: false, error: "Invalid file ID format" }
      }

      // We need to find the property that contains this file
      // This is a limitation of the current approach - we need the property ID
      // For now, let's return an error asking for a different approach
      return { success: false, error: "Property file deletion requires property context" }
    }

    // Regular file deletion from feedback_media table
    // Get the feedback ID and property ID before deleting for path revalidation
    const { data: media, error: fetchError } = await supabase
      .from("feedback_media")
      .select("feedback_id, feedback(property_id)")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error(`Error fetching media ${id}:`, fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the media
    const { error } = await supabase.from("feedback_media").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting media ${id}:`, error)
      return { success: false, error: error.message }
    }

    // Revalidate paths
    if (media?.feedback?.property_id) {
      revalidatePath(`/properties/${media.feedback.property_id}`)
    }
    if (media?.feedback_id) {
      revalidatePath(`/feedback`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error deleting media ${id}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// New function specifically for property file deletion
export async function deletePropertyFile(
  propertyId: string,
  fileId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Get the current property data
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("property_photos, floorplans, listing_pdf")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error(`Error fetching property ${propertyId}:`, propertyError)
      return { success: false, error: propertyError.message }
    }

    const updateData: any = {}

    // Handle different file types
    if (fileId.startsWith("photo-")) {
      const index = Number.parseInt(fileId.split("-")[1])
      if (property.property_photos) {
        let photos = []
        try {
          if (typeof property.property_photos === "string") {
            photos = JSON.parse(property.property_photos)
          } else if (Array.isArray(property.property_photos)) {
            photos = [...property.property_photos]
          }

          if (photos.length > index) {
            photos.splice(index, 1)
            updateData.property_photos = photos.length > 0 ? JSON.stringify(photos) : null
          }
        } catch (e) {
          console.error("Error parsing property photos:", e)
          return { success: false, error: "Error parsing property photos" }
        }
      }
    } else if (fileId.startsWith("floorplan-")) {
      const index = Number.parseInt(fileId.split("-")[1])
      if (property.floorplans) {
        let floorplans = []
        try {
          if (typeof property.floorplans === "string") {
            floorplans = JSON.parse(property.floorplans)
          } else if (Array.isArray(property.floorplans)) {
            floorplans = [...property.floorplans]
          }

          if (floorplans.length > index) {
            floorplans.splice(index, 1)
            updateData.floorplans = floorplans.length > 0 ? JSON.stringify(floorplans) : null
          }
        } catch (e) {
          console.error("Error parsing floorplans:", e)
          return { success: false, error: "Error parsing floorplans" }
        }
      }
    } else if (fileId.startsWith("listing-pdf")) {
      updateData.listing_pdf = null
    } else {
      return { success: false, error: "Invalid file type" }
    }

    // Update the property
    const { error: updateError } = await supabase.from("properties").update(updateData).eq("id", propertyId)

    if (updateError) {
      console.error(`Error updating property ${propertyId}:`, updateError)
      return { success: false, error: updateError.message }
    }

    // Revalidate paths
    revalidatePath(`/properties/${propertyId}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error(`Error deleting property file ${fileId}:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
