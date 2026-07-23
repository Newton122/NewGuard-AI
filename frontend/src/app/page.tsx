'use client'

import { useState } from 'react'

type PredictionResult = {
  prediction: string
  confidence: number
  model_predictions: Record<string, string>
}

export default function Home() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
        body: JSON.stringify({ text, title }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Unable to reach the prediction service. Please ensure the backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
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
              <p className="text-xs text-slate-400">BERT-powered verification</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#detector" className="hover:text-white">Detector</a>
            <a href="#how-it-works" className="hover:text-white">How It Works</a>
            <a href="#models" className="hover:text-white">Models</a>
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
            Paste any news article below and get an instant credibility assessment powered by
            BERT, a state-of-the-art NLP model trained to detect fake news.
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
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !text.trim()}
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
                    'Check News'
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
                  <div
                    className={`rounded-lg border-2 p-6 text-center ${
                      result.prediction === 'True News'
                        ? 'border-emerald-500 bg-emerald-950/40'
                        : 'border-rose-500 bg-rose-950/40'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Overall Prediction
                    </p>
                    <p
                      className={`mt-2 text-3xl font-bold ${
                        result.prediction === 'True News' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.prediction}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Model Card */}
                  <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Model Used
                    </p>
                    <p className="text-lg font-semibold text-white">BERT Fake News Detector</p>
                    <p className="text-xs text-slate-400">
                      Transformer-based NLP model fine-tuned on fake news classification
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
                Paste any news article title and body text into the input form. The system accepts
                articles from any source, country, or topic.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                2
              </div>
              <h4 className="mb-2 text-lg font-semibold text-white">BERT Analysis</h4>
              <p className="text-sm text-slate-300">
                The text is tokenized and passed through a pre-trained BERT model. The transformer
                understands context and language patterns to classify the article as real or fake.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                3
              </div>
              <h4 className="mb-2 text-lg font-semibold text-white">Get Results</h4>
              <p className="text-sm text-slate-300">
                You receive a clear prediction with a confidence score. The model highlights whether
                the article is likely real or fake based on learned language patterns.
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
                Exposes a single /predict endpoint that accepts JSON and returns predictions with
                CORS enabled for browser access.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h4 className="mb-2 text-lg font-semibold text-white">Machine Learning</h4>
              <p className="mb-3 text-sm text-slate-300">BERT Transformer</p>
              <p className="text-xs text-slate-400">
                Uses a pre-trained BERT model fine-tuned for fake news detection. The transformer
                architecture understands deep language context and semantics for much higher
                accuracy than traditional TF-IDF models.
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
              Built with Next.js, FastAPI, and BERT. Powered by HuggingFace Transformers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
