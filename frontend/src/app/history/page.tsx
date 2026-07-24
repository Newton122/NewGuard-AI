import Link from 'next/link'
import { Navigation } from '../components/navigation'
import { Clock } from 'lucide-react'

type HistoryItem = {
  title: string | null
  prediction: string
  confidence: number
  risk_level: string
  topic: string | null
  created_at: string
}

async function getHistory() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  try {
    const res = await fetch(`${API_URL}/history?limit=100`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return data.history || []
    }
  } catch (e) {
    console.error('Failed to fetch history')
  }
  return []
}

export default async function HistoryPage() {
  const history = await getHistory()

  const stats = {
    total: history.length,
    fake: history.filter(h => h.prediction === 'Likely Fake' || h.prediction === 'Fake News').length,
    true: history.filter(h => h.prediction === 'True News').length,
    highRisk: history.filter(h => h.risk_level === 'High').length,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-600/10 blur-3xl" style={{ animationDelay: '1.5s' }} />
      </div>

      <Navigation />

      <main className="relative z-10">
        <section className="border-b border-slate-800/50">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-16 text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
                Analysis <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">History</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300">
                Track and review all your past news verifications
              </p>
            </div>

            {history.length > 0 && (
              <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-6 text-center">
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400 mt-1">Total Analyses</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{stats.true}</p>
                  <p className="text-xs text-slate-400 mt-1">True News</p>
                </div>
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center">
                  <p className="text-3xl font-bold text-rose-400">{stats.fake}</p>
                  <p className="text-xs text-slate-400 mt-1">Fake News</p>
                </div>
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-6 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{stats.highRisk}</p>
                  <p className="text-xs text-slate-400 mt-1">High Risk</p>
                </div>
              </div>
            )}

            <div>
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700/50 bg-slate-950/20 p-16 text-center">
                  <Clock className="mx-auto h-16 w-16 text-slate-700" />
                  <h3 className="mt-4 text-lg font-semibold text-white">No history yet</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Start analyzing articles to build your verification history.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Analyze Your First Article
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-950/30">
                        <th className="py-4 px-6 font-semibold">Title</th>
                        <th className="py-4 px-6 font-semibold">Prediction</th>
                        <th className="py-4 px-6 font-semibold">Confidence</th>
                        <th className="py-4 px-6 font-semibold">Risk</th>
                        <th className="py-4 px-6 font-semibold">Topic</th>
                        <th className="py-4 px-6 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
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
              <Link href="/about" className="text-sm text-slate-400 transition hover:text-white">About</Link>
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
