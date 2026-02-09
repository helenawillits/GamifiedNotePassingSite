"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface PacmanChompProps {
  onComplete: () => void
  color: string
}

const CELL = 20
const COLS = 17
const ROWS = 13
const WIDTH = COLS * CELL
const HEIGHT = ROWS * CELL

// 1 = wall, 0 = path
const MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,0,0,0,1,1,0,1,1,1,1],
  [1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

interface Dot {
  x: number
  y: number
  isCherry: boolean
  eaten: boolean
}

function buildDots(): Dot[] {
  const open: Array<{ x: number; y: number }> = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (MAZE[y][x] === 0 && !(x === 1 && y === 1)) {
        open.push({ x, y })
      }
    }
  }
  // pick 5 random cherries
  const shuffled = [...open].sort(() => Math.random() - 0.5)
  const cherrySet = new Set(shuffled.slice(0, 5).map((p) => `${p.x},${p.y}`))

  return open.map((p) => ({
    x: p.x,
    y: p.y,
    isCherry: cherrySet.has(`${p.x},${p.y}`),
    eaten: false,
  }))
}

type Dir = "right" | "left" | "up" | "down"
type Phase = "ready" | "playing" | "won"

function canMove(x: number, y: number, dir: Dir): boolean {
  let nx = x
  let ny = y
  if (dir === "right") nx++
  if (dir === "left") nx--
  if (dir === "up") ny--
  if (dir === "down") ny++
  return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && MAZE[ny][nx] === 0
}

function step(x: number, y: number, dir: Dir): { x: number; y: number } {
  let nx = x
  let ny = y
  if (dir === "right") nx++
  if (dir === "left") nx--
  if (dir === "up") ny--
  if (dir === "down") ny++
  return { x: nx, y: ny }
}

