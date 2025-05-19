"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { migrateData } from "@/lib/supabase/migrate-data"
import { useToast } from "@/hooks/use-toast"

export default function SupabaseTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  async function testConnection() {
    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      // Simple query to test the connection
      const { data, error } = await supabase.from("properties").select("count").limit(1)

      if (error) throw error

      setConnectionStatus("success")
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Supabase",
      })
    } catch (error) {
      console.error("Connection error:", error)
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Supabase",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  async function handleMigrateData() {
    setIsMigrating(true)
    try {
      const result = await migrateData()
      setMigrationResult(result)

      if (result.success) {
        toast({
          title: "Migration Successful",
          description: result.message,
        })
      } else {
        toast({
          title: "Migration Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setMigrationResult({
        success: false,
        message: error.message || "Migration failed",
      })
      toast({
        title: "Migration Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test your connection to Supabase and migrate data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={testConnection} disabled={isTestingConnection}>
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>

          {connectionStatus === "success" && <p className="text-sm text-green-500">Connection successful!</p>}

          {connectionStatus === "error" && (
            <p className="text-sm text-red-500">Connection failed. Check console for details.</p>
          )}
        </div>

        <div className="space-y-2">
          <Button onClick={handleMigrateData} disabled={isMigrating || connectionStatus !== "success"}>
            {isMigrating ? "Migrating..." : "Migrate Data"}
          </Button>

          {migrationResult && (
            <p className={`text-sm ${migrationResult.success ? "text-green-500" : "text-red-500"}`}>
              {migrationResult.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
