import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// For client components
let browserClient: ReturnType<typeof createClient<Database>> | null = null

export function createBrowserClient() {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables are not defined")
    throw new Error("Supabase environment variables are not defined")
  }

  // Use singleton pattern for client-side to avoid creating multiple instances
  if (browserClient) return browserClient

  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  return browserClient
}

// For server components and server actions
export function createServerClient() {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase environment variables are not defined")
    throw new Error("Supabase environment variables are not defined")
  }

  // For server components, we're using the anon key
  // In production with sensitive operations, you would use the service role key
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  })
}
