"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function SupabaseTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createBrowserClient()

        // Test a simple query
        const { data, error } = await supabase.from("properties").select("*").limit(1)

        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
          setData(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setIsConnected(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Supabase Connection Test</h2>
      <div className="space-y-2">
        <p>
          <strong>Connection Status:</strong> {isConnected ? "✅ Connected" : "❌ Not connected"}
        </p>
        {error && (
          <p className="text-red-500">
            <strong>Error:</strong> {error}
          </p>
        )}
        {data && (
          <div>
            <p>
              <strong>Data Retrieved:</strong>
            </p>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
