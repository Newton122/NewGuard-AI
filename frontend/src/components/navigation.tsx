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
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
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
