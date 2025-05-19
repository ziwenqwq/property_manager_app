import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#BEE3DB] dark:bg-[#BEE3DB]/80 py-6 shadow-inner">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#555B6E] font-medium">
            &copy; {new Date().getFullYear()} PropertyManager. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/" className="text-sm text-[#555B6E] hover:text-[#555B6E]/80 transition-colors">
              Home
            </Link>
            <Link href="/bookings" className="text-sm text-[#555B6E] hover:text-[#555B6E]/80 transition-colors">
              Viewings
            </Link>
            <Link href="/feedback" className="text-sm text-[#555B6E] hover:text-[#555B6E]/80 transition-colors">
              Feedback
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
