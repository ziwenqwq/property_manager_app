import { supabase } from "./client"
import type { Database } from "./database.types"

// Types
export type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  images?: PropertyImage[]
}
export type PropertyImage = Database["public"]["Tables"]["property_images"]["Row"]
export type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  propertyName?: string
}
export type Feedback = Database["public"]["Tables"]["feedback"]["Row"] & {
  propertyName?: string
  media?: FeedbackMedia[]
}
export type FeedbackMedia = Database["public"]["Tables"]["feedback_media"]["Row"]

// Property functions
export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching properties:", error)
    return []
  }

  return data || []
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching property:", error)
    return null
  }

  return {
    ...data,
    images: data.property_images,
  }
}

export async function addProperty(
  propertyData: Omit<Property, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<Property | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...propertyData,
      user_id: userData.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding property:", error)
    return null
  }

  return data
}

export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .update({
      ...propertyData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating property:", error)
    return null
  }

  return data
}

export async function deleteProperty(id: string): Promise<boolean> {
  const { error } = await supabase.from("properties").delete().eq("id", id)

  if (error) {
    console.error("Error deleting property:", error)
    return false
  }

  return true
}

// Property images functions
export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  isFloorplan = false,
): Promise<PropertyImage | null> {
  // 1. Upload the file to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `properties/${propertyId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("property-images").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading image:", uploadError)
    return null
  }

  // 2. Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(filePath)

  // 3. Save the reference in the database
  const { data, error } = await supabase
    .from("property_images")
    .insert({
      property_id: propertyId,
      url: publicUrl,
      is_floorplan: isFloorplan,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving image reference:", error)
    return null
  }

  return data
}

export async function deletePropertyImage(id: string): Promise<boolean> {
  // First get the image to get the URL
  const { data: image, error: fetchError } = await supabase.from("property_images").select("url").eq("id", id).single()

  if (fetchError) {
    console.error("Error fetching image:", fetchError)
    return false
  }

  // Extract the path from the URL
  const url = new URL(image.url)
  const pathWithoutBucket = url.pathname.split("/").slice(2).join("/")

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("property-images").remove([pathWithoutBucket])

  if (storageError) {
    console.error("Error deleting image from storage:", storageError)
    // Continue anyway to delete the database reference
  }

  // Delete from database
  const { error } = await supabase.from("property_images").delete().eq("id", id)

  if (error) {
    console.error("Error deleting image reference:", error)
    return false
  }

  return true
}

// Booking functions
export async function getBookingsByPropertyId(propertyId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      properties(name)
    `)
    .eq("property_id", propertyId)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return data.map((booking) => ({
    ...booking,
    propertyName: booking.properties?.name,
  }))
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      properties(name)
    `)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching all bookings:", error)
    return []
  }

  return data.map((booking) => ({
    ...booking,
    propertyName: booking.properties?.name,
  }))
}

export async function addBooking(
  bookingData: Omit<Booking, "id" | "user_id" | "created_at" | "propertyName">,
): Promise<Booking | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...bookingData,
      user_id: userData.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding booking:", error)
    return null
  }

  return data
}

export async function deleteBooking(id: string): Promise<boolean> {
  const { error } = await supabase.from("bookings").delete().eq("id", id)

  if (error) {
    console.error("Error deleting booking:", error)
    return false
  }

  return true
}

// Feedback functions
export async function getFeedbackByPropertyId(propertyId: string): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return []
  }

  return data.map((feedback) => ({
    ...feedback,
    propertyName: feedback.properties?.name,
    media: feedback.feedback_media,
  }))
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all feedback:", error)
    return []
  }

  return data.map((feedback) => ({
    ...feedback,
    propertyName: feedback.properties?.name,
    media: feedback.feedback_media,
  }))
}

export async function addFeedback(
  feedbackData: Omit<Feedback, "id" | "user_id" | "created_at" | "propertyName" | "media">,
): Promise<Feedback | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      ...feedbackData,
      user_id: userData.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding feedback:", error)
    return null
  }

  return data
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const { error } = await supabase.from("feedback").delete().eq("id", id)

  if (error) {
    console.error("Error deleting feedback:", error)
    return false
  }

  return true
}

// Feedback media functions
export async function uploadFeedbackMedia(
  feedbackId: string,
  file: File,
  mediaType: "image" | "video" | "audio",
): Promise<FeedbackMedia | null> {
  // 1. Upload the file to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `feedback/${feedbackId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage.from("feedback-media").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading media:", uploadError)
    return null
  }

  // 2. Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("feedback-media").getPublicUrl(filePath)

  // 3. Save the reference in the database
  const { data, error } = await supabase
    .from("feedback_media")
    .insert({
      feedback_id: feedbackId,
      url: publicUrl,
      media_type: mediaType,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving media reference:", error)
    return null
  }

  return data
}

export async function deleteFeedbackMedia(id: string): Promise<boolean> {
  // First get the media to get the URL
  const { data: media, error: fetchError } = await supabase.from("feedback_media").select("url").eq("id", id).single()

  if (fetchError) {
    console.error("Error fetching media:", fetchError)
    return false
  }

  // Extract the path from the URL
  const url = new URL(media.url)
  const pathWithoutBucket = url.pathname.split("/").slice(2).join("/")

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("feedback-media").remove([pathWithoutBucket])

  if (storageError) {
    console.error("Error deleting media from storage:", storageError)
    // Continue anyway to delete the database reference
  }

  // Delete from database
  const { error } = await supabase.from("feedback_media").delete().eq("id", id)

  if (error) {
    console.error("Error deleting media reference:", error)
    return false
  }

  return true
}
