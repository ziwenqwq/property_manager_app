import { supabase } from "./client"

export async function setupStorageBuckets() {
  try {
    // Check if the buckets already exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    // Create property-images bucket if it doesn't exist
    if (!buckets.find((bucket) => bucket.name === "property-images")) {
      const { error: createError } = await supabase.storage.createBucket("property-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      })

      if (createError) {
        throw createError
      }
    }

    // Create feedback-media bucket if it doesn't exist
    if (!buckets.find((bucket) => bucket.name === "feedback-media")) {
      const { error: createError } = await supabase.storage.createBucket("feedback-media", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "audio/mpeg",
          "audio/wav",
          "audio/ogg",
        ],
      })

      if (createError) {
        throw createError
      }
    }

    return { success: true, message: "Storage buckets set up successfully" }
  } catch (error: any) {
    console.error("Error setting up storage buckets:", error)
    return { success: false, message: error.message || "Failed to set up storage buckets" }
  }
}

/*
Instructions for setting up storage buckets manually in Supabase:

1. Go to the Supabase dashboard and select your project
2. Navigate to the "Storage" section in the sidebar
3. Create two buckets:
   a. "property-images" - for property images and floor plans
   b. "feedback-media" - for feedback images, videos, and audio

4. For each bucket, set the following permissions:
   a. Under "Policies", create a new policy for SELECT operations:
      - Name: "Public Access"
      - Policy definition: SELECT
      - Policy: true (allow public access for viewing)
      
   b. Create a policy for INSERT operations:
      - Name: "Auth Users Insert"
      - Policy definition: INSERT
      - Policy: (auth.uid() IS NOT NULL)
      
   c. Create a policy for UPDATE operations:
      - Name: "Owner Update"
      - Policy definition: UPDATE
      - Policy: (auth.uid() = owner_id) 
      
   d. Create a policy for DELETE operations:
      - Name: "Owner Delete"
      - Policy definition: DELETE
      - Policy: (auth.uid() = owner_id)

5. For the "property-images" bucket, set these additional options:
   - File size limit: 10MB
   - Allowed MIME types: image/png, image/jpeg, image/gif, image/webp

6. For the "feedback-media" bucket, set these additional options:
   - File size limit: 50MB
   - Allowed MIME types: 
     image/png, image/jpeg, image/gif, image/webp,
     video/mp4, video/webm,
     audio/mpeg, audio/wav, audio/ogg
*/
