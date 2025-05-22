"use client"

import { useState } from "react"
import { initializeStorageBuckets } from "@/lib/actions/storage-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function InitializeStorage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [results, setResults] = useState<Record<string, string>>({})

  async function handleInitialize() {
    setIsInitializing(true)

    try {
      const response = await initializeStorageBuckets()

      if (response.success) {
        setResults(response.results)
      } else {
        setResults({ error: response.error || "Unknown error occurred" })
      }
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : String(error) })
    } finally {
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
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className="flex items-center p-2 border rounded-md">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    result === "Created successfully" || result === "Already exists" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="font-mono text-sm">{key}</span>
                <span className="ml-auto text-sm">
                  {result === "Created successfully"
                    ? "✅ Created"
                    : result === "Already exists"
                      ? "✅ Already exists"
                      : `❌ ${result}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
