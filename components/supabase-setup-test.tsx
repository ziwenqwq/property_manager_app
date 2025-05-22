"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { STORAGE_BUCKETS } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function SupabaseSetupTest() {
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<{
    tables: Record<string, boolean>
    storage: Record<string, boolean>
    tableOperations: Record<string, boolean | string>
  }>({
    tables: {},
    storage: {},
    tableOperations: {},
  })

  useEffect(() => {
    runTests()
  }, [])

  async function runTests() {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()

      // Test tables
      const requiredTables = ["properties", "bookings", "feedback", "feedback_media"]

      const tableResults: Record<string, boolean> = {}

      // Check if tables exist
      for (const table of requiredTables) {
        try {
          const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

          tableResults[table] = !error
        } catch (error) {
          tableResults[table] = false
        }
      }

      // Test storage buckets
      const storageResults: Record<string, boolean> = {}

      for (const bucket of Object.values(STORAGE_BUCKETS)) {
        try {
          const { data, error } = await supabase.storage.getBucket(bucket)
          storageResults[bucket] = !error
        } catch (error) {
          storageResults[bucket] = false
        }
      }

      // Test table operations
      const operationResults: Record<string, boolean | string> = {}

      // Test property operations
      try {
        // Insert test property
        const { data: insertedProperty, error: insertError } = await supabase
          .from("properties")
          .insert({
            name: "Test Property " + new Date().toISOString(),
            address: "123 Test Street",
            listing_agent: "Test Agent",
            listing_price: 100000,
            square_footage: 1000,
            bedrooms: 3,
          })
          .select()
          .single()

        if (insertError) {
          operationResults["property_insert"] = insertError.message
        } else {
          operationResults["property_insert"] = true

          // Test property update
          const { error: updateError } = await supabase
            .from("properties")
            .update({ listing_price: 110000 })
            .eq("id", insertedProperty.id)

          operationResults["property_update"] = !updateError

          // Test property delete
          const { error: deleteError } = await supabase.from("properties").delete().eq("id", insertedProperty.id)

          operationResults["property_delete"] = !deleteError
        }
      } catch (error) {
        operationResults["property_operations"] = error instanceof Error ? error.message : String(error)
      }

      setResults({
        tables: tableResults,
        storage: storageResults,
        tableOperations: operationResults,
      })
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Supabase Setup Test</h2>
        <Button onClick={runTests} disabled={isLoading} size="sm">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Testing..." : "Run Tests Again"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Running tests...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-md font-medium mb-2">Database Tables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(results.tables).map(([table, exists]) => (
                <div key={table} className="flex items-center p-2 border rounded-md">
                  <div className={`w-4 h-4 rounded-full mr-2 ${exists ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="font-mono text-sm">{table}</span>
                  <span className="ml-auto text-sm">{exists ? "✅ Exists" : "❌ Missing"}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">Storage Buckets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(results.storage).map(([bucket, exists]) => (
                <div key={bucket} className="flex items-center p-2 border rounded-md">
                  <div className={`w-4 h-4 rounded-full mr-2 ${exists ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="font-mono text-sm">{bucket}</span>
                  <span className="ml-auto text-sm">{exists ? "✅ Exists" : "❌ Missing"}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">Table Operations</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(results.tableOperations).map(([operation, result]) => (
                <div key={operation} className="flex items-center p-2 border rounded-md">
                  <div className={`w-4 h-4 rounded-full mr-2 ${result === true ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="font-mono text-sm">{operation}</span>
                  <span className="ml-auto text-sm">
                    {result === true ? "✅ Success" : `❌ Failed${typeof result === "string" ? `: ${result}` : ""}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
