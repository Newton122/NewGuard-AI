'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { FileText, Search, BarChart3, Shield, Globe, History, Zap } from 'lucide-react'

type PredictionResult = {
  prediction: string
  confidence: number
  risk_level: string
  bert_score: number
  source_score: number
  heuristic_score: number
  explanation: string[]
  model_predictions: Record<string, string>
  entities: string[]
  topic: string
}

type HistoryItem = {
  title: string | null
  prediction: string
  confidence: number
  risk_level: string
  topic: string | null
  created_at: string
}

export default function Home() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history?limit=20`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (e) {
      console.error('Failed to fetch history')
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, title, url, source }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setResult(data)
      fetchHistory()
    } catch (err) {
      setError('Unable to reach the prediction service. Please ensure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40'
      case 'Medium':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-950/40'
      case 'High':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/40'
      default:
        return 'text-slate-400 border-slate-500/50 bg-slate-950/40'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0a0f] to-slate-900" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 h-96 w-96 animate-float rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute top-40 right-20 h-80 w-80 animate-float rounded-full bg-purple-600/15 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 h-72 w-72 animate-float rounded-full bg-emerald-600/10 blur-3xl" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 right-1/4 h-64 w-64 animate-float rounded-full bg-pink-600/10 blur-3xl" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-pulse rounded-full bg-white/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Mouse follower */}
      <div
        className="fixed pointer-events-none z-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />

      {/* Header */}
      <header className="relative z-50 border-b border-slate-800/30 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                NewsGuard AI
              </h1>
              <p className="text-xs text-slate-400">Multi-Signal Detection</p>
            </div>
          </a>
          <nav className="hidden gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="#detector" className="group relative transition hover:text-white">
              Detector
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="group relative transition hover:text-white">
              How It Works
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
            </a>
            <a href="/about" className="group relative transition hover:text-white">
              About
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
            </a>
            <a href="/history" className="group relative transition hover:text-white">
              History
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 border-b border-slate-800/30">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/20 px-5 py-2.5 text-sm text-blue-300 backdrop-blur-sm animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
            </span>
            Powered by BERT + Multi-Signal Analysis
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Verify News with{' '}
            <span className="gradient-text-blue animate-gradient">
              AI Precision
            </span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Advanced misinformation detection using transformer models, source credibility checks,
            and intelligent heuristics. Paste text or a URL to analyze.
          </p>
          <div className="mt-12 flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <a
              href="#detector"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Start Analyzing
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl border border-slate-700/50 px-8 py-4 font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800/30 hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Detector */}
      <section id="detector" className="relative z-10 border-b border-slate-800/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Card */}
            <div className="group rounded-2xl glass p-8 shadow-2xl transition-all duration-300 hover:border-blue-500/30 card-hover">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Article Input</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="url" className="mb-2 block text-sm font-medium text-slate-300">
                    Article URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://example.com/news/article"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <label htmlFor="source" className="mb-2 block text-sm font-medium text-slate-300">
                    Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Reuters, BBC, blog name..."
                  />
                </div>

                <div>
                  <label htmlFor="text" className="mb-2 block text-sm font-medium text-slate-300">
                    Article Text
                  </label>
                  <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Paste the full article text here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (!text.trim() && !url.trim())}
                  className="btn-primary w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-xl hover:shadow-purple-500/40"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Analyze Article
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Results Card */}
            <div className="rounded-2xl glass p-8 shadow-2xl">
              <h3 className="mb-6 text-xl font-semibold text-white">Analysis Result</h3>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-4 text-red-200">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {!result && !error && (
                <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-700/30 bg-slate-950/20">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-slate-700 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <p className="mt-4 text-sm text-slate-500">Results will appear here after analysis</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Overall Verdict */}
                  <div className={`rounded-xl border-2 p-6 text-center transition-all duration-500 ${getRiskColor(result.risk_level)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Overall Prediction
                    </p>
                    <p className="mt-3 text-4xl font-bold">{result.prediction}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Confidence: {(result.confidence * 100).toFixed(1)}% | Risk: {result.risk_level}
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4 text-center transition-all duration-300 hover:border-blue-500/30 hover:scale-105">
                      <p className="text-xs text-slate-400">BERT Score</p>
                      <p className="text-xl font-bold text-white">{(result.bert_score * 100).toFixed(0)}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000" style={{ width: `${result.bert_score * 100}%` }} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4 text-center transition-all duration-300 hover:border-emerald-500/30 hover:scale-105">
                      <p className="text-xs text-slate-400">Source Score</p>
                      <p className="text-xl font-bold text-white">{(result.source_score * 100).toFixed(0)}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${result.source_score * 100}%` }} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4 text-center transition-all duration-300 hover:border-purple-500/30 hover:scale-105">
                      <p className="text-xs text-slate-400">Heuristic Score</p>
                      <p className="text-xl font-bold text-white">{(result.heuristic_score * 100).toFixed(0)}%</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-1000" style={{ width: `${result.heuristic_score * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Topic & Entities */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4 transition hover:border-blue-500/20">
                      <p className="text-xs text-slate-400">Detected Topic</p>
                      <p className="mt-1 text-sm font-semibold text-white">{result.topic}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4 transition hover:border-purple-500/20">
                      <p className="text-xs text-slate-400">Entities Detected</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {result.entities.length > 0 ? result.entities.slice(0, 3).join(', ') : 'None detected'}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="rounded-xl border border-slate-700/30 bg-slate-950/30 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Analysis Breakdown
                    </p>
                    <ul className="space-y-2">
                      {result.explanation.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent History */}
      <section id="history" className="relative z-10 border-b border-slate-800/30 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-bold text-white">Recent Analyses</h3>
            <p className="mt-2 text-sm text-slate-400">Your latest verification history</p>
          </div>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700/30 bg-slate-950/20 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-sm text-slate-400">No analyses yet. Try checking an article above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800/30 bg-slate-900/20 backdrop-blur-sm">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700/30 bg-slate-950/30">
                    <th className="py-4 px-6 font-semibold">Title</th>
                    <th className="py-4 px-6 font-semibold">Prediction</th>
                    <th className="py-4 px-6 font-semibold">Confidence</th>
                    <th className="py-4 px-6 font-semibold">Risk</th>
                    <th className="py-4 px-6 font-semibold">Topic</th>
                    <th className="py-4 px-6 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {history.map((item, idx) => (
                    <tr key={idx} className="transition hover:bg-slate-800/20">
                      <td className="py-4 px-6 max-w-xs truncate font-medium text-white">{item.title || 'Untitled'}</td>
                      <td className="py-4 px-6">
                        <span className={item.prediction === 'True News' ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-4 px-6">{(item.confidence * 100).toFixed(1)}%</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${
                          item.risk_level === 'Low' ? 'bg-emerald-950/50 text-emerald-400' :
                          item.risk_level === 'Medium' ? 'bg-yellow-950/50 text-yellow-400' :
                          'bg-rose-950/50 text-rose-400'
                        }`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="py-4 px-6">{item.topic || 'General'}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 border-b border-slate-800/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h3 className="text-4xl font-bold text-white">How It Works</h3>
            <p className="mt-4 text-slate-400">Three-step multi-signal analysis pipeline</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Input Article',
                description: 'Paste article text or a URL. The system can scrape the article automatically if you provide a link.',
                icon: FileText,
                color: 'blue'
              },
              {
                step: '02',
                title: 'Multi-Signal Analysis',
                description: 'BERT evaluates language patterns, heuristics flag suspicious wording, and source credibility is checked.',
                icon: Search,
                color: 'purple'
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Receive a prediction with confidence, risk level, explanations, detected entities, and topic classification.',
                icon: BarChart3,
                color: 'emerald'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl glass p-8 transition-all duration-300 hover:scale-105 card-hover"
              >
                <div className="absolute top-0 right-0 text-8xl font-bold text-slate-800/30 group-hover:text-blue-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                    {React.createElement(item.icon, { className: "h-7 w-7" })}
                  </div>
                  <h4 className="mb-3 text-xl font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Under the Hood */}
      <section id="models" className="relative z-10 border-b border-slate-800/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h3 className="text-4xl font-bold text-white">Under the Hood</h3>
            <p className="mt-4 text-slate-400">Powered by modern AI and web technologies</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl glass p-8 transition-all duration-300 hover:scale-105 card-hover">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 transition-colors group-hover:bg-blue-600/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold text-white">Frontend</h4>
              <p className="mb-3 text-sm text-slate-300">Next.js 16 + React 19 + Tailwind CSS v4</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Modern web framework with server-side rendering, fast refresh, and responsive styling.
                Smooth animations and real-time updates.
              </p>
            </div>
            <div className="group rounded-2xl glass p-8 transition-all duration-300 hover:scale-105 card-hover">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 transition-colors group-hover:bg-emerald-600/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold text-white">Backend</h4>
              <p className="mb-3 text-sm text-slate-300">FastAPI + Uvicorn + HuggingFace Transformers</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-performance Python API that loads fine-tuned BERT models on startup.
                Exposes /predict and /history endpoints with CORS enabled.
              </p>
            </div>
            <div className="group rounded-2xl glass p-8 transition-all duration-300 hover:scale-105 card-hover">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 transition-colors group-hover:bg-purple-600/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.502.037-.963.134-1.383.299a2.25 2.25 0 00-1.591.659L5 14.5m0 0L2.25 12.75M5 14.5h13.5m0 0l3.75-3.75M18.75 14.5H5.25" />
                </svg>
              </div>
              <h4 className="mb-2 text-xl font-semibold text-white">Machine Learning</h4>
              <p className="mb-3 text-sm text-slate-300">BERT + Heuristics + Source Check</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses pre-trained BERT models for deep language understanding, combined with heuristic
                rules and source credibility scoring for multi-signal analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/30 glass">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <a href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-sm text-slate-300">NewsGuard AI</span>
            </a>
            <div className="flex gap-6">
              <a href="/about" className="text-sm text-slate-400 transition hover:text-white">About</a>
              <a href="/history" className="text-sm text-slate-400 transition hover:text-white">History</a>
              <a href="#detector" className="text-sm text-slate-400 transition hover:text-white">Detector</a>
            </div>
            <p className="text-xs text-slate-500">
              © 2026 NewsGuard AI. Multi-signal misinformation detection platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
