"use client"

import { useState, useCallback, useEffect } from "react"

interface Crack {
  id: number
  x: number
  y: number
  rotation: number
  length: number
}

interface Shard {
  id: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  vx: number
  vy: number
}

interface IceBreakProps {
  onComplete: () => void
  color: string
  cardText: string
}

export function IceBreak({ onComplete, color, cardText }: IceBreakProps) {
  const [hitsNeeded] = useState(() => Math.floor(Math.random() * 5) + 2) // 2-6
  const [hits, setHits] = useState(0)
  const [cracks, setCracks] = useState<Crack[]>([])
  const [shards, setShards] = useState<Shard[]>([])
  const [shaking, setShaking] = useState(false)
  const [shattered, setShattered] = useState(false)

  const hitIce = useCallback(() => {
    if (shattered) return

    const newHits = hits + 1
    setHits(newHits)
    setShaking(true)
    setTimeout(() => setShaking(false), 150)

    // Add new cracks
    const newCracks: Crack[] = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 70,
      rotation: Math.random() * 360,
      length: 20 + Math.random() * 40 + newHits * 5,
    }))
    setCracks((prev) => [...prev, ...newCracks])

    if (newHits >= hitsNeeded) {
      setShattered(true)
      // Generate shards flying outward
      const newShards: Shard[] = Array.from({ length: 12 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 12
        return {
          id: i,
          x: 50 + Math.cos(angle) * 20,
          y: 50 + Math.sin(angle) * 20,
          width: 15 + Math.random() * 25,
          height: 10 + Math.random() * 20,
          rotation: Math.random() * 360,
          vx: Math.cos(angle) * (3 + Math.random() * 4),
          vy: Math.sin(angle) * (3 + Math.random() * 4),
        }
      })
      setShards(newShards)

      // Animate shards flying away
      let frame = 0
      const animateShards = () => {
        frame++
        setShards((prev) =>
          prev.map((s) => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            vy: s.vy + 0.3,
            rotation: s.rotation + 5,
          }))
        )
        if (frame < 30) {
          requestAnimationFrame(animateShards)
        } else {
          setTimeout(onComplete, 300)
        }
      }
      requestAnimationFrame(animateShards)
    }
  }, [hits, shattered, onComplete])

  // Keyboard support
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        hitIce()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [hitIce])

  const iceOpacity = Math.max(0, 1 - (hits / hitsNeeded) * 0.6)
  const blurAmount = Math.max(0, 8 - (hits / hitsNeeded) * 6)

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[DATA_FROZEN] // BREAK ICE TO DECRYPT"}
      </p>

      <button
        type="button"
        onClick={hitIce}
        disabled={shattered}
        className={`relative w-full max-w-md cursor-pointer focus:outline-none ${shaking ? "animate-shake" : ""}`}
        aria-label={`Break the ice. ${hitsNeeded - hits} hits remaining`}
      >
        {/* Card underneath */}
        <div className="rounded-2xl border border-border bg-card/80 p-8 text-center md:p-10">
          <p
            className="text-lg font-semibold leading-relaxed text-foreground md:text-xl text-balance transition-all duration-300"
            style={{ filter: shattered ? "blur(0px)" : `blur(${blurAmount}px)` }}
          >
            {cardText}
          </p>
        </div>

        {/* Ice overlay */}
        {!shattered && (
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-200"
            style={{ opacity: iceOpacity }}
          >
            {/* Ice background */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(147, 220, 255, 0.5) 0%, 
                  rgba(100, 190, 240, 0.35) 30%, 
                  rgba(180, 235, 255, 0.45) 50%, 
                  rgba(120, 200, 245, 0.3) 70%, 
                  rgba(160, 225, 255, 0.5) 100%)`,
                backdropFilter: `blur(${blurAmount}px)`,
              }}
            />

            {/* Frost texture highlights */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
              }}
            />

            {/* Crack SVG lines */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {cracks.map((crack) => (
                <line
                  key={crack.id}
                  x1={crack.x}
                  y1={crack.y}
                  x2={crack.x + Math.cos((crack.rotation * Math.PI) / 180) * crack.length * 0.5}
                  y2={crack.y + Math.sin((crack.rotation * Math.PI) / 180) * crack.length * 0.5}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        )}

        {/* Flying shards */}
        {shards.map((shard) => (
          <div
            key={shard.id}
            className="pointer-events-none absolute"
            style={{
              left: `${shard.x}%`,
              top: `${shard.y}%`,
              width: `${shard.width}px`,
              height: `${shard.height}px`,
              background: "linear-gradient(135deg, rgba(180,230,255,0.7), rgba(220,245,255,0.4))",
              transform: `rotate(${shard.rotation}deg)`,
              borderRadius: "2px",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </button>

      {!shattered && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: hitsNeeded }, (_, i) => (
              <div
                key={i}
                className="h-2 w-4 rounded-sm transition-colors duration-200"
                style={{
                  backgroundColor: i < hits ? color : "hsl(230, 20%, 18%)",
                }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {`[${hits}/${hitsNeeded}]`}
          </span>
        </div>
      )}

      {!shattered && (
        <p className="font-mono text-xs text-muted-foreground animate-typing-blink">
          {"[ TAP TO CRACK ]"}
        </p>
      )}
    </div>
  )
}
