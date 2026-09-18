import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const solveBoard = (n: number) => {
  const nQueensHelper = (board: number[], n: number): number[][] => {
    const placementRow = board.length
    const validPlacements: number[][] = []

    for (let placementCol = 0; placementCol < n; placementCol += 1) {
      let allowed = true

      for (const [queenRow, queenCol] of board.map((col, row) => [row, col])) {
        if (!moveAllowed(placementRow, placementCol, queenRow, queenCol)) {
          allowed = false
          break
        }
      }

      if (allowed) {
        validPlacements.push([...board, placementCol])
      }
    }

    return validPlacements
  }

  const moveAllowed = (row1: number, col1: number, row2: number, col2: number) => {
    const sameRow = row1 !== row2
    const sameCol = col1 !== col2
    const diag = Math.abs(row1 - row2) !== Math.abs(col1 - col2)
    return sameRow && sameCol && diag
  }

  const visited = new Map<string, boolean>()
  const frontier = [[]] as number[][]
  const solutions: number[][] = []

  while (frontier.length > 0) {
    const board = frontier.pop()!
    const boardKey = JSON.stringify(board)

    if (visited.get(boardKey)) {
      continue
    }

    visited.set(boardKey, true)

    if (board.length === n) {
      solutions.push(board)
    } else {
      const children = nQueensHelper(board, n)
      frontier.push(...children.reverse())
    }
  }

  return solutions
}

const pool = process.env.POSTGRES_URL
  ? new Pool({ connectionString: process.env.POSTGRES_URL })
  : null

export async function GET() {
  return NextResponse.json({
    service: 'n-queens-training-search',
    status: 'ready',
    database: pool ? 'postgres-enabled' : 'postgres-disabled'
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const n = Number(body.n ?? body.size ?? 5)

  if (!Number.isInteger(n) || n < 1) {
    return NextResponse.json({ error: 'n must be a positive integer' }, { status: 400 })
  }

  const solutions = solveBoard(n)

  const response = {
    n,
    solutionCount: solutions.length,
    samples: solutions.slice(0, 8),
    solvedAt: new Date().toISOString()
  }

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO n_queens_runs (n, solution_count, samples, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [n, solutions.length, JSON.stringify(solutions.slice(0, 8))]
      )
    } catch (error) {
      console.error('Postgres write failed:', error)
    }
  }

  return NextResponse.json(response)
}
