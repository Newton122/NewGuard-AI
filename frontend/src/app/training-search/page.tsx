'use client'

import { useMemo, useState } from 'react'

export default function TrainingSearchPage() {
  const [n, setN] = useState(5)
  const [board, setBoard] = useState<number[]>(() => Array.from({ length: 5 }, () => -1))
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const invalidCells = useMemo(() => {
    const occupied = new Set<number>()
    board.forEach((col, row) => {
      if (col >= 0) occupied.add(row * n + col)
    })

    const attacked = new Set<number>()
    for (let r1 = 0; r1 < n; r1 += 1) {
      const c1 = board[r1]
      if (c1 < 0) continue

      for (let r2 = r1 + 1; r2 < n; r2 += 1) {
        const c2 = board[r2]
        if (c2 < 0) continue

        const sameColumn = c1 === c2
        const sameDiagonal = Math.abs(r1 - r2) === Math.abs(c1 - c2)
        if (sameColumn || sameDiagonal) {
          attacked.add(r1 * n + c1)
          attacked.add(r2 * n + c2)
        }
      }
    }

    return attacked
  }, [board, n])

  const solved = board.length === n && board.every((value) => value >= 0) && invalidCells.size === 0

  const releaseBoard = (newN: number) => {
    setN(newN)
    setBoard(Array.from({ length: newN }, () => -1))
  }

  const runSolver = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/nqueens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n })
      })

      if (!response.ok) {
        throw new Error('Solver request failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Unable to execute the N-Queens search service.')
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (row: number, col: number) => {
    const next = [...board]
    if (next[row] === col) {
      next[row] = -1
    } else {
      next[row] = col
    }

    setBoard(next)
  }

  const resetBoard = () => {
    setBoard(Array.from({ length: n }, () => -1))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">N-Queens</p>
            <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">Training Search</h1>
            <p className="mt-4 max-w-3xl text-slate-400">
              Place one queen per row and keep every queen from attacking another.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Board size
            </label>
            <div className="flex items-center gap-3">
              <input
                className="w-24 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none"
                type="number"
                min={1}
                value={n}
                onChange={(event) => releaseBoard(Number(event.target.value) || 1)}
              />
              <button
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => releaseBoard(5)}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(540px,auto)_minmax(320px,1fr)]">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Game Board</h2>
                <p className="text-sm text-slate-500">Queens placed: {board.filter((c) => c >= 0).length}/{n}</p>
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                  onClick={resetBoard}
                >
                  Clear
                </button>
                <button
                  className="rounded-xl bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-500"
                  onClick={runSolver}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Solve'}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(48px, 1fr))` }}>
                {Array.from({ length: n * n }).map((_, index) => {
                  const row = Math.floor(index / n)
                  const col = index % n
                  const queenInCell = board[row] === col
                  const conflict = invalidCells.has(row * n + col)

                  return (
                    <button
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick(row, col)}
                      className={[
                        'aspect-square border border-slate-600 text-xl font-bold transition',
                        'hover:bg-slate-800',
                        row % 2 === col % 2 ? 'bg-slate-800/70' : 'bg-slate-900/80',
                        queenInCell ? 'bg-emerald-500 text-white' : '',
                        conflict && queenInCell ? 'ring-2 ring-rose-400' : '',
                        conflict ? 'bg-rose-900/60' : ''
                      ].join(' ')}
                    >
                      {queenInCell ? '♛' : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {solved ? 'Board is solved.' : 'Keep placing queens.'}
              </div>
              <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {invalidCells.size > 0 ? `${invalidCells.size} attack(s)` : 'No attacks'}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Search Status</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Queen placements</span>
                  <span className="font-semibold text-white">{board.filter((c) => c >= 0).length}/{n}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Safety check</span>
                  <span className={invalidCells.size > 0 ? 'font-semibold text-rose-300' : 'font-semibold text-emerald-300'}>
                    {invalidCells.size > 0 ? 'Warning' : 'Clear'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Solver API</span>
                  <span className="font-semibold text-cyan-300">online</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Training Search Results</h2>
              {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

              {result && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">N</p>
                    <p className="text-2xl font-bold text-white">{result.n}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Found solutions</p>
                    <p className="text-2xl font-bold text-emerald-300">{result.solutionCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sample boards</p>
                    <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap text-xs text-slate-300">{JSON.stringify(result.samples, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
