import { createServerClient } from "./supabase"
import type { Property, Booking, Feedback } from "./types"

// Add this export at the top of the file to make it available for client components
export { getProperties }

// Property functions
export async function getProperties(): Promise<Property[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching properties:", error)
    return []
  }

  // For each property, fetch its photos and floorplans
  const propertiesWithMedia = await Promise.all(
    data.map(async (property) => {
      const photos = await getPropertyPhotos(property.id)
      const floorplans = await getPropertyFloorplans(property.id)
      return {
        ...property,
        photos,
        floorplans,
      }
    }),
  )

  return propertiesWithMedia.map(mapDbPropertyToProperty)
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("properties").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching property with ID ${id}:`, error)
    return null
  }

  // Fetch property photos and floorplans
  const photos = await getPropertyPhotos(id)
  const floorplans = await getPropertyFloorplans(id)
  const propertyWithMedia = {
    ...data,
    photos,
    floorplans,
  }

  return mapDbPropertyToProperty(propertyWithMedia)
}

// Function to get property photos
async function getPropertyPhotos(propertyId: string): Promise<string[]> {
  const supabase = createServerClient()

  try {
    // Check if property_photos column exists and has data
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("property_photos")
      .eq("id", propertyId)
      .single()

    if (!propertyError && propertyData && propertyData.property_photos) {
      try {
        // Parse property_photos as JSON array
        if (typeof propertyData.property_photos === "string") {
          const parsed = JSON.parse(propertyData.property_photos)
          if (Array.isArray(parsed)) {
            console.log("Retrieved photos from property_photos:", parsed)
            return parsed
          }
        } else if (Array.isArray(propertyData.property_photos)) {
          console.log("Retrieved photos from property_photos (already array):", propertyData.property_photos)
          return propertyData.property_photos
        }
      } catch (e) {
        console.error(`Error parsing property_photos for property ${propertyId}:`, e)
      }
    }

    console.log("No photos found for property:", propertyId)
    return []
  } catch (error) {
    console.error(`Error getting photos for property ${propertyId}:`, error)
    return []
  }
}

// Function to get property floorplans
async function getPropertyFloorplans(propertyId: string): Promise<string[]> {
  const supabase = createServerClient()

  try {
    // Instead of using check_column_exists, directly query the floorplans column
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("floorplans, listing_pdf")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error(`Error fetching property data for floorplans: ${propertyError.message}`)
      return []
    }

    // Check if floorplans column has data
    if (propertyData && propertyData.floorplans) {
      try {
        // Parse floorplans as JSON array
        if (typeof propertyData.floorplans === "string") {
          const parsed = JSON.parse(propertyData.floorplans)
          if (Array.isArray(parsed)) {
            console.log("Retrieved floorplans from floorplans column:", parsed)
            return parsed
          }
        } else if (Array.isArray(propertyData.floorplans)) {
          console.log("Retrieved floorplans (already array):", propertyData.floorplans)
          return propertyData.floorplans
        }
      } catch (e) {
        console.error(`Error parsing floorplans for property ${propertyId}:`, e)
      }
    }

    // Only if floorplans column is empty, try listing_pdf as fallback
    if (propertyData && propertyData.listing_pdf) {
      // Check if listing_pdf is a JSON array (for backward compatibility)
      if (typeof propertyData.listing_pdf === "string" && propertyData.listing_pdf.startsWith("[")) {
        try {
          const parsed = JSON.parse(propertyData.listing_pdf)
          if (Array.isArray(parsed)) {
            console.log("Retrieved floorplans from listing_pdf:", parsed)
            return parsed
          }
        } catch (e) {
          console.error(`Error parsing listing_pdf as JSON for property ${propertyId}:`, e)
        }
      }
    }

    console.log("No floorplans found for property:", propertyId)
    return []
  } catch (error) {
    console.error(`Error getting floorplans for property ${propertyId}:`, error)
    return []
  }
}

// Function to get all files associated with a property
export async function getPropertyFiles(propertyId: string): Promise<any[]> {
  const supabase = createServerClient()
  const files = []

  try {
    // Get property data for photos, floorplans, and listing PDF
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("listing_pdf, property_photos, floorplans, created_at")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error(`Error fetching property data for files: ${propertyError.message}`)
      return []
    }

    if (propertyData) {
      // Handle property photos
      if (propertyData.property_photos) {
        try {
          let photos = []
          if (typeof propertyData.property_photos === "string") {
            photos = JSON.parse(propertyData.property_photos)
          } else if (Array.isArray(propertyData.property_photos)) {
            photos = propertyData.property_photos
          }

          if (photos.length > 0) {
            const photoFiles = photos.map((url, index) => ({
              id: `photo-${index}`,
              url,
              type: "image",
              category: "property_photo",
              name: url.split("/").pop() || `Property Photo ${index + 1}`,
              createdAt: propertyData.created_at || new Date().toISOString(),
            }))
            files.push(...photoFiles)
          }
        } catch (e) {
          console.error(`Error parsing property_photos for property ${propertyId}:`, e)
        }
      }

      // Handle floorplans from floorplans column
      if (propertyData.floorplans) {
        try {
          let floorplans = []
          if (typeof propertyData.floorplans === "string") {
            floorplans = JSON.parse(propertyData.floorplans)
          } else if (Array.isArray(propertyData.floorplans)) {
            floorplans = propertyData.floorplans
          }

          if (floorplans.length > 0) {
            console.log("Adding floorplans to files:", floorplans)
            const floorplanFiles = floorplans.map((url, index) => ({
              id: `floorplan-${index}`,
              url,
              type: "image",
              category: "floorplan",
              name: url.split("/").pop() || `Floor Plan ${index + 1}`,
              createdAt: propertyData.created_at || new Date().toISOString(),
            }))
            files.push(...floorplanFiles)
          }
        } catch (e) {
          console.error(`Error parsing floorplans for property ${propertyId}:`, e)
        }
      }

      // Handle listing PDF if it's not a JSON array
      if (
        propertyData.listing_pdf &&
        typeof propertyData.listing_pdf === "string" &&
        !propertyData.listing_pdf.startsWith("[")
      ) {
        files.push({
          id: `listing-pdf`,
          url: propertyData.listing_pdf,
          type: "pdf",
          category: "listing_pdf",
          name: propertyData.listing_pdf.split("/").pop() || "Listing PDF",
          createdAt: propertyData.created_at || new Date().toISOString(),
        })
      }
      // Check if listing_pdf contains floorplans (for backward compatibility)
      else if (
        propertyData.listing_pdf &&
        typeof propertyData.listing_pdf === "string" &&
        propertyData.listing_pdf.startsWith("[")
      ) {
        try {
          const floorplans = JSON.parse(propertyData.listing_pdf)
          if (Array.isArray(floorplans) && floorplans.length > 0) {
            const floorplanFiles = floorplans.map((url, index) => ({
              id: `legacy-floorplan-${index}`,
              url,
              type: "image",
              category: "floorplan",
              name: url.split("/").pop() || `Floor Plan ${index + 1}`,
              createdAt: propertyData.created_at || new Date().toISOString(),
            }))
            files.push(...floorplanFiles)
          }
        } catch (e) {
          console.error(`Error parsing listing_pdf as JSON for property ${propertyId}:`, e)
        }
      }
    }

    // Get feedback media
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("id")
      .eq("property_id", propertyId)

    if (!feedbackError && feedbackData) {
      const feedbackIds = feedbackData.map((item) => item.id)

      if (feedbackIds.length > 0) {
        const { data: mediaData, error: mediaError } = await supabase
          .from("feedback_media")
          .select("*")
          .in("feedback_id", feedbackIds)

        if (!mediaError && mediaData) {
          const feedbackMedia = mediaData.map((item) => ({
            id: item.id,
            url: item.media_url,
            type: item.media_type,
            category: "feedback_media",
            name: item.media_url.split("/").pop() || `Feedback ${item.media_type}`,
            createdAt: item.created_at,
            feedbackId: item.feedback_id,
          }))
          files.push(...feedbackMedia)
        }
      }
    }

    console.log("Total files found:", files.length)
    return files
  } catch (error) {
    console.error(`Error fetching files for property ${propertyId}:`, error)
    return []
  }
}

export async function addProperty(data: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property | null> {
  const supabase = createServerClient()

  // Prepare property data
  const propertyData: any = {
    name: data.name,
    address: data.address,
    listing_agent: data.listingAgent,
    listing_price: data.listingPrice,
    square_footage: data.squareFootage,
    bedrooms: data.bedrooms,
    listing_url: data.listingUrl,
  }

  // Handle listing PDF
  if (data.listingPdf) {
    propertyData.listing_pdf = data.listingPdf
  }

  // Handle photos - store as JSON in property_photos
  if (data.photos && data.photos.length > 0) {
    propertyData.property_photos = JSON.stringify(data.photos)
  }

  // Handle floorplans - store as JSON in floorplans
  if (data.floorplans && data.floorplans.length > 0) {
    propertyData.floorplans = JSON.stringify(data.floorplans)
  }

  // Create the property record
  const { data: newProperty, error } = await supabase.from("properties").insert(propertyData).select().single()

  if (error) {
    console.error("Error adding property:", error)
    return null
  }

  // Fetch the complete property with all data
  const { data: completeProperty, error: fetchError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", newProperty.id)
    .single()

  if (fetchError) {
    console.error(`Error fetching complete property with ID ${newProperty.id}:`, fetchError)
    return mapDbPropertyToProperty(newProperty) // Return what we have if we can't fetch the complete property
  }

  // Add photos and floorplans to the property object
  const photos = await getPropertyPhotos(newProperty.id)
  const floorplans = await getPropertyFloorplans(newProperty.id)
  const propertyWithMedia = {
    ...completeProperty,
    photos,
    floorplans,
  }

  return mapDbPropertyToProperty(propertyWithMedia)
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<Property, "id" | "createdAt" | "updatedAt">>,
): Promise<Property | null> {
  const supabase = createServerClient()

  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.address !== undefined) updateData.address = data.address
  if (data.listingAgent !== undefined) updateData.listing_agent = data.listingAgent
  if (data.listingPrice !== undefined) updateData.listing_price = data.listingPrice
  if (data.squareFootage !== undefined) updateData.square_footage = data.squareFootage
  if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms
  if (data.listingUrl !== undefined) updateData.listing_url = data.listingUrl
  if (data.rating !== undefined) updateData.rating = data.rating

  // Handle photos - always store as JSON string
  if (data.photos !== undefined) {
    updateData.property_photos = data.photos.length > 0 ? JSON.stringify(data.photos) : null
  }

  // Handle floorplans - always store as JSON string
  if (data.floorplans !== undefined) {
    updateData.floorplans = data.floorplans.length > 0 ? JSON.stringify(data.floorplans) : null
  }

  // Handle listing PDF - only if it's a real PDF, not floorplans
  if (data.listingPdf !== undefined) {
    updateData.listing_pdf = data.listingPdf
  }

  console.log("Updating property with data:", updateData)

  const { data: updatedProperty, error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating property with ID ${id}:`, error)
    return null
  }

  // Add photos and floorplans to the property object
  const photos = await getPropertyPhotos(id)
  const floorplans = await getPropertyFloorplans(id)
  const propertyWithMedia = {
    ...updatedProperty,
    photos,
    floorplans,
  }

  return mapDbPropertyToProperty(propertyWithMedia)
}

