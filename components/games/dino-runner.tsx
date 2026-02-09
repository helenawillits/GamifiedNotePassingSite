"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface DinoRunnerProps {
  onComplete: () => void
  color: string
}

const GROUND_Y = 200
const DINO_SIZE = 32
const GRAVITY = 0.8
const JUMP_FORCE = -13
const OBSTACLE_SPEED_INITIAL = 4
const GAME_DURATION = 10 // seconds to survive

interface Obstacle {
  id: number
  x: number
  width: number
  height: number
  type: "cactus" | "rock" | "spike"
}

export function DinoRunner({ onComplete, color }: DinoRunnerProps) {
  const [phase, setPhase] = useState<"waiting" | "running" | "dead" | "won">("waiting")
  const [dinoY, setDinoY] = useState(GROUND_Y - DINO_SIZE)
  const [elapsed, setElapsed] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)

  const velocityRef = useRef(0)
  const isJumpingRef = useRef(false)
  const frameRef = useRef(0)
  const lastObstacleRef = useRef(0)
  const startTimeRef = useRef(0)
  const dinoYRef = useRef(GROUND_Y - DINO_SIZE)
  const phaseRef = useRef(phase)
  const obstaclesRef = useRef<Obstacle[]>([])
  const nextIdRef = useRef(0)

  phaseRef.current = phase

  const jump = useCallback(() => {
    if (phaseRef.current === "waiting") {
      setPhase("running")
      startTimeRef.current = performance.now()
      return
    }
    if (!isJumpingRef.current && phaseRef.current === "running") {
      velocityRef.current = JUMP_FORCE
      isJumpingRef.current = true
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (phase !== "running") return

    let animId: number
    const loop = (now: number) => {
      if (phaseRef.current !== "running") return

      const elapsedSec = (now - startTimeRef.current) / 1000
      setElapsed(elapsedSec)
      setScore(Math.floor(elapsedSec * 10))

      // Check win
      if (elapsedSec >= GAME_DURATION) {
        setPhase("won")
        setTimeout(onComplete, 800)
        return
      }

      // Dino physics
      velocityRef.current += GRAVITY
      dinoYRef.current += velocityRef.current
      if (dinoYRef.current >= GROUND_Y - DINO_SIZE) {
        dinoYRef.current = GROUND_Y - DINO_SIZE
        velocityRef.current = 0
        isJumpingRef.current = false
      }
      setDinoY(dinoYRef.current)

      // Obstacle speed increases over time
      const speed = OBSTACLE_SPEED_INITIAL + elapsedSec * 0.3

      // Spawn obstacles
      frameRef.current++
      const spawnInterval = Math.max(50, 90 - Math.floor(elapsedSec * 3))
      if (frameRef.current - lastObstacleRef.current > spawnInterval) {
        lastObstacleRef.current = frameRef.current
        const types: Array<"cactus" | "rock" | "spike"> = ["cactus", "rock", "spike"]
        const type = types[Math.floor(Math.random() * types.length)]
        const h = type === "cactus" ? 30 + Math.random() * 18 : type === "rock" ? 16 + Math.random() * 10 : 22 + Math.random() * 12
        const w = type === "cactus" ? 12 : type === "rock" ? 20 + Math.random() * 10 : 14
        const ob: Obstacle = {
          id: nextIdRef.current++,
          x: 420,
          width: w,
          height: h,
          type,
        }
        obstaclesRef.current = [...obstaclesRef.current, ob]
      }

      // Move obstacles
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x > -40)

      setObstacles([...obstaclesRef.current])

      // Collision detection
      const dinoLeft = 50
      const dinoRight = dinoLeft + DINO_SIZE - 8
      const dinoTop = dinoYRef.current + 4
      const dinoBottom = dinoYRef.current + DINO_SIZE

      for (const ob of obstaclesRef.current) {
        const obLeft = ob.x
        const obRight = ob.x + ob.width
        const obTop = GROUND_Y - ob.height
        const obBottom = GROUND_Y

        if (dinoRight > obLeft && dinoLeft < obRight && dinoBottom > obTop && dinoTop < obBottom) {
          setPhase("dead")
          return
        }
      }

      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [phase, onComplete])

  // Keyboard
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [jump])

  // Restart on death
  const restart = useCallback(() => {
    setPhase("waiting")
    setDinoY(GROUND_Y - DINO_SIZE)
    dinoYRef.current = GROUND_Y - DINO_SIZE
    velocityRef.current = 0
    isJumpingRef.current = false
    frameRef.current = 0
    lastObstacleRef.current = 0
    obstaclesRef.current = []
    setObstacles([])
    setElapsed(0)
    setScore(0)
    nextIdRef.current = 0
  }, [])

  const timeLeft = Math.max(0, GAME_DURATION - elapsed)

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[OBSTACLE_COURSE] // SURVIVE 10s TO DECRYPT"}
      </p>

      {/* Game area */}
      <button
        type="button"
        onClick={jump}
        className="relative w-full max-w-md cursor-pointer focus:outline-none"
        aria-label="Jump"
      >
        <svg width="400" height="240" viewBox="0 0 400 240" className="w-full rounded-2xl border border-border bg-card/60">
          {/* Timer bar */}
          {phase === "running" && (
            <rect
              x="10"
              y="10"
              width={380 * (elapsed / GAME_DURATION)}
              height="4"
              rx="2"
              fill={color}
              opacity="0.7"
            />
          )}

          {/* Timer text */}
          <text x="380" y="30" textAnchor="end" fill={color} fontSize="12" fontFamily="monospace" opacity="0.8">
            {phase === "running" ? `${timeLeft.toFixed(1)}s` : phase === "won" ? "CLEAR!" : ""}
          </text>

          {/* Score */}
          <text x="20" y="30" fill="white" fontSize="12" fontFamily="monospace" opacity="0.6">
            {`SCORE: ${score}`}
          </text>

          {/* Ground line */}
          <line x1="0" y1={GROUND_Y} x2="400" y2={GROUND_Y} stroke="hsl(215, 20%, 30%)" strokeWidth="2" />
          {/* Ground details */}
          {Array.from({ length: 20 }, (_, i) => (
            <line
              key={`g${i}`}
              x1={i * 22 + 5}
              y1={GROUND_Y + 3}
              x2={i * 22 + 12}
              y2={GROUND_Y + 3}
              stroke="hsl(215, 20%, 22%)"
              strokeWidth="1"
            />
          ))}

          {/* Dino */}
          <g transform={`translate(50, ${dinoY})`}>
            {/* Body */}
            <rect x="4" y="8" width="20" height="18" rx="3" fill={color} />
            {/* Head */}
            <rect x="16" y="0" width="14" height="14" rx="3" fill={color} />
            {/* Eye */}
            <circle cx="26" cy="6" r="2" fill="hsl(230, 25%, 7%)" />
            {/* Legs */}
            <rect x="8" y="26" width="5" height="6" rx="1" fill={color} opacity={phase === "running" ? (frameRef.current % 10 < 5 ? 1 : 0.5) : 1} />
            <rect x="16" y="26" width="5" height="6" rx="1" fill={color} opacity={phase === "running" ? (frameRef.current % 10 < 5 ? 0.5 : 1) : 1} />
            {/* Tail */}
            <rect x="0" y="12" width="6" height="4" rx="2" fill={color} opacity="0.8" />
          </g>

          {/* Obstacles */}
          {obstacles.map((ob) => {
            if (ob.type === "cactus") {
              return (
                <g key={ob.id} transform={`translate(${ob.x}, ${GROUND_Y - ob.height})`}>
                  <rect x="2" y="0" width={ob.width - 4} height={ob.height} rx="2" fill="#22c55e" />
                  <rect x="-4" y={ob.height * 0.3} width="6" height="3" rx="1" fill="#16a34a" />
                  <rect x={ob.width - 2} y={ob.height * 0.5} width="6" height="3" rx="1" fill="#16a34a" />
                </g>
              )
            }
            if (ob.type === "rock") {
              return (
                <g key={ob.id} transform={`translate(${ob.x}, ${GROUND_Y - ob.height})`}>
                  <rect x="0" y="2" width={ob.width} height={ob.height - 2} rx="4" fill="#64748b" />
                  <rect x="2" y="0" width={ob.width - 4} height={ob.height} rx="4" fill="#475569" />
                </g>
              )
            }
            // spike
            return (
              <g key={ob.id} transform={`translate(${ob.x}, ${GROUND_Y - ob.height})`}>
                <polygon points={`0,${ob.height} ${ob.width / 2},0 ${ob.width},${ob.height}`} fill="#ef4444" />
                <polygon points={`2,${ob.height} ${ob.width / 2},4 ${ob.width - 2},${ob.height}`} fill="#dc2626" />
              </g>
            )
          })}

          {/* Phase overlays */}
          {phase === "waiting" && (
            <>
              <text x="200" y="110" textAnchor="middle" fill="white" fontSize="16" fontFamily="monospace">
                {"TAP / SPACEBAR TO START"}
              </text>
              <text x="200" y="135" textAnchor="middle" fill="white" fontSize="11" fontFamily="monospace" opacity="0.5">
                {"SURVIVE 10 SECONDS"}
              </text>
            </>
          )}

          {phase === "dead" && (
            <>
              <rect x="0" y="0" width="400" height="240" fill="hsl(0, 60%, 30%)" opacity="0.3" />
              <text x="200" y="100" textAnchor="middle" fill="#ef4444" fontSize="18" fontFamily="monospace" fontWeight="bold">
                {"SYSTEM_CRASH"}
              </text>
              <text x="200" y="130" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace" opacity="0.7">
                {"TAP TO REBOOT"}
              </text>
            </>
          )}

          {phase === "won" && (
            <>
              <rect x="0" y="0" width="400" height="240" fill={color} opacity="0.1" />
              <text x="200" y="110" textAnchor="middle" fill={color} fontSize="18" fontFamily="monospace" fontWeight="bold">
                {"COURSE_CLEARED!"}
              </text>
            </>
          )}
        </svg>
      </button>

      {phase === "dead" && (
        <button
          type="button"
          onClick={restart}
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {"[ TAP GAME OR HERE TO RETRY ]"}
        </button>
      )}
    </div>
  )
}
