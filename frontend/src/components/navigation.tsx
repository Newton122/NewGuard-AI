'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-slate-800/50 bg-slate-900/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
<div className="relative flex h-10 w-10 items-center justify-center">
             <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
             <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30">
               <img src="/logo-icon.png" alt="Logo" className="h-6 w-6 object-contain" />
             </div>
           </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NewsGuard AI
            </h1>
            <p className="text-xs text-slate-400">Multi-Signal Detection</p>
          </div>
        </Link>

        <nav className="hidden gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link href="/#detector" className="group relative transition hover:text-white">
            Detector
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/#how-it-works" className="group relative transition hover:text-white">
            How It Works
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/dashboard" className="group relative transition hover:text-white">
            Dashboard
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/training-search" className="group relative transition hover:text-white">
            Training Search
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/faq" className="group relative transition hover:text-white">
            FAQ
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/about" className="group relative transition hover:text-white">
            About
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
          <Link href="/history" className="group relative transition hover:text-white">
            History
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all group-hover:w-full" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