// Rating functions
export async function updatePropertyRating(id: string, rating: number | null): Promise<Property | null> {
  return updateProperty(id, { rating })
}

// Alternative methods for property photos if property_photos column doesn't exist
async function addPropertyPhotosAlternative(propertyId: string, photoUrls: string[]): Promise<void> {
  // For now, we'll just log that we can't store the photos
  console.log(`Cannot store property photos for ${propertyId} - property_photos column doesn't exist`)
  console.log("Photos that would be stored:", photoUrls)

  // In a real implementation, you might:
  // 1. Create a temporary table to store property photos
  // 2. Use a different existing column to store the photos as JSON
  // 3. Add the photos to a cloud storage service and store references
}

async function updatePropertyPhotosAlternative(propertyId: string, photoUrls: string[]): Promise<void> {
  // Similar to addPropertyPhotosAlternative, just log for now
  console.log(`Cannot update property photos for ${propertyId} - property_photos column doesn't exist`)
  console.log("Photos that would be stored:", photoUrls)
}

// Booking functions
export async function getAllBookings(): Promise<Booking[]> {
  const supabase = createServerClient()

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      properties(name)
    `)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return bookings.map(mapDbBookingToBooking)
}

export async function getBookingsByPropertyId(propertyId: string): Promise<Booking[]> {
  const supabase = createServerClient()

  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        properties(name)
      `)
      .eq("property_id", propertyId)
      .order("date", { ascending: true })

    if (error) {
      console.error(`Error fetching bookings for property ID ${propertyId}:`, error)
      return []
    }

    // Ensure we always return an array
    return Array.isArray(bookings) ? bookings.map(mapDbBookingToBooking) : []
  } catch (error) {
    console.error(`Exception fetching bookings for property ID ${propertyId}:`, error)
    return []
  }
}

