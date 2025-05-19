"use client"

import Link from "next/link"
import { Home, Calendar, MessageSquare, Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-[#BEE3DB] dark:bg-[#BEE3DB]/80 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl flex items-center text-[#555B6E]">
          <div className="bg-[#555B6E] text-white p-2 rounded-full mr-2">
            <Home className="h-5 w-5" />
          </div>
          PropertyManager
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-[#555B6E] hover:text-[#555B6E]/80 transition-colors">
              Properties
            </Link>
            <Link
              href="/bookings"
              className="text-sm font-medium text-[#555B6E] hover:text-[#555B6E]/80 transition-colors"
            >
              Viewings
            </Link>
            <Link
              href="/feedback"
              className="text-sm font-medium text-[#555B6E] hover:text-[#555B6E]/80 transition-colors"
            >
              Feedback
            </Link>
          </nav>

          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#555B6E] hover:bg-[#555B6E]/10"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#FAF9F9] dark:bg-[#555B6E] border-t border-[#89B0AE] dark:border-[#89B0AE]">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 text-[#555B6E] dark:text-white hover:bg-[#BEE3DB] dark:hover:bg-[#89B0AE]/30 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Properties
            </Link>
            <Link
              href="/bookings"
              className="flex items-center gap-2 p-2 text-[#555B6E] dark:text-white hover:bg-[#BEE3DB] dark:hover:bg-[#89B0AE]/30 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              Viewings
            </Link>
            <Link
              href="/feedback"
              className="flex items-center gap-2 p-2 text-[#555B6E] dark:text-white hover:bg-[#BEE3DB] dark:hover:bg-[#89B0AE]/30 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
