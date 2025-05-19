"use client"

import Link from "next/link"
import { Home, Calendar, MessageSquare, Menu, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl flex items-center">
          <Home className="mr-2 h-5 w-5" />
          PropertyManager
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Properties
            </Link>
            <Link href="/bookings" className="text-sm font-medium hover:text-primary">
              Viewings
            </Link>
            <Link href="/feedback" className="text-sm font-medium hover:text-primary">
              Feedback
            </Link>
          </nav>

          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              Properties
            </Link>
            <Link
              href="/bookings"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-4 w-4" />
              Viewings
            </Link>
            <Link
              href="/feedback"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
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
