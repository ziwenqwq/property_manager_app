import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { initializeStorage } from "./lib/storage"

export async function middleware(request: NextRequest) {
  // Initialize storage buckets if they don't exist
  await initializeStorage()

  return NextResponse.next()
}

export const config = {
  matcher: ["/"],
}
