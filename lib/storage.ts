import { createServerClient, createBrowserClient } from "./supabase"

// Define storage buckets
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: "property-images",
  FLOORPLANS: "floorplans",
  LISTING_PDFS: "listing-pdfs",
  FEEDBACK_IMAGES: "feedback-images",
  FEEDBACK_VIDEOS: "feedback-videos",
  FEEDBACK_AUDIO: "feedback-audio",
}

// Initialize storage buckets (server-side only)
export async function initializeStorage() {
  const supabase = createServerClient()

  // Create buckets if they don't exist
  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket)

      if (error && error.message.includes("not found")) {
        await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })
        console.log(`Created bucket: ${bucket}`)
      }
    } catch (error) {
      console.error(`Error checking/creating bucket ${bucket}:`, error)
    }
  }
}

// Upload a file to storage (client-side)
export async function uploadFile(bucket: string, filePath: string, file: File): Promise<string | null> {
  const supabase = createBrowserClient()

  try {
    // Check if the bucket exists, if not try to create it
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket)

    if (bucketError && bucketError.message.includes("not found")) {
      // Try to create the bucket
      await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })
    }

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error(`Error uploading file to ${bucket}/${filePath}:`, error)
      return null
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error(`Exception uploading file to ${bucket}/${filePath}:`, error)
    return null
  }
}

// Delete a file from storage (server-side)
export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error(`Error deleting file from ${bucket}/${filePath}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Exception deleting file from ${bucket}/${filePath}:`, error)
    return false
  }
}

// Get a signed URL for a file (server-side)
export async function getSignedUrl(bucket: string, filePath: string, expiresIn = 60): Promise<string | null> {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error(`Error creating signed URL for ${bucket}/${filePath}:`, error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error(`Exception creating signed URL for ${bucket}/${filePath}:`, error)
    return null
  }
}