export function PacmanChomp({ onComplete, color }: PacmanChompProps) {
  const [phase, setPhase] = useState<Phase>("ready")
  const [pacPos, setPacPos] = useState({ x: 1, y: 1 })
  const [mouth, setMouth] = useState(true)
  const [dir, setDir] = useState<Dir>("right")
  const [dots, setDots] = useState<Dot[]>(() => buildDots())
  const [eaten, setEaten] = useState(0)

  const dirRef = useRef<Dir>("right")
  const queueRef = useRef<Dir | null>(null)
  const posRef = useRef({ x: 1, y: 1 })
  const phaseRef = useRef<Phase>("ready")
  const dotsRef = useRef<Dot[]>(dots)
  const eatenRef = useRef(0)
  const totalDots = dots.length
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  phaseRef.current = phase
  dotsRef.current = dots

  const start = useCallback(() => {
    console.log("[v0] pacman start called, current phase:", phaseRef.current)
    if (phaseRef.current !== "ready") return
    // reset
    const newDots = buildDots()
    dotsRef.current = newDots
    eatenRef.current = 0
    posRef.current = { x: 1, y: 1 }
    dirRef.current = "right"
    queueRef.current = null

    setDots(newDots)
    setEaten(0)
    setPacPos({ x: 1, y: 1 })
    setDir("right")
    setMouth(true)
    setPhase("playing")
  }, [])

  // Game tick
  useEffect(() => {
    if (phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }

    tickRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return

      setMouth((m) => !m)

      const p = posRef.current
      let currentDir = dirRef.current

      // Try queued direction first
      if (queueRef.current && canMove(p.x, p.y, queueRef.current)) {
        currentDir = queueRef.current
        dirRef.current = currentDir
        queueRef.current = null
      }

      if (!canMove(p.x, p.y, currentDir)) return

      const next = step(p.x, p.y, currentDir)
      posRef.current = next
      setPacPos(next)
      setDir(currentDir)

      // eat dot
      const di = dotsRef.current.findIndex((d) => d.x === next.x && d.y === next.y && !d.eaten)
      if (di >= 0) {
        const updated = dotsRef.current.map((d, i) => (i === di ? { ...d, eaten: true } : d))
        dotsRef.current = updated
        setDots(updated)
        eatenRef.current++
        setEaten(eatenRef.current)

        if (eatenRef.current >= totalDots) {
          setPhase("won")
          setTimeout(onComplete, 800)
        }
      }
    }, 150)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [phase, totalDots, onComplete])

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      console.log("[v0] pacman key:", e.key, "phase:", phaseRef.current)
      if (phaseRef.current === "ready") {
        if (e.key === " " || e.key === "Enter" || e.key.startsWith("Arrow") || ["w", "a", "s", "d"].includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
          start()
          // If it was an arrow/wasd, queue that direction
          const dirMap: Record<string, Dir> = {
            ArrowRight: "right", d: "right",
            ArrowLeft: "left", a: "left",
            ArrowUp: "up", w: "up",
            ArrowDown: "down", s: "down",
          }
          if (dirMap[e.key]) {
            queueRef.current = dirMap[e.key]
          }
        }
        return
      }

      if (phaseRef.current !== "playing") return

      const dirMap: Record<string, Dir> = {
        ArrowRight: "right", d: "right",
        ArrowLeft: "left", a: "left",
        ArrowUp: "up", w: "up",
        ArrowDown: "down", s: "down",
      }
      const newDir = dirMap[e.key]
      if (newDir) {
        e.preventDefault()
        e.stopPropagation()
        queueRef.current = newDir
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [start])

  // Touch D-pad
  const tap = useCallback((d: Dir) => {
    if (phaseRef.current === "ready") {
      start()
      queueRef.current = d
      return
    }
    if (phaseRef.current === "playing") {
      queueRef.current = d
    }
  }, [start])

  const rotMap: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="animate-text-flicker font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {"[CONSUME_ALL_DATA] // EAT EVERY DOT"}
      </p>

      <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
        <span>{`CONSUMED: ${eaten}/${totalDots}`}</span>
      </div>

      {/* Game board */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-2"
        onClick={() => { if (phase === "ready") start() }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (phase === "ready" && (e.key === " " || e.key === "Enter")) {
            e.preventDefault()
            start()
          }
        }}
      >
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Walls */}
          {MAZE.flatMap((row, y) =>
            row.map((cell, x) =>
              cell === 1 ? (
                <rect
                  key={`w-${x}-${y}`}
                  x={x * CELL}
                  y={y * CELL}
                  width={CELL}
                  height={CELL}
                  fill="hsl(230, 25%, 15%)"
                  stroke="hsl(230, 30%, 22%)"
                  strokeWidth="0.5"
                />
              ) : null,
            ),
          )}

          {/* Dots */}
          {dots.map((dot) =>
            dot.eaten ? null : dot.isCherry ? (
              <g key={`d-${dot.x}-${dot.y}`}>
                <circle cx={dot.x * CELL + CELL / 2} cy={dot.y * CELL + CELL / 2} r={5} fill="#ef4444" />
                <circle cx={dot.x * CELL + CELL / 2 - 1} cy={dot.y * CELL + CELL / 2 - 1} r={1.5} fill="#fca5a5" />
                <line
                  x1={dot.x * CELL + CELL / 2}
                  y1={dot.y * CELL + CELL / 2 - 5}
                  x2={dot.x * CELL + CELL / 2 + 2}
                  y2={dot.y * CELL + CELL / 2 - 8}
                  stroke="#22c55e"
                  strokeWidth="1"
                />
              </g>
            ) : (
              <circle
                key={`d-${dot.x}-${dot.y}`}
                cx={dot.x * CELL + CELL / 2}
                cy={dot.y * CELL + CELL / 2}
                r={2.5}
                fill={color}
                opacity="0.7"
              />
            ),
          )}

          {/* Pac-Man */}
          {phase !== "ready" && (
            <g transform={`translate(${pacPos.x * CELL + CELL / 2}, ${pacPos.y * CELL + CELL / 2}) rotate(${rotMap[dir]})`}>
              {mouth ? (
                <path
                  d={`M 0 0 L ${(7 * Math.cos(Math.PI * 0.2)).toFixed(2)} ${(7 * Math.sin(Math.PI * 0.2)).toFixed(2)} A 7 7 0 1 0 ${(7 * Math.cos(-Math.PI * 0.2)).toFixed(2)} ${(7 * Math.sin(-Math.PI * 0.2)).toFixed(2)} Z`}
                  fill="#fbbf24"
                />
              ) : (
                <circle r="7" fill="#fbbf24" />
              )}
              <circle cx="1" cy="-3" r="1.5" fill="hsl(230, 25%, 7%)" />
            </g>
          )}

          {/* Ready overlay */}
          {phase === "ready" && (
            <>
              {/* Pac-Man idle preview */}
              <g transform={`translate(${1 * CELL + CELL / 2}, ${1 * CELL + CELL / 2})`}>
                <circle r="7" fill="#fbbf24" />
                <circle cx="1" cy="-3" r="1.5" fill="hsl(230, 25%, 7%)" />
              </g>
              <rect x="0" y={HEIGHT / 2 - 18} width={WIDTH} height="36" fill="hsl(230, 25%, 7%)" opacity="0.85" rx="4" />
              <text x={WIDTH / 2} y={HEIGHT / 2 + 1} textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold">
                TAP OR PRESS ANY KEY
              </text>
            </>
          )}

          {/* Won overlay */}
          {phase === "won" && (
            <>
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill={color} opacity="0.1" />
              <rect x="0" y={HEIGHT / 2 - 16} width={WIDTH} height="32" fill="hsl(230, 25%, 7%)" opacity="0.85" rx="4" />
              <text x={WIDTH / 2} y={HEIGHT / 2 + 2} textAnchor="middle" fill={color} fontSize="14" fontFamily="monospace" fontWeight="bold">
                ALL_DATA_CONSUMED!
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Mobile D-pad */}
      <div className="flex flex-col items-center gap-1 md:hidden">
        <button
          type="button"
          onClick={() => tap("up")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20"
          aria-label="Move up"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L2 10h10L7 2z" fill="currentColor" /></svg>
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => tap("left")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20"
            aria-label="Move left"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l8-5v10L2 7z" fill="currentColor" /></svg>
          </button>
          <div className="h-10 w-10" />
          <button
            type="button"
            onClick={() => tap("right")}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20"
            aria-label="Move right"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7L4 2v10l8-5z" fill="currentColor" /></svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => tap("down")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20"
          aria-label="Move down"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12l5-8H2l5 8z" fill="currentColor" /></svg>
        </button>
      </div>
    </div>
  )
}
