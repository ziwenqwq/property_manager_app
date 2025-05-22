"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function DirectSQLExecutor() {
  const [sql, setSql] = useState(`
-- Enable RLS on tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_media ENABLE ROW LEVEL SECURITY;

-- Create policies for properties table
DROP POLICY IF EXISTS allow_all_properties ON properties;
CREATE POLICY allow_all_properties ON properties FOR ALL USING (true) WITH CHECK (true);

-- Create policies for bookings table
DROP POLICY IF EXISTS allow_all_bookings ON bookings;
CREATE POLICY allow_all_bookings ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Create policies for feedback table
DROP POLICY IF EXISTS allow_all_feedback ON feedback;
CREATE POLICY allow_all_feedback ON feedback FOR ALL USING (true) WITH CHECK (true);

-- Create policies for feedback_media table
DROP POLICY IF EXISTS allow_all_feedback_media ON feedback_media;
CREATE POLICY allow_all_feedback_media ON feedback_media FOR ALL USING (true) WITH CHECK (true);

-- Create policy for storage.objects table
DROP POLICY IF EXISTS allow_all_storage_objects ON storage.objects;
CREATE POLICY allow_all_storage_objects ON storage.objects FOR ALL USING (true) WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('floorplans', 'floorplans', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-pdfs', 'listing-pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-videos', 'feedback-videos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-audio', 'feedback-audio', true)
ON CONFLICT (id) DO NOTHING;
`)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function executeSQL() {
    setIsExecuting(true)
    setResult(null)

    try {
      const supabase = createBrowserClient()

      // Split the SQL into individual statements
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

      const results = []

      // Execute each statement separately
      for (const statement of statements) {
        try {
          const { data, error } = await supabase.rpc("execute_sql", { sql_statement: statement + ";" })

          if (error) {
            results.push(`Error executing: ${statement}\nError: ${error.message}`)
          } else {
            results.push(`Success: ${statement}`)
          }
        } catch (err) {
          results.push(`Exception executing: ${statement}\nError: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      setResult(results.join("\n\n"))
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Direct SQL Executor</h2>
      <div className="space-y-4">
        <Textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="font-mono text-sm h-80"
          disabled={isExecuting}
        />

        <Button onClick={executeSQL} disabled={isExecuting} className="w-full">
          {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isExecuting ? "Executing..." : "Execute SQL"}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-80 text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
