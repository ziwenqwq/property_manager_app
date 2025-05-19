import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PropertyManager. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/bookings" className="text-sm text-muted-foreground hover:text-foreground">
              Viewings
            </Link>
            <Link href="/feedback" className="text-sm text-muted-foreground hover:text-foreground">
              Feedback
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
