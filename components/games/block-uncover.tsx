"use client"

import { useState, useMemo, useCallback, useEffect } from "react"

interface BlockUncoverProps {
  onComplete: () => void
  color: string
}

interface Block {
  id: number
  x: number
  y: number
  icon: string
  revealed: boolean
  hasFrog: boolean
}

const GRID_COLS = 5
const GRID_ROWS = 4
const BLOCK_ICONS = ["#", "*", "~", "+", "@", "%", "&", "^", "!", "?"]

export function BlockUncover({ onComplete, color }: BlockUncoverProps) {
  const [phase, setPhase] = useState<"playing" | "found" | "done">("playing")
  const [frogPos, setFrogPos] = useState({ x: 0, y: 0 })
  const [frogExiting, setFrogExiting] = useState(false)

  const blocks = useMemo(() => {
    const total = GRID_COLS * GRID_ROWS
    const frogIndex = Math.floor(Math.random() * total)
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      x: i % GRID_COLS,
      y: Math.floor(i / GRID_COLS),
      icon: BLOCK_ICONS[Math.floor(Math.random() * BLOCK_ICONS.length)],
      revealed: false,
      hasFrog: i === frogIndex,
    }))
  }, [])

  const [blockStates, setBlockStates] = useState<Block[]>(blocks)

  const revealBlock = useCallback(
    (id: number) => {
      if (phase !== "playing") return
      setBlockStates((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, revealed: true } : b))
        const clickedBlock = updated.find((b) => b.id === id)
        if (clickedBlock?.hasFrog) {
          // Found the frog!
          setPhase("found")
          setFrogPos({ x: clickedBlock.x, y: clickedBlock.y })
          setTimeout(() => {
            setFrogExiting(true)
            setTimeout(() => {
              setPhase("done")
              setTimeout(onComplete, 300)
            }, 800)
          }, 600)
        }
        return updated
      })
    },
    [phase, onComplete]
  )

  // Keyboard support: nothing special needed, it's click-based
  const revealedCount = blockStates.filter((b) => b.revealed).length
  const totalBlocks = blockStates.length

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[ENTITY_HIDDEN] // LOCATE THE FROG TO PROCEED"}
      </p>

      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span>{`SCANNED: ${revealedCount}/${totalBlocks}`}</span>
      </div>

      {/* Block grid */}
      <div
        className="relative grid gap-2 rounded-2xl border border-border bg-card/60 p-4"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
      >
        {blockStates.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => revealBlock(block.id)}
            disabled={block.revealed || phase !== "playing"}
            className={`relative flex h-14 w-14 items-center justify-center rounded-lg border text-lg font-bold transition-all duration-200 md:h-16 md:w-16 ${
              block.revealed
                ? block.hasFrog
                  ? "border-primary bg-primary/20 scale-110"
                  : "border-border/50 bg-secondary/30 opacity-50 scale-95"
                : "border-border bg-secondary hover:border-primary/50 hover:bg-secondary/80 hover:scale-105 cursor-pointer"
            }`}
            aria-label={block.revealed ? (block.hasFrog ? "Frog found!" : "Empty") : `Block ${block.id + 1}`}
          >
            {block.revealed ? (
              block.hasFrog ? (
                <span
                  className={`text-2xl transition-all duration-500 ${frogExiting ? "translate-y-[-100px] opacity-0 scale-150" : "animate-slide-up-fade"}`}
                  role="img"
                  aria-label="frog"
                >
                  {"\u{1F438}"}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground opacity-40">
                  {"--"}
                </span>
              )
            ) : (
              <span className="font-mono text-sm" style={{ color }}>
                {block.icon}
              </span>
            )}
          </button>
        ))}

        {/* Frog found overlay flash */}
        {phase === "found" && !frogExiting && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl animate-glow-pulse" style={{ boxShadow: `0 0 40px ${color}40` }} />
        )}
      </div>

      {phase === "playing" && (
        <p className="font-mono text-xs text-muted-foreground animate-typing-blink">
          {"[ CLICK BLOCKS TO SEARCH ]"}
        </p>
      )}

      {phase === "found" && (
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-text-flicker" style={{ color }}>
          {"[ENTITY_LOCATED] // FROG ESCAPING..."}
        </p>
      )}
    </div>
  )
}
