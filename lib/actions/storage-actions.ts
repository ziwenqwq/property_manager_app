"use server"

import { createServerClient } from "@/lib/supabase"
import { STORAGE_BUCKETS } from "@/lib/storage"

export async function initializeStorageBuckets() {
  try {
    const supabase = createServerClient()
    const results: Record<string, string> = {}

    // Create each bucket
    for (const bucket of Object.values(STORAGE_BUCKETS)) {
      try {
        // Check if bucket exists first
        const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucket)

        if (getBucketError && getBucketError.message.includes("not found")) {
          // Create the bucket if it doesn't exist
          const { data, error } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          })

          if (error) {
            results[bucket] = `Error: ${error.message}`
          } else {
            results[bucket] = "Created successfully"
          }
        } else {
          // Bucket already exists
          results[bucket] = "Already exists"
        }
      } catch (error) {
        results[bucket] = `Exception: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    return { success: true, results }
  } catch (error) {
    console.error("Error initializing storage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
