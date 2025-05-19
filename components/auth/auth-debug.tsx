"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      // Check session
      const { data: sessionData } = await supabase.auth.getSession()

      // Check if we can connect to Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from("properties")
        .select("count")
        .limit(1)

      setDebugInfo({
        timestamp: new Date().toISOString(),
        session: sessionData,
        connection: {
          success: !connectionError,
          data: connectionTest,
          error: connectionError ? connectionError.message : null,
        },
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        // Don't include the actual key for security reasons
        supabaseKeyAvailable: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Auth Debugging</CardTitle>
        <CardDescription>Check authentication status and connection</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={checkAuth} disabled={isLoading}>
          {isLoading ? "Checking..." : "Check Auth Status"}
        </Button>

        {debugInfo && (
          <div className="mt-4 p-4 bg-muted rounded-md overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
