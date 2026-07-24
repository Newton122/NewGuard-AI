import Link from 'next/link'
import { Navigation } from '../components/navigation'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-600/10 blur-3xl" style={{ animationDelay: '1s' }} />
      </div>

      <Navigation />

      <main className="relative z-10">
        <section className="border-b border-slate-800/50">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
              About <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">NewsGuard AI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              A multi-signal misinformation detection platform built with cutting-edge AI technology.
            </p>
          </div>
        </section>

        <section className="border-b border-slate-800/50 bg-slate-900/20">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h2 className="mb-8 text-3xl font-bold text-white">Our Mission</h2>
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p className="text-lg">
                In an era of information overload, distinguishing between credible journalism and misinformation
                has become increasingly challenging. NewsGuard AI was built to address this critical need by
                combining state-of-the-art natural language processing with intelligent heuristic analysis.
              </p>
              <p>
                Our platform doesn't just rely on a single model. Instead, we use a multi-signal approach that
                evaluates news articles from multiple angles: deep language understanding via BERT transformers,
                source credibility assessment, and pattern-based heuristic detection. This comprehensive analysis
                provides users with not just a verdict, but a detailed breakdown of why an article is flagged.
              </p>
              <p>
                Whether you're a journalist verifying sources, a student researching current events, or simply
                a concerned citizen trying to navigate the modern information landscape, NewsGuard AI provides
                the tools you need to make informed decisions about the content you consume and share.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800/50">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h2 className="mb-8 text-3xl font-bold text-white">Technology Stack</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Frontend</h3>
                <p className="text-sm text-slate-300 mb-2">Next.js 16 + React 19 + Tailwind CSS v4</p>
                <p className="text-xs text-slate-400">
                  Modern web framework with server-side rendering, fast refresh, and responsive styling.
                  Features smooth animations, real-time updates, and a beautiful dark theme.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Backend</h3>
                <p className="text-sm text-slate-300 mb-2">FastAPI + Uvicorn + HuggingFace Transformers</p>
                <p className="text-xs text-slate-400">
                  High-performance Python API that loads fine-tuned BERT models on startup.
                  Exposes REST endpoints with CORS enabled for seamless browser integration.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-6">
                <h3 className="mb-3 text-semibold text-white">Machine Learning</h3>
                <p className="text-sm text-slate-300 mb-2">BERT Transformer + Heuristics + Source Check</p>
                <p className="text-xs text-slate-400">
                  Uses pre-trained BERT models for deep language understanding, combined with
                  heuristic rules for emotional language detection and source credibility scoring.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">Database</h3>
                <p className="text-sm text-slate-300 mb-2">PostgreSQL with JSONB storage</p>
                <p className="text-xs text-slate-400">
                  Stores prediction history with detailed metadata including explanations,
                  entities, topics, and timestamps for comprehensive analysis tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/20">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <h2 className="mb-8 text-3xl font-bold text-white">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Input</h3>
                  <p className="text-sm text-slate-300">
                    Users paste article text or provide a URL. The system automatically scrapes and
                    extracts the main content from web pages.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Analysis</h3>
                  <p className="text-sm text-slate-300">
                    BERT evaluates language patterns and context. Heuristics detect emotional language,
                    excessive capitalization, and misinformation patterns. Source credibility is assessed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Scoring</h3>
                  <p className="text-sm text-slate-300">
                    Multi-signal scoring combines BERT (70%), source credibility (15%), and heuristics (15%)
                    for a comprehensive credibility assessment.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 font-bold">
                  4
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">Results</h3>
                  <p className="text-sm text-slate-300">
                    Users receive a detailed report with prediction, confidence score, risk level,
                    explanations, detected entities, and topic classification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white text-sm">
                FN
              </div>
              <span className="text-sm text-slate-300">NewsGuard AI</span>
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="text-sm text-slate-400 transition hover:text-white">Home</Link>
              <Link href="/history" className="text-sm text-slate-400 transition hover:text-white">History</Link>
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
