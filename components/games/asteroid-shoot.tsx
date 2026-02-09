"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

interface AsteroidShootProps {
  onComplete: () => void
  color: string
}

export function AsteroidShoot({ onComplete, color }: AsteroidShootProps) {
  const [phase, setPhase] = useState<"ready" | "firing" | "exploding" | "done">("ready")
  const [laserY, setLaserY] = useState(320)
  const [particles, setParticles] = useState<Particle[]>([])
  const [shake, setShake] = useState(false)
  const animRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const asteroidY = 60
  const centerX = 160

  const fire = useCallback(() => {
    if (phase !== "ready") return
    setPhase("firing")
    setLaserY(320)

    let y = 320
    const animate = () => {
      y -= 14
      setLaserY(y)
      if (y <= asteroidY + 20) {
        // Hit! Explode
        setPhase("exploding")
        setShake(true)
        setTimeout(() => setShake(false), 300)

        const colors = [color, "#ffffff", "#fbbf24", "#fb923c", "#ef4444"]
        const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.5
          const speed = 2 + Math.random() * 5
          return {
            id: i,
            x: centerX,
            y: asteroidY + 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
          }
        })
        setParticles(newParticles)

        // Animate particles
        let frame = 0
        const particleAnim = () => {
          frame++
          setParticles((prev) =>
            prev
              .map((p) => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.15,
                life: p.life - 0.025,
                size: p.size * 0.97,
              }))
              .filter((p) => p.life > 0)
          )
          if (frame < 50) {
            animRef.current = requestAnimationFrame(particleAnim)
          } else {
            setPhase("done")
            setTimeout(onComplete, 200)
          }
        }
        animRef.current = requestAnimationFrame(particleAnim)
      } else {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }, [phase, onComplete, color])

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Keyboard support
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        fire()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [fire])

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[THREAT_DETECTED] // DESTROY TO PROCEED"}
      </p>

      <button
        type="button"
        onClick={fire}
        disabled={phase !== "ready"}
        className={`relative focus:outline-none ${shake ? "animate-shake" : ""}`}
        aria-label="Fire at asteroid"
      >
        <svg width="320" height="380" viewBox="0 0 320 380" className="overflow-visible">
          {/* Stars background */}
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * 320}
              cy={Math.random() * 380}
              r={Math.random() * 1.5 + 0.5}
              fill="white"
              opacity={Math.random() * 0.5 + 0.2}
            />
          ))}

          {/* Asteroid */}
          {phase !== "exploding" && phase !== "done" && (
            <g className="animate-float">
              <circle cx={centerX} cy={asteroidY + 20} r="28" fill="#4a4a5a" />
              <circle cx={centerX - 8} cy={asteroidY + 14} r="6" fill="#3a3a48" />
              <circle cx={centerX + 10} cy={asteroidY + 26} r="4" fill="#3a3a48" />
              <circle cx={centerX + 2} cy={asteroidY + 10} r="3" fill="#5a5a6a" />
              {/* Glow ring */}
              <circle
                cx={centerX}
                cy={asteroidY + 20}
                r="34"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.4"
                className="animate-glow-pulse"
              />
            </g>
          )}

          {/* Explosion particles */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={p.life}
            />
          ))}

          {/* Laser beam */}
          {phase === "firing" && (
            <>
              <line
                x1={centerX}
                y1={laserY}
                x2={centerX}
                y2={laserY + 20}
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={centerX}
                y1={laserY}
                x2={centerX}
                y2={laserY + 20}
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Spaceship */}
          <g>
            {/* Engine glow */}
            <ellipse cx={centerX} cy={360} rx="8" ry="12" fill={color} opacity="0.3" className="animate-glow-pulse" />
            {/* Body */}
            <polygon points={`${centerX},325 ${centerX - 14},355 ${centerX + 14},355`} fill="#e2e8f0" />
            {/* Cockpit */}
            <polygon points={`${centerX},330 ${centerX - 6},344 ${centerX + 6},344`} fill={color} />
            {/* Wings */}
            <polygon points={`${centerX - 14},355 ${centerX - 22},365 ${centerX - 8},350`} fill="#94a3b8" />
            <polygon points={`${centerX + 14},355 ${centerX + 22},365 ${centerX + 8},350`} fill="#94a3b8" />
          </g>
        </svg>
      </button>

      {phase === "ready" && (
        <p className="font-mono text-xs text-muted-foreground animate-typing-blink">
          {"[ TAP TO FIRE ]"}
        </p>
      )}
    </div>
  )
}
