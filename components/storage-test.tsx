"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase"
import { STORAGE_BUCKETS } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Check, X } from "lucide-react"

export default function StorageTest() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    url?: string
  } | null>(null)

  async function handleFileUpload() {
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const supabase = createBrowserClient()
      const bucket = STORAGE_BUCKETS.PROPERTY_IMAGES
      const filePath = `test-upload-${Date.now()}-${file.name}`

      // Upload file
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        setUploadResult({
          success: false,
          message: `Upload failed: ${error.message}`,
        })
        return
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

      setUploadResult({
        success: true,
        message: "File uploaded successfully!",
        url: publicUrlData.publicUrl,
      })

      // Clean up after 10 seconds
      setTimeout(async () => {
        await supabase.storage.from(bucket).remove([filePath])
      }, 10000)
    } catch (error) {
      setUploadResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-4">Storage Upload Test</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={isUploading} />
          <Button onClick={handleFileUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>

        {uploadResult && (
          <div
            className={`p-4 rounded-md ${uploadResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <div className="flex items-center">
              {uploadResult.success ? (
                <Check className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <X className="h-5 w-5 text-red-500 mr-2" />
              )}
              <p className={uploadResult.success ? "text-green-700" : "text-red-700"}>{uploadResult.message}</p>
            </div>

            {uploadResult.url && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">File URL (will be automatically deleted after 10 seconds):</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={uploadResult.url}
                    readOnly
                    className="flex-1 p-2 text-xs bg-white border rounded-md font-mono"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => window.open(uploadResult.url, "_blank")}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-2">
          <p>This test will upload a file to the property-images bucket and then delete it after 10 seconds.</p>
        </div>
      </div>
    </div>
  )
}