// Update the addBooking function to avoid using the check_column_exists RPC function
// Replace the existing addBooking function with this implementation:

export async function addBooking(data: Omit<Booking, "id" | "propertyName" | "createdAt">): Promise<Booking | null> {
  const supabase = createServerClient()

  try {
    // Prepare the booking data with all possible fields
    // If a column doesn't exist, Supabase will ignore it
    const bookingData: any = {
      property_id: data.propertyId,
      date: data.date,
      time: data.time,
      notes: data.notes,
      estate_agent: data.name || "Unspecified",
      status: data.status || "scheduled",
    }

    // Insert the booking
    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select(`
        *,
        properties(name)
      `)
      .single()

    if (error) {
      console.error("Error adding booking:", error)
      return null
    }

    return mapDbBookingToBooking(newBooking)
  } catch (error) {
    console.error("Error in addBooking:", error)
    return null
  }
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Promise<Booking | null> {
  const supabase = createServerClient()

  const updateData: any = {}

  if (data.date !== undefined) updateData.date = data.date
  if (data.time !== undefined) updateData.time = data.time
  if (data.name !== undefined) updateData.estate_agent = data.name
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      properties(name)
    `)
    .single()

  if (error) {
    console.error(`Error updating booking with ID ${id}:`, error)
    return null
  }

  return mapDbBookingToBooking(updatedBooking)
}

// Feedback functions
export async function getAllFeedback(): Promise<Feedback[]> {
  const supabase = createServerClient()

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return []
  }

  return feedback.map(mapDbFeedbackToFeedback)
}

export async function getFeedbackByPropertyId(propertyId: string): Promise<Feedback[]> {
  const supabase = createServerClient()

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching feedback for property ID ${propertyId}:`, error)
    return []
  }

  return feedback.map(mapDbFeedbackToFeedback)
}

