"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"

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
  const hitsNeeded = useMemo(() => Math.floor(Math.random() * 11) + 2, []) // 2-12
  const [hits, setHits] = useState(0)
  const [phase, setPhase] = useState<"ready" | "firing" | "exploding" | "done">("ready")
  const [laserY, setLaserY] = useState(320)
  const [particles, setParticles] = useState<Particle[]>([])
  const [shake, setShake] = useState(false)
  const [impactFlashes, setImpactFlashes] = useState<{ id: number; x: number; y: number }[]>([])
  const animRef = useRef<number>(0)

  const asteroidY = 60
  const centerX = 160
  // Asteroid grows with hitsNeeded: base 18 + scale up to 42
  const asteroidRadius = 18 + (hitsNeeded / 12) * 24

  const fire = useCallback(() => {
    if (phase !== "ready") return
    setPhase("firing")
    setLaserY(320)

    let y = 320
    const animate = () => {
      y -= 16
      setLaserY(y)
      if (y <= asteroidY + asteroidRadius) {
        const newHits = hits + 1
        setHits(newHits)
        setShake(true)
        setTimeout(() => setShake(false), 200)

        // Small impact flash
        const flashX = centerX + (Math.random() - 0.5) * asteroidRadius
        const flashY = asteroidY + 20 + (Math.random() - 0.5) * asteroidRadius * 0.6
        setImpactFlashes((prev) => [...prev, { id: Date.now(), x: flashX, y: flashY }])
        setTimeout(() => setImpactFlashes((prev) => prev.slice(1)), 300)

        if (newHits >= hitsNeeded) {
          // Final hit: big explosion
          setPhase("exploding")

          const colors = [color, "#ffffff", "#fbbf24", "#fb923c", "#ef4444"]
          const newParticles: Particle[] = Array.from({ length: 32 }, (_, i) => {
            const angle = (Math.PI * 2 * i) / 32 + Math.random() * 0.5
            const speed = 2 + Math.random() * 6
            return {
              id: i,
              x: centerX,
              y: asteroidY + 20,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 3 + Math.random() * 8,
              color: colors[Math.floor(Math.random() * colors.length)],
              life: 1,
            }
          })
          setParticles(newParticles)

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
          // Not dead yet, reset to ready
          setPhase("ready")
        }
      } else {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }, [phase, hits, hitsNeeded, onComplete, color, asteroidRadius])

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

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

  // Damage visual: cracks get more intense
  const damageRatio = hits / hitsNeeded
  const asteroidColor = `hsl(0, 0%, ${Math.max(20, 35 - damageRatio * 15)}%)`
  const glowOpacity = 0.3 + damageRatio * 0.5

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
        aria-label={`Fire at asteroid. ${hitsNeeded - hits} hits remaining`}
      >
        <svg width="320" height="380" viewBox="0 0 320 380" className="overflow-visible">
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={`star-${i}`}
              cx={(i * 97 + 31) % 320}
              cy={(i * 67 + 13) % 380}
              r={((i * 3 + 1) % 3) * 0.5 + 0.5}
              fill="white"
              opacity={((i * 7 + 2) % 5) * 0.1 + 0.2}
            />
          ))}

          {/* Asteroid */}
          {phase !== "exploding" && phase !== "done" && (
            <g className="animate-float">
              <circle cx={centerX} cy={asteroidY + 20} r={asteroidRadius} fill={asteroidColor} />
              {/* Craters */}
              <circle cx={centerX - asteroidRadius * 0.3} cy={asteroidY + 14} r={asteroidRadius * 0.15} fill="hsl(0,0%,22%)" />
              <circle cx={centerX + asteroidRadius * 0.35} cy={asteroidY + 26} r={asteroidRadius * 0.1} fill="hsl(0,0%,22%)" />
              <circle cx={centerX + asteroidRadius * 0.05} cy={asteroidY + 10} r={asteroidRadius * 0.08} fill="hsl(0,0%,40%)" />
              {/* Damage cracks */}
              {damageRatio > 0.2 && (
                <line x1={centerX - asteroidRadius * 0.5} y1={asteroidY + 15} x2={centerX + asteroidRadius * 0.3} y2={asteroidY + 28} stroke="#ef4444" strokeWidth="1" opacity={damageRatio} />
              )}
              {damageRatio > 0.5 && (
                <>
                  <line x1={centerX} y1={asteroidY + 5} x2={centerX - asteroidRadius * 0.2} y2={asteroidY + 35} stroke="#fb923c" strokeWidth="1.5" opacity={damageRatio} />
                  <line x1={centerX + asteroidRadius * 0.2} y1={asteroidY + 8} x2={centerX + asteroidRadius * 0.4} y2={asteroidY + 30} stroke="#fbbf24" strokeWidth="1" opacity={damageRatio * 0.8} />
                </>
              )}
              {/* Glow ring, intensifies with damage */}
              <circle
                cx={centerX}
                cy={asteroidY + 20}
                r={asteroidRadius + 6}
                fill="none"
                stroke={damageRatio > 0.6 ? "#ef4444" : color}
                strokeWidth="1.5"
                opacity={glowOpacity}
                className="animate-glow-pulse"
              />
            </g>
          )}

          {/* Impact flashes */}
          {impactFlashes.map((f) => (
            <circle key={f.id} cx={f.x} cy={f.y} r="6" fill="white" opacity="0.8">
              <animate attributeName="r" from="4" to="14" dur="0.25s" fill="freeze" />
              <animate attributeName="opacity" from="0.9" to="0" dur="0.25s" fill="freeze" />
            </circle>
          ))}

          {/* Explosion particles */}
          {particles.map((p) => (
            <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.life} />
          ))}

          {/* Laser beam */}
          {phase === "firing" && (
            <>
              <line x1={centerX} y1={laserY} x2={centerX} y2={laserY + 20} stroke={color} strokeWidth="3" strokeLinecap="round" />
              <line x1={centerX} y1={laserY} x2={centerX} y2={laserY + 20} stroke="white" strokeWidth="1" strokeLinecap="round" />
            </>
          )}

          {/* Spaceship */}
          <g>
            <ellipse cx={centerX} cy={360} rx="8" ry="12" fill={color} opacity="0.3" className="animate-glow-pulse" />
            <polygon points={`${centerX},325 ${centerX - 14},355 ${centerX + 14},355`} fill="#e2e8f0" />
            <polygon points={`${centerX},330 ${centerX - 6},344 ${centerX + 6},344`} fill={color} />
            <polygon points={`${centerX - 14},355 ${centerX - 22},365 ${centerX - 8},350`} fill="#94a3b8" />
            <polygon points={`${centerX + 14},355 ${centerX + 22},365 ${centerX + 8},350`} fill="#94a3b8" />
          </g>
        </svg>
      </button>

      {phase === "ready" && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: hitsNeeded }, (_, i) => (
              <div
                key={i}
                className="h-2 rounded-sm transition-colors duration-200"
                style={{
                  width: `${Math.max(6, 80 / hitsNeeded)}px`,
                  backgroundColor: i < hits ? color : "hsl(230, 20%, 18%)",
                }}
              />
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground animate-typing-blink">
            {`[ TAP TO FIRE // ${hitsNeeded - hits} LEFT ]`}
          </p>
        </div>
      )}
    </div>
  )
}
