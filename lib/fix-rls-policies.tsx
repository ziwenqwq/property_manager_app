"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function FixRLSPolicies() {
  const [isFixing, setIsFixing] = useState(false)
  const [results, setResults] = useState<Record<string, boolean | string>>({})

  async function handleFixPolicies() {
    setIsFixing(true)
    const newResults: Record<string, boolean | string> = {}

    try {
      const supabase = createBrowserClient()

      // Execute SQL to create RLS policies that allow all operations
      const tables = ["properties", "bookings", "feedback", "feedback_media"]

      for (const table of tables) {
        try {
          // First, enable RLS on the table if not already enabled
          const { error: enableRlsError } = await supabase.rpc("enable_rls", { table_name: table })

          if (enableRlsError && !enableRlsError.message.includes("already enabled")) {
            newResults[`${table}_enable_rls`] = enableRlsError.message
            continue
          }

          // Create a policy that allows all operations for all users (for testing purposes)
          const { error: createPolicyError } = await supabase.rpc("create_allow_all_policy", {
            table_name: table,
            policy_name: `allow_all_${table}`,
          })

          if (createPolicyError && !createPolicyError.message.includes("already exists")) {
            newResults[`${table}_policy`] = createPolicyError.message
          } else {
            newResults[`${table}_policy`] = true
          }
        } catch (error) {
          newResults[`${table}_policy`] = error instanceof Error ? error.message : String(error)
        }
      }
    } catch (error) {
      console.error("Error fixing RLS policies:", error)
    } finally {
      setResults(newResults)
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
            {Object.entries(results).map(([policy, result]) => (
              <div key={policy} className="flex items-center p-2 border rounded-md">
                <div className={`w-4 h-4 rounded-full mr-2 ${result === true ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="font-mono text-sm">{policy}</span>
                <span className="ml-auto text-sm">
                  {result === true ? "✅ Created/Updated" : `❌ Failed: ${result}`}
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