export async function addFeedback(data: Omit<Feedback, "id" | "propertyName" | "createdAt">): Promise<Feedback | null> {
  const supabase = createServerClient()

  // First, insert the feedback text
  const { data: newFeedback, error } = await supabase
    .from("feedback")
    .insert({
      property_id: data.propertyId,
      text: data.text,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding feedback:", error)
    return null
  }

  // Then, handle media if it exists
  if (data.images && data.images.length > 0) {
    for (const imageUrl of data.images) {
      await addFeedbackMedia(newFeedback.id, "image", imageUrl)
    }
  }

  if (data.video) {
    await addFeedbackMedia(newFeedback.id, "video", data.video)
  }

  if (data.audio) {
    await addFeedbackMedia(newFeedback.id, "audio", data.audio)
  }

  // Fetch the complete feedback with media
  const { data: completeFeedback, error: fetchError } = await supabase
    .from("feedback")
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .eq("id", newFeedback.id)
    .single()

  if (fetchError) {
    console.error(`Error fetching complete feedback with ID ${newFeedback.id}:`, fetchError)
    return null
  }

  return mapDbFeedbackToFeedback(completeFeedback)
}

export async function updateFeedback(
  id: string,
  data: Partial<Omit<Feedback, "id" | "propertyId" | "propertyName" | "createdAt">>,
): Promise<Feedback | null> {
  const supabase = createServerClient()

  const updateData: any = {}

  if (data.text !== undefined) updateData.text = data.text

  const { data: updatedFeedback, error } = await supabase
    .from("feedback")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      properties(name),
      feedback_media(*)
    `)
    .single()

  if (error) {
    console.error(`Error updating feedback with ID ${id}:`, error)
    return null
  }

  return mapDbFeedbackToFeedback(updatedFeedback)
}

// Helper functions for media
async function addFeedbackMedia(feedbackId: string, type: string, url: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from("feedback_media").insert({
    feedback_id: feedbackId,
    media_type: type,
    media_url: url,
  })

  if (error) {
    console.error(`Error adding ${type} media to feedback ${feedbackId}:`, error)
  }
}

// Mapping functions to convert database objects to our application types
function mapDbPropertyToProperty(dbProperty: any): Property {
  // Initialize floorplans and photos arrays
  let floorplans: string[] = []
  const photos: string[] = dbProperty.photos || []

  // Use floorplans directly if available
  if (dbProperty.floorplans) {
    if (Array.isArray(dbProperty.floorplans)) {
      floorplans = dbProperty.floorplans
    }
  }

  // Determine if listing_pdf is a real PDF or floorplans JSON
  let listingPdf: string | undefined = undefined
  if (dbProperty.listing_pdf && typeof dbProperty.listing_pdf === "string") {
    if (dbProperty.listing_pdf.startsWith("[") && floorplans.length === 0) {
      // If listing_pdf is JSON and we don't have floorplans yet, try to parse it
      try {
        const parsed = JSON.parse(dbProperty.listing_pdf)
        if (Array.isArray(parsed)) {
          floorplans = parsed
        }
      } catch (e) {
        // If parsing fails, treat as a regular PDF
        listingPdf = dbProperty.listing_pdf
      }
    } else if (!dbProperty.listing_pdf.startsWith("[")) {
      // If not JSON, it's a regular PDF
      listingPdf = dbProperty.listing_pdf
    }
  }

  return {
    id: dbProperty.id,
    name: dbProperty.name,
    address: dbProperty.address || undefined,
    listingAgent: dbProperty.listing_agent || undefined,
    listingPrice: dbProperty.listing_price || undefined,
    squareFootage: dbProperty.square_footage || undefined,
    bedrooms: dbProperty.bedrooms || undefined,
    listingUrl: dbProperty.listing_url || undefined,
    listingPdf: listingPdf,
    floorplans: floorplans.length > 0 ? floorplans : undefined,
    photos: photos.length > 0 ? photos : undefined,
    rating: dbProperty.rating,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at,
  }
}

function mapDbBookingToBooking(dbBooking: any): Booking {
  return {
    id: dbBooking.id,
    propertyId: dbBooking.property_id,
    propertyName: dbBooking.properties?.name || "Unknown Property",
    date: dbBooking.date,
    time: dbBooking.time,
    name: dbBooking.estate_agent || "Unspecified",
    email: "viewing@record.internal", // Default email since it's not in the schema
    phone: undefined,
    status: "scheduled", // Default status since it's not in the schema
    notes: dbBooking.notes || undefined,
    createdAt: dbBooking.created_at,
  }
}

function mapDbFeedbackToFeedback(dbFeedback: any): Feedback {
  const images: string[] = []
  let video: string | undefined
  let audio: string | undefined

  if (dbFeedback.feedback_media && Array.isArray(dbFeedback.feedback_media)) {
    for (const media of dbFeedback.feedback_media) {
      if (media.media_type === "image") {
        images.push(media.media_url)
      } else if (media.media_type === "video") {
        video = media.media_url
      } else if (media.media_type === "audio") {
        audio = media.media_url
      }
    }
  }

  return {
    id: dbFeedback.id,
    propertyId: dbFeedback.property_id,
    propertyName: dbFeedback.properties?.name || "Unknown Property",
    text: dbFeedback.text,
    images: images.length > 0 ? images : undefined,
    video,
    audio,
    createdAt: dbFeedback.created_at,
  }
}
