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
  getPropertyById,
} from "./data"
import { uploadFile, STORAGE_BUCKETS, deleteFile as deleteStorageFile } from "./storage"
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

    const booking = await addBooking({
      propertyId,
      date,
      time,
      name: estateAgent || "Unspecified",
      email: "viewing@record.internal",
      notes: notes || undefined,
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

// Delete file (feedback media)
export async function deleteFile(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()

    // Get the feedback ID and property ID before deleting for path revalidation
    const { data: media, error: fetchError } = await supabase
      .from("feedback_media")
      .select("feedback_id, feedback(property_id), media_url")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error(`Error fetching media ${id}:`, fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the file from storage
    if (media?.media_url) {
      try {
        // Extract the bucket and file path from the URL
        const url = new URL(media.media_url)
        const pathParts = url.pathname.split("/")
        const bucket = pathParts[1] // The bucket name is usually the first part after the domain
        const filePath = pathParts.slice(2).join("/") // The rest is the file path

        // Delete from storage
        await deleteStorageFile(bucket, filePath)
      } catch (storageError) {
        console.error(`Error deleting file from storage:`, storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the media record from the database
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

// Helper function to extract file path from URL
function extractFilePathFromUrl(url: string): { bucket: string; filePath: string } | null {
  try {
    // Parse the URL
    const parsedUrl = new URL(url)

    // Extract the path parts
    const pathParts = parsedUrl.pathname.split("/")

    // The bucket is typically the first part after the domain
    // For example: https://qyqebpdepqrevtsbivjr.supabase.co/storage/v1/object/public/property-images/file.jpg
    // The bucket would be "property-images"

    // Find the index of "public" in the path
    const publicIndex = pathParts.findIndex((part) => part === "public")

    if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
      const bucket = pathParts[publicIndex + 1]
      const filePath = pathParts.slice(publicIndex + 2).join("/")
      return { bucket, filePath }
    }

    return null
  } catch (error) {
    console.error("Error extracting file path from URL:", error)
    return null
  }
}

// New actions for deleting property files

// Delete property photo
export async function deletePropertyPhoto(
  propertyId: string,
  photoIndex: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current property
    const property = await getPropertyById(propertyId)
    if (!property) {
      return { success: false, error: "Property not found" }
    }

    // Get the current photos
    const photos = property.photos || []

    // Check if the index is valid
    if (photoIndex < 0 || photoIndex >= photos.length) {
      return { success: false, error: "Invalid photo index" }
    }

    // Get the photo URL to delete
    const photoUrl = photos[photoIndex]

    // Delete the file from storage
    try {
      const fileInfo = extractFilePathFromUrl(photoUrl)
      if (fileInfo) {
        await deleteStorageFile(fileInfo.bucket, fileInfo.filePath)
        console.log(`Deleted photo from storage: ${fileInfo.bucket}/${fileInfo.filePath}`)
      }
    } catch (storageError) {
      console.error(`Error deleting photo from storage:`, storageError)
      // Continue with database update even if storage deletion fails
    }

    // Remove the photo at the specified index
    const updatedPhotos = [...photos]
    updatedPhotos.splice(photoIndex, 1)

    // Update the property
    const result = await editProperty(propertyId, { photos: updatedPhotos })
    if (!result.success) {
      return { success: false, error: result.error || "Failed to update property" }
    }

    // Force a hard refresh
    revalidatePath(`/properties/${propertyId}`)

    return { success: true }
  } catch (error) {
    console.error(`Error deleting property photo:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete property floorplan
export async function deletePropertyFloorplan(
  propertyId: string,
  floorplanIndex: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current property
    const property = await getPropertyById(propertyId)
    if (!property) {
      return { success: false, error: "Property not found" }
    }

    // Get the current floorplans
    const floorplans = property.floorplans || []

    // Check if the index is valid
    if (floorplanIndex < 0 || floorplanIndex >= floorplans.length) {
      return { success: false, error: "Invalid floorplan index" }
    }

    // Get the floorplan URL to delete
    const floorplanUrl = floorplans[floorplanIndex]

    // Delete the file from storage
    try {
      const fileInfo = extractFilePathFromUrl(floorplanUrl)
      if (fileInfo) {
        await deleteStorageFile(fileInfo.bucket, fileInfo.filePath)
        console.log(`Deleted floorplan from storage: ${fileInfo.bucket}/${fileInfo.filePath}`)
      }
    } catch (storageError) {
      console.error(`Error deleting floorplan from storage:`, storageError)
      // Continue with database update even if storage deletion fails
    }

    // Remove the floorplan at the specified index
    const updatedFloorplans = [...floorplans]
    updatedFloorplans.splice(floorplanIndex, 1)

    // Update the property in the database
    const supabase = createServerClient()
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        floorplans: updatedFloorplans.length > 0 ? JSON.stringify(updatedFloorplans) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)

    if (updateError) {
      console.error(`Error updating property floorplans in database:`, updateError)
      return { success: false, error: updateError.message }
    }

    // Force a hard refresh
    revalidatePath(`/properties/${propertyId}`)

    return { success: true }
  } catch (error) {
    console.error(`Error deleting property floorplan:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Delete property listing PDF
export async function deletePropertyListingPdf(propertyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the current property
    const property = await getPropertyById(propertyId)
    if (!property) {
      return { success: false, error: "Property not found" }
    }

    // Get the listing PDF URL
    const pdfUrl = property.listingPdf

    if (!pdfUrl) {
      return { success: false, error: "No listing PDF found" }
    }

    // Delete the file from storage
    try {
      const fileInfo = extractFilePathFromUrl(pdfUrl)
      if (fileInfo) {
        await deleteStorageFile(fileInfo.bucket, fileInfo.filePath)
        console.log(`Deleted listing PDF from storage: ${fileInfo.bucket}/${fileInfo.filePath}`)
      }
    } catch (storageError) {
      console.error(`Error deleting listing PDF from storage:`, storageError)
      // Continue with database update even if storage deletion fails
    }

    // Update the property in the database
    const supabase = createServerClient()
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        listing_pdf: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)

    if (updateError) {
      console.error(`Error updating property listing PDF in database:`, updateError)
      return { success: false, error: updateError.message }
    }

    // Force a hard refresh
    revalidatePath(`/properties/${propertyId}`)

    return { success: true }
  } catch (error) {
    console.error(`Error deleting property listing PDF:`, error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
