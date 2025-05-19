import { v4 as uuidv4 } from "uuid"
import { supabase } from "./client"
import * as oldData from "../data"
import type { Property as OldProperty, Booking as OldBooking, Feedback as OldFeedback } from "../types"

export async function migrateData() {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("You must be logged in to migrate data")
    }

    const userId = userData.user.id

    // 1. Migrate properties
    const oldProperties = oldData.getProperties()
    for (const oldProperty of oldProperties) {
      await migrateProperty(oldProperty, userId)
    }

    return { success: true, message: "Data migration completed successfully" }
  } catch (error: any) {
    console.error("Migration error:", error)
    return { success: false, message: error.message || "Migration failed" }
  }
}

async function migrateProperty(oldProperty: OldProperty, userId: string) {
  // 1. Insert the property
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .insert({
      id: oldProperty.id, // Keep the same ID
      user_id: userId,
      name: oldProperty.name,
      address: oldProperty.address || null,
      listing_agent: oldProperty.listingAgent || null,
      listing_price: oldProperty.listingPrice || null,
      square_footage: oldProperty.squareFootage || null,
      bedrooms: oldProperty.bedrooms || null,
      listing_url: oldProperty.listingUrl || null,
      created_at: oldProperty.createdAt,
      updated_at: oldProperty.updatedAt,
    })
    .select()
    .single()

  if (propertyError) {
    console.error("Error migrating property:", propertyError)
    return null
  }

  // 2. Migrate bookings for this property
  const oldBookings = oldData.getBookingsByPropertyId(oldProperty.id)
  for (const oldBooking of oldBookings) {
    await migrateBooking(oldBooking, userId)
  }

  // 3. Migrate feedback for this property
  const oldFeedbackItems = oldData.getFeedbackByPropertyId(oldProperty.id)
  for (const oldFeedback of oldFeedbackItems) {
    await migrateFeedback(oldFeedback, userId)
  }

  return property
}

async function migrateBooking(oldBooking: OldBooking, userId: string) {
  const { error } = await supabase.from("bookings").insert({
    id: oldBooking.id, // Keep the same ID
    property_id: oldBooking.propertyId,
    user_id: userId,
    estate_agent: oldBooking.estateAgent || null,
    date: new Date(oldBooking.date).toISOString().split("T")[0], // Format as YYYY-MM-DD
    time: oldBooking.time,
    notes: oldBooking.notes || null,
    created_at: oldBooking.createdAt,
  })

  if (error) {
    console.error("Error migrating booking:", error)
    return null
  }

  return true
}

async function migrateFeedback(oldFeedback: OldFeedback, userId: string) {
  // 1. Insert the feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from("feedback")
    .insert({
      id: oldFeedback.id, // Keep the same ID
      property_id: oldFeedback.propertyId,
      user_id: userId,
      text: oldFeedback.text,
      created_at: oldFeedback.createdAt,
    })
    .select()
    .single()

  if (feedbackError) {
    console.error("Error migrating feedback:", feedbackError)
    return null
  }

  // 2. Migrate feedback media if any
  if (oldFeedback.images && oldFeedback.images.length > 0) {
    for (const imageUrl of oldFeedback.images) {
      await supabase.from("feedback_media").insert({
        id: uuidv4(),
        feedback_id: feedback.id,
        url: imageUrl,
        media_type: "image",
        created_at: oldFeedback.createdAt,
      })
    }
  }

  if (oldFeedback.video) {
    await supabase.from("feedback_media").insert({
      id: uuidv4(),
      feedback_id: feedback.id,
      url: oldFeedback.video,
      media_type: "video",
      created_at: oldFeedback.createdAt,
    })
  }

  if (oldFeedback.audio) {
    await supabase.from("feedback_media").insert({
      id: uuidv4(),
      feedback_id: feedback.id,
      url: oldFeedback.audio,
      media_type: "audio",
      created_at: oldFeedback.createdAt,
    })
  }

  return feedback
}
