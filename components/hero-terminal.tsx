"use client"

import { useState, useEffect } from "react"

const bootLines = [
  { text: "> INITIALIZING DROP_CARDS...", delay: 0 },
  { text: "> SYSTEM ACCESS GRANTED // V.1.0", delay: 400 },
  { text: "> KNOWLEDGE MODULES LOADED [3/3]", delay: 800 },
  { text: "> READY_FOR_INPUT", delay: 1200 },
]

export function HeroTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timers = bootLines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex w-full max-w-lg flex-col gap-1.5 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur-sm md:px-5 md:py-4">
      {bootLines.map((line, i) => (
        <div
          key={line.text}
          className={`animate-boot-in font-mono text-[11px] leading-relaxed transition-opacity md:text-xs ${
            i < visibleLines ? "opacity-100" : "opacity-0"
          } ${i === bootLines.length - 1 ? "text-primary" : "text-muted-foreground"}`}
          style={{ animationDelay: `${line.delay}ms` }}
          aria-hidden={i >= visibleLines}
        >
          {line.text}
          {i === visibleLines - 1 && i === bootLines.length - 1 && (
            <span className="ml-1 inline-block h-3 w-1.5 animate-typing-blink bg-primary" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}
