import InitializeStorage from "@/components/initialize-storage"
import FixRLSPolicies from "@/components/fix-rls-policies"
import SupabaseSetupTest from "@/components/supabase-setup-test"
import StorageTest from "@/components/storage-test"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Supabase Setup</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Test Current Setup</h2>
          <SupabaseSetupTest />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Initialize Storage Buckets</h2>
          <InitializeStorage />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 3: Fix Row Level Security Policies</h2>
          <FixRLSPolicies />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 4: Test Storage Upload</h2>
          <StorageTest />
        </div>
      </div>
    </div>
  )
}
