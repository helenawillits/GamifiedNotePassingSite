"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"

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
const MAZE_TEMPLATE = [
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

export function PacmanChomp({ onComplete, color }: PacmanChompProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "won">("ready")
  const [pacX, setPacX] = useState(1)
  const [pacY, setPacY] = useState(1)
  const [mouthOpen, setMouthOpen] = useState(true)
  const [direction, setDirection] = useState<"right" | "left" | "up" | "down">("right")
  const [dots, setDots] = useState<Dot[]>([])
  const [eatenCount, setEatenCount] = useState(0)
  
  const dirRef = useRef<"right" | "left" | "up" | "down">("right")
  const queuedDirRef = useRef<"right" | "left" | "up" | "down" | null>(null)
  const pacRef = useRef({ x: 1, y: 1 })
  const phaseRef = useRef(phase)
  const dotsRef = useRef<Dot[]>([])
  const eatenRef = useRef(0)

  phaseRef.current = phase

  // Initialize dots on maze paths
  const initDots = useMemo(() => {
    const d: Dot[] = []
    const cherryPositions = new Set<string>()
    // Place 4-5 cherries at random open positions
    const openPositions: Array<{x: number, y: number}> = []
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE_TEMPLATE[y][x] === 0 && !(x === 1 && y === 1)) {
          openPositions.push({x, y})
        }
      }
    }
    // Shuffle and pick first 5 for cherries
    for (let i = openPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[openPositions[i], openPositions[j]] = [openPositions[j], openPositions[i]]
    }
    for (let i = 0; i < Math.min(5, openPositions.length); i++) {
      cherryPositions.add(`${openPositions[i].x},${openPositions[i].y}`)
    }

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (MAZE_TEMPLATE[y][x] === 0 && !(x === 1 && y === 1)) {
          d.push({
            x,
            y,
            isCherry: cherryPositions.has(`${x},${y}`),
            eaten: false,
          })
        }
      }
    }
    return d
  }, [])

  const totalDots = initDots.length

  const startGame = useCallback(() => {
    setPhase("playing")
    setPacX(1)
    setPacY(1)
    pacRef.current = { x: 1, y: 1 }
    dirRef.current = "right"
    setDirection("right")
    const freshDots = initDots.map(d => ({ ...d, eaten: false }))
    setDots(freshDots)
    dotsRef.current = freshDots
    eatenRef.current = 0
    setEatenCount(0)
  }, [initDots])

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return

    const interval = setInterval(() => {
      if (phaseRef.current !== "playing") return

      setMouthOpen((prev) => !prev)

      const { x, y } = pacRef.current
      
      // Try queued direction first
      if (queuedDirRef.current) {
        const qd = queuedDirRef.current
        let nx = x, ny = y
        if (qd === "right") nx++
        if (qd === "left") nx--
        if (qd === "up") ny--
        if (qd === "down") ny++
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && MAZE_TEMPLATE[ny][nx] === 0) {
          dirRef.current = qd
          queuedDirRef.current = null
        }
      }

      const dir = dirRef.current
      let nx = x, ny = y
      if (dir === "right") nx++
      if (dir === "left") nx--
      if (dir === "up") ny--
      if (dir === "down") ny++

      // Check wall
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && MAZE_TEMPLATE[ny][nx] === 0) {
        pacRef.current = { x: nx, y: ny }
        setPacX(nx)
        setPacY(ny)
        setDirection(dir)

        // Eat dot
        const dotIdx = dotsRef.current.findIndex((d) => d.x === nx && d.y === ny && !d.eaten)
        if (dotIdx >= 0) {
          dotsRef.current = dotsRef.current.map((d, i) => (i === dotIdx ? { ...d, eaten: true } : d))
          setDots([...dotsRef.current])
          eatenRef.current++
          setEatenCount(eatenRef.current)

          // Check if all eaten
          if (eatenRef.current >= totalDots) {
            setPhase("won")
            setTimeout(onComplete, 800)
          }
        }
      }
    }, 150)

    return () => clearInterval(interval)
  }, [phase, totalDots, onComplete])

  // Keyboard input
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (phaseRef.current === "ready" && (e.key === " " || e.key === "Enter")) {
        e.preventDefault()
        startGame()
        return
      }
      if (phaseRef.current !== "playing") return

      let newDir: "right" | "left" | "up" | "down" | null = null
      if (e.key === "ArrowRight" || e.key === "d") newDir = "right"
      if (e.key === "ArrowLeft" || e.key === "a") newDir = "left"
      if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); newDir = "up" }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); newDir = "down" }

      if (newDir) {
        queuedDirRef.current = newDir
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [startGame])

  // Touch/click directional controls
  const handleTouch = useCallback((dir: "right" | "left" | "up" | "down") => {
    if (phaseRef.current === "ready") {
      startGame()
      return
    }
    if (phaseRef.current === "playing") {
      queuedDirRef.current = dir
    }
  }, [startGame])

  // Pac-man rotation
  const rotationMap = { right: 0, down: 90, left: 180, up: 270 }
  const rotation = rotationMap[direction]

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[CONSUME_ALL_DATA] // EAT EVERY DOT TO PROCEED"}
      </p>

      <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
        <span>{`CONSUMED: ${eatenCount}/${totalDots}`}</span>
      </div>

      {/* Game board */}
      <div className="relative rounded-2xl border border-border bg-card/80 p-2 overflow-hidden">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {/* Maze walls */}
          {MAZE_TEMPLATE.flatMap((row, y) =>
            row.map((cell, x) =>
              cell === 1 ? (
                <rect
                  key={`wall-${x}-${y}`}
                  x={x * CELL}
                  y={y * CELL}
                  width={CELL}
                  height={CELL}
                  fill="hsl(230, 25%, 15%)"
                  stroke="hsl(230, 30%, 22%)"
                  strokeWidth="0.5"
                />
              ) : null
            )
          )}

          {/* Dots */}
          {dots.map((dot) =>
            dot.eaten ? null : dot.isCherry ? (
              <g key={`dot-${dot.x}-${dot.y}`}>
                <circle cx={dot.x * CELL + CELL / 2} cy={dot.y * CELL + CELL / 2} r={5} fill="#ef4444" />
                <circle cx={dot.x * CELL + CELL / 2 - 1} cy={dot.y * CELL + CELL / 2 - 1} r={1.5} fill="#fca5a5" />
                <line x1={dot.x * CELL + CELL / 2} y1={dot.y * CELL + CELL / 2 - 5} x2={dot.x * CELL + CELL / 2 + 2} y2={dot.y * CELL + CELL / 2 - 8} stroke="#22c55e" strokeWidth="1" />
              </g>
            ) : (
              <circle
                key={`dot-${dot.x}-${dot.y}`}
                cx={dot.x * CELL + CELL / 2}
                cy={dot.y * CELL + CELL / 2}
                r={2.5}
                fill={color}
                opacity="0.7"
              />
            )
          )}

          {/* Pac-Man */}
          {phase !== "ready" && (
            <g transform={`translate(${pacX * CELL + CELL / 2}, ${pacY * CELL + CELL / 2}) rotate(${rotation})`}>
              {mouthOpen ? (
                <path
                  d={`M 0 0 L ${7 * Math.cos(Math.PI * 0.2)} ${7 * Math.sin(Math.PI * 0.2)} A 7 7 0 1 0 ${7 * Math.cos(-Math.PI * 0.2)} ${7 * Math.sin(-Math.PI * 0.2)} Z`}
                  fill="#fbbf24"
                />
              ) : (
                <circle r="7" fill="#fbbf24" />
              )}
              {/* Eye */}
              <circle cx="1" cy="-3" r="1.5" fill="hsl(230, 25%, 7%)" />
            </g>
          )}

          {/* Overlays */}
          {phase === "ready" && (
            <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill="white" fontSize="13" fontFamily="monospace">
              {"ARROWS / WASD TO PLAY"}
            </text>
          )}

          {phase === "won" && (
            <>
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill={color} opacity="0.1" />
              <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fill={color} fontSize="16" fontFamily="monospace" fontWeight="bold">
                {"ALL_DATA_CONSUMED!"}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Mobile D-pad controls */}
      <div className="flex flex-col items-center gap-1 md:hidden">
        <button type="button" onClick={() => handleTouch("up")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20" aria-label="Move up">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L2 10h10L7 2z" fill="currentColor"/></svg>
        </button>
        <div className="flex gap-1">
          <button type="button" onClick={() => handleTouch("left")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20" aria-label="Move left">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l8-5v10L2 7z" fill="currentColor"/></svg>
          </button>
          <div className="h-10 w-10" />
          <button type="button" onClick={() => handleTouch("right")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20" aria-label="Move right">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7L4 2v10l8-5z" fill="currentColor"/></svg>
          </button>
        </div>
        <button type="button" onClick={() => handleTouch("down")} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground active:bg-primary/20" aria-label="Move down">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12l5-8H2l5 8z" fill="currentColor"/></svg>
        </button>
      </div>

      {phase === "ready" && (
        <button
          type="button"
          onClick={startGame}
          className="font-mono text-xs text-muted-foreground animate-typing-blink"
        >
          {"[ PRESS ANY ARROW OR TAP TO BEGIN ]"}
        </button>
      )}
    </div>
  )
}
