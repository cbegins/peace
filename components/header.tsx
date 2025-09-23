"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  const handleNewSession = () => {
    router.push("/")
    // Force a clean reload to reset all state
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-light text-white hover:text-white/80 transition-colors">
          Peace.
        </Link>
      </div>

      <nav className="flex items-center space-x-2">{/* Navigation removed as requested */}</nav>
    </header>
  )
}
