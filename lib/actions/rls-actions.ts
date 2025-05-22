"use server"

import { createServerClient } from "@/lib/supabase"

export async function fixRLSPolicies() {
  try {
    const supabase = createServerClient()
    const results: Record<string, string> = {}
    const tables = ["properties", "bookings", "feedback", "feedback_media"]

    // Execute SQL to enable RLS and create policies for each table
    for (const table of tables) {
      try {
        // Enable RLS using standard ALTER TABLE syntax
        const { error: enableRlsError } = await supabase.rpc("exec_sql", {
          sql_statement: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
        })

        if (enableRlsError) {
          results[`${table}_enable_rls`] = `Error: ${enableRlsError.message}`
          continue
        } else {
          results[`${table}_enable_rls`] = "Enabled successfully"
        }

        // Create policy using standard CREATE POLICY syntax
        const { error: createPolicyError } = await supabase.rpc("exec_sql", {
          sql_statement: `
            DROP POLICY IF EXISTS allow_all_${table} ON ${table};
            CREATE POLICY allow_all_${table} ON ${table} FOR ALL USING (true) WITH CHECK (true);
          `,
        })

        if (createPolicyError) {
          results[`${table}_policy`] = `Error: ${createPolicyError.message}`
        } else {
          results[`${table}_policy`] = "Created/updated successfully"
        }
      } catch (error) {
        results[`${table}_policy`] = `Exception: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    // Create policy for storage.objects
    try {
      const { error: storageError } = await supabase.rpc("exec_sql", {
        sql_statement: `
          DROP POLICY IF EXISTS allow_all_storage_objects ON storage.objects;
          CREATE POLICY allow_all_storage_objects ON storage.objects FOR ALL USING (true) WITH CHECK (true);
        `,
      })

      if (storageError) {
        results["storage_objects_policy"] = `Error: ${storageError.message}`
      } else {
        results["storage_objects_policy"] = "Created/updated successfully"
      }
    } catch (error) {
      results["storage_objects_policy"] = `Exception: ${error instanceof Error ? error.message : String(error)}`
    }

    return { success: true, results }
  } catch (error) {
    console.error("Error fixing RLS policies:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
