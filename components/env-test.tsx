"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"

export default function EnvTest() {
  const [hasEnvVars, setHasEnvVars] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if environment variables are defined
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      setHasEnvVars(true)

      // Test Supabase connection
      const testConnection = async () => {
        try {
          const supabase = createBrowserClient()
          const { data, error } = await supabase.from("properties").select("count()", { count: "exact" })

          if (error) {
            setError(error.message)
          } else {
            console.log("Connection successful, count:", data)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }

      testConnection()
    } else {
      setHasEnvVars(false)
    }
  }, [])

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Environment Variables Test</h2>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Defined" : "❌ Not defined"}
        </p>
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Defined" : "❌ Not defined"}
        </p>
        <p>
          <strong>Environment Variables Status:</strong> {hasEnvVars ? "✅ Available" : "❌ Not available"}
        </p>
        {error && (
          <p className="text-red-500">
            <strong>Error:</strong> {error}
          </p>
        )}
      </div>
    </div>
  )
}
