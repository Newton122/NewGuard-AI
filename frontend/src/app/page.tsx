'use client'

import { useState, useEffect } from 'react'

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        return 'text-emerald-400 border-emerald-500 bg-emerald-950/40'
      case 'Medium':
        return 'text-yellow-400 border-yellow-500 bg-yellow-950/40'
      case 'High':
        return 'text-rose-400 border-rose-500 bg-rose-950/40'
      default:
        return 'text-slate-400 border-slate-500 bg-slate-950/40'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              FN
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Fake News Detector</h1>
              <p className="text-xs text-slate-400">Multi-signal misinformation analysis</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#detector" className="hover:text-white">Detector</a>
            <a href="#history" className="hover:text-white">History</a>
            <a href="#how-it-works" className="hover:text-white">How It Works</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Verify news authenticity with AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Paste article text or a URL to get a multi-signal credibility analysis powered by BERT,
            source checks, and text heuristics.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#detector"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Try It Now
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-200 hover:bg-slate-800"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Detector */}
      <section id="detector" className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Input Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-white">Article Input</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="url" className="mb-1 block text-sm font-medium text-slate-300">
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com/news/article"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-300">
                    Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Reuters, BBC, blog name..."
                  />
                </div>

                <div>
                  <label htmlFor="text" className="mb-1 block text-sm font-medium text-slate-300">
                    Article Text
                  </label>
                  <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={10}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Paste the full article text here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (!text.trim() && !url.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Article'
                  )}
                </button>
              </form>
            </div>

            {/* Results Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-white">Analysis Result</h3>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/50 p-4 text-red-200">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {!result && !error && (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/50">
                  <p className="text-sm text-slate-400">Results will appear here after analysis</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Overall Verdict */}
                  <div className={`rounded-lg border-2 p-6 text-center ${getRiskColor(result.risk_level)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Overall Prediction
                    </p>
                    <p className="mt-2 text-3xl font-bold">{result.prediction}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Confidence: {(result.confidence * 100).toFixed(1)}% | Risk: {result.risk_level}
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                      <p className="text-xs text-slate-400">BERT Score</p>
                      <p className="text-lg font-semibold text-white">{(result.bert_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                      <p className="text-xs text-slate-400">Source Score</p>
                      <p className="text-lg font-semibold text-white">{(result.source_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-center">
                      <p className="text-xs text-slate-400">Heuristic Score</p>
                      <p className="text-lg font-semibold text-white">{(result.heuristic_score * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Topic & Entities */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">Topic</p>
                      <p className="text-sm font-semibold text-white">{result.topic}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">Entities</p>
                      <p className="text-sm font-semibold text-white">
                        {result.entities.length > 0 ? result.entities.slice(0, 3).join(', ') : 'None detected'}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Explanation
                    </p>
                    <ul className="space-y-1">
                      {result.explanation.map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-300">
                          • {item}
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

      {/* History */}
      <section id="history" className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="mb-10 text-center text-3xl font-bold text-white">Recent Analyses</h3>
          {history.length === 0 ? (
            <p className="text-center text-sm text-slate-400">No analyses yet. Try checking an article above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Prediction</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800">
                      <td className="py-3 px-4 max-w-xs truncate">{item.title || 'Untitled'}</td>
                      <td className="py-3 px-4">
                        <span className={item.prediction === 'True News' ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-3 px-4">{(item.confidence * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4">
                        <span className={`rounded px-2 py-1 text-xs ${
                          item.risk_level === 'Low' ? 'bg-emerald-950 text-emerald-400' :
                          item.risk_level === 'Medium' ? 'bg-yellow-950 text-yellow-400' :
                          'bg-rose-950 text-rose-400'
                        }`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.topic || 'General'}</td>
                      <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="mb-10 text-center text-3xl font-bold text-white">How It Works</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                1
              </div>
              <h4 className="mb-2 text-lg font-semibold text-white">Input Article</h4>
              <p className="text-sm text-slate-300">
                Paste article text or a URL. The system can scrape the article automatically if you provide a link.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                2
              </div>
              <h4 className="mb-2 text-lg font-semibold text-white">Multi-Signal Analysis</h4>
              <p className="text-sm text-slate-300">
                BERT evaluates language patterns, heuristics flag suspicious wording, and source credibility
                is checked. These signals are combined for a final verdict.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                3
              </div>
              <h4 className="mb-2 text-lg font-semibold text-white">Get Results</h4>
              <p className="text-sm text-slate-300">
                You receive a prediction with confidence, risk level, explanations, detected entities,
                and topic classification. Every analysis is saved to your history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="mb-10 text-center text-3xl font-bold text-white">Under the Hood</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h4 className="mb-2 text-lg font-semibold text-white">Frontend</h4>
              <p className="mb-3 text-sm text-slate-300">Next.js 16 + React 19 + Tailwind CSS v4</p>
              <p className="text-xs text-slate-400">
                Modern web framework with server-side rendering, fast refresh, and responsive
                styling. The UI is built as a client component with instant feedback and
                color-coded results.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h4 className="mb-2 text-lg font-semibold text-white">Backend</h4>
              <p className="mb-3 text-sm text-slate-300">FastAPI + Uvicorn + HuggingFace Transformers</p>
              <p className="text-xs text-slate-400">
                High-performance Python API that loads a fine-tuned BERT model on startup.
                Exposes /predict and /history endpoints with CORS enabled for browser access.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h4 className="mb-2 text-lg font-semibold text-white">Machine Learning</h4>
              <p className="mb-3 text-sm text-slate-300">BERT + Heuristics + Source Check</p>
              <p className="text-xs text-slate-400">
                Uses a pre-trained BERT model for text classification, combined with heuristic
                rules for emotional language, capitalization, and misinformation patterns,
                plus source credibility scoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white text-sm">
                FN
              </div>
              <span className="text-sm text-slate-300">Fake News Detector</span>
            </div>
            <p className="text-xs text-slate-500">
              Built with Next.js, FastAPI, and BERT. Multi-signal misinformation detection platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
