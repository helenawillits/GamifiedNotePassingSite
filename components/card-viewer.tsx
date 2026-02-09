"use client"

import { useState, useCallback, useEffect } from "react"
import { ArrowLeft, ChevronRight, RotateCcw, Home } from "lucide-react"
import Link from "next/link"
import type { CardDeck } from "@/lib/types"
import { getEmoji, getColorClasses } from "@/lib/decks"
import { Confetti } from "./confetti"

export function CardViewer({ deck }: { deck: CardDeck }) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const colors = getColorClasses(deck.color)
  const totalCards = deck.cards.length
  const isFinished = currentIndex >= totalCards
  const isIntro = currentIndex === -1

  const next = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => prev + 1)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const restart = useCallback(() => {
    setShowConfetti(false)
    setCurrentIndex(-1)
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (isFinished) {
      setShowConfetti(true)
    }
  }, [isFinished])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (isFinished) {
          restart()
        } else {
          next()
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [next, restart, isFinished])

  const progress = isIntro ? 0 : Math.min(((currentIndex + 1) / totalCards) * 100, 100)

  return (
    <div className="flex min-h-svh flex-col">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" />
          <span className="sr-only md:not-sr-only">EXIT</span>
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">{"PROGRESS //"}</span>
          <div className="h-1.5 flex-1 rounded-full bg-secondary">
            <div
              className={`h-full rounded-full ${colors.bg} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`font-mono text-[10px] ${colors.text}`}>
            {`[${isIntro ? "0" : Math.min(currentIndex + 1, totalCards)}/${totalCards}]`}
          </span>
        </div>
      </header>

      {/* Main content area */}
      <main className="scanlines relative flex flex-1 flex-col items-center justify-center px-4 pb-8 grid-bg">
        {isIntro ? (
          <div className="animate-slide-up-fade flex max-w-lg flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {"[MODULE_LOADED]"}
              </p>
              <span className="animate-float text-7xl" role="img" aria-label={deck.emoji}>
                {getEmoji(deck.emoji)}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl text-balance">
              {deck.title}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              {deck.description}
            </p>
            <button
              type="button"
              onClick={next}
              className={`hud-border mt-4 flex items-center gap-3 rounded-2xl ${colors.bg} px-8 py-4 text-lg font-bold text-background transition-all hover:scale-105 ${colors.glow}`}
            >
              <span className="font-mono text-xs opacity-70">{">"}</span>
              INITIALIZE
              <span className="inline-block h-4 w-0.5 animate-typing-blink bg-background" aria-hidden="true" />
            </button>
            <p className="font-mono text-[10px] text-muted-foreground">
              {"SPACEBAR // ARROW_KEY // ENTER"}
            </p>
          </div>
        ) : isFinished ? (
          <div className="animate-slide-up-fade flex max-w-lg flex-col items-center gap-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary animate-text-flicker">
              {"[SEQUENCE_COMPLETE]"}
            </p>
            <span className="animate-float text-7xl" role="img" aria-label="trophy">
              {"\u{1F3C6}"}
            </span>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              MISSION COMPLETE
            </h2>
            <p className="font-mono text-sm text-muted-foreground">
              {`ALL ${totalCards} NODES DECRYPTED // KNOWLEDGE ACQUIRED`}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition-all hover:scale-105 hover:border-primary"
              >
                <RotateCcw className="h-3 w-3" />
                REPLAY
              </button>
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-xl ${colors.bg} px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-all hover:scale-105`}
              >
                <Home className="h-3 w-3" />
                MAIN_MENU
              </Link>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={next}
            className="relative z-10 w-full max-w-xl cursor-pointer focus:outline-none"
            disabled={isAnimating}
          >
            <div
              key={currentIndex}
              className={`animate-slide-up-fade flex flex-col items-center gap-6 rounded-2xl border ${colors.border} bg-card/80 p-8 text-center backdrop-blur-sm transition-all md:p-12 ${colors.glow}`}
            >
              {/* Node header */}
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {`NODE_${String(currentIndex + 1).padStart(2, "0")}`}
                </span>
                <span className={`font-mono text-[10px] ${colors.text}`}>
                  {`[${currentIndex + 1}/${totalCards}]`}
                </span>
              </div>

              <p className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl text-balance">
                {deck.cards[currentIndex]}
              </p>

              <div className="flex items-center gap-2 pt-2 font-mono text-[10px] text-muted-foreground">
                <span>{"TAP_FOR_NEXT"}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </button>
        )}
      </main>
    </div>
  )
}
