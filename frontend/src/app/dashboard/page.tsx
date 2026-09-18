'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { BarChart3, TrendingUp, Users, FileText, Activity, Shield } from 'lucide-react'

type Stats = {
  total_analyses: number
  fake_count: number
  true_count: number
  medium_count: number
  top_topics: Array<{ topic: string; count: number }>
  recent_analyses: Array<{
    title: string
    prediction: string
    confidence: number
    risk_level: string
    topic: string | null
    created_at: string
  }>
  avg_confidence: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [API_URL])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] text-slate-100 relative flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#06060a] text-slate-100 relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Failed to load dashboard data.</p>
          <button onClick={fetchStats} className="mt-4 rounded-xl bg-emerald-600 px-6 py-2 text-white">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const fakePercent = stats.total_analyses > 0 ? (stats.fake_count / stats.total_analyses) * 100 : 0
  const truePercent = stats.total_analyses > 0 ? (stats.true_count / stats.total_analyses) * 100 : 0

  return (
    <div className="min-h-screen bg-[#06060a] text-slate-100 relative">
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">Dashboard</h1>
            <p className="mt-4 text-lg text-slate-400">Real-time usage statistics and analytics</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl glass p-6 transition hover:border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Analyses</p>
                  <p className="text-2xl font-bold text-white">{stats.total_analyses}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass p-6 transition hover:border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600/10 text-rose-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fake News Detected</p>
                  <p className="text-2xl font-bold text-white">{stats.fake_count}</p>
                  <p className="text-xs text-slate-500">{fakePercent.toFixed(1)}% of total</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass p-6 transition hover:border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">True News Verified</p>
                  <p className="text-2xl font-bold text-white">{stats.true_count}</p>
                  <p className="text-xs text-slate-500">{truePercent.toFixed(1)}% of total</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass p-6 transition hover:border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/10 text-amber-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-white">{(stats.avg_confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Top Topics */}
            <div className="rounded-2xl glass p-8">
              <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Top Topics Analyzed
              </h3>
              {stats.top_topics.length === 0 ? (
                <p className="text-sm text-slate-500">No data available yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.top_topics.map((topic, idx) => {
                    const maxCount = Math.max(...stats.top_topics.map(t => t.count))
                    const width = (topic.count / maxCount) * 100
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white">{topic.topic}</span>
                          <span className="text-slate-400">{topic.count} analyses</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Analyses */}
            <div className="rounded-2xl glass p-8">
              <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
                <Activity className="h-5 w-5 text-emerald-400" />
                Recent Analyses
              </h3>
              {stats.recent_analyses.length === 0 ? (
                <p className="text-sm text-slate-500">No analyses yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.recent_analyses.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-700/30 bg-slate-950/30 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.title || 'Untitled'}</p>
                        <p className="text-xs text-slate-500">{item.topic || 'General'} • {new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${item.prediction === 'True News' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.prediction}
                        </span>
                        <span className="text-xs text-slate-500">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}