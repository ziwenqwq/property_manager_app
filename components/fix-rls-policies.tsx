"use client"

import { useState } from "react"
import { fixRLSPolicies } from "@/lib/actions/rls-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function FixRLSPolicies() {
  const [isFixing, setIsFixing] = useState(false)
  const [results, setResults] = useState<Record<string, string>>({})

  async function handleFixPolicies() {
    setIsFixing(true)

    try {
      const response = await fixRLSPolicies()

      if (response.success) {
        setResults(response.results)
      } else {
        setResults({ error: response.error || "Unknown error occurred" })
      }
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Fix Row Level Security Policies</h2>
      <div className="mb-4">
        <Button onClick={handleFixPolicies} disabled={isFixing}>
          {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isFixing ? "Fixing..." : "Fix RLS Policies"}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-md font-medium">Results:</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className="flex items-center p-2 border rounded-md">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    result === "Created/updated successfully" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="font-mono text-sm">{key}</span>
                <span className="ml-auto text-sm">
                  {result === "Created/updated successfully" ? "✅ Created/Updated" : `❌ ${result}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>
          Note: This will create permissive RLS policies that allow all operations for testing purposes. In a production
          environment, you should create more restrictive policies.
        </p>
      </div>
    </div>
  )
}
