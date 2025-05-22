"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { STORAGE_BUCKETS } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function InitializeStorage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [results, setResults] = useState<Record<string, boolean | string>>({})

  async function handleInitialize() {
    setIsInitializing(true)
    const newResults: Record<string, boolean | string> = {}

    try {
      const supabase = createBrowserClient()

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
              newResults[bucket] = error.message
            } else {
              newResults[bucket] = true
            }
          } else {
            // Bucket already exists
            newResults[bucket] = "Already exists"
          }
        } catch (error) {
          newResults[bucket] = error instanceof Error ? error.message : String(error)
        }
      }
    } catch (error) {
      console.error("Error initializing storage:", error)
    } finally {
      setResults(newResults)
      setIsInitializing(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Initialize Storage Buckets</h2>
      <div className="mb-4">
        <Button onClick={handleInitialize} disabled={isInitializing}>
          {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isInitializing ? "Initializing..." : "Initialize Storage Buckets"}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-md font-medium">Results:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(results).map(([bucket, result]) => (
              <div key={bucket} className="flex items-center p-2 border rounded-md">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    result === true || result === "Already exists" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="font-mono text-sm">{bucket}</span>
                <span className="ml-auto text-sm">
                  {result === true
                    ? "✅ Created"
                    : result === "Already exists"
                      ? "✅ Already exists"
                      : `❌ Failed: ${result}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
