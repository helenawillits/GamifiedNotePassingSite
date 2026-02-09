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
      <header className="flex items-center gap-4 px-4 py-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Back</span>
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-secondary">
            <div
              className={`h-full rounded-full ${colors.bg} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`font-mono text-xs ${colors.text}`}>
            {isIntro ? "0" : Math.min(currentIndex + 1, totalCards)}/{totalCards}
          </span>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        {isIntro ? (
          <div className="animate-slide-up-fade flex max-w-lg flex-col items-center gap-6 text-center">
            <span className="animate-float text-7xl" role="img" aria-label={deck.emoji}>
              {getEmoji(deck.emoji)}
            </span>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl text-balance">
              {deck.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {deck.description}
            </p>
            <button
              type="button"
              onClick={next}
              className={`mt-4 flex items-center gap-2 rounded-2xl ${colors.bg} px-8 py-4 text-lg font-bold text-background transition-all hover:scale-105 ${colors.glow}`}
            >
              Tap to Start
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="font-mono text-xs text-muted-foreground">
              or press spacebar / arrow key
            </p>
          </div>
        ) : isFinished ? (
          <div className="animate-slide-up-fade flex max-w-lg flex-col items-center gap-6 text-center">
            <span className="animate-float text-7xl" role="img" aria-label="trophy">
              {"\u{1F3C6}"}
            </span>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              You made it!
            </h2>
            <p className="text-lg text-muted-foreground">
              All {totalCards} cards unlocked.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 font-bold text-foreground transition-all hover:scale-105 hover:border-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </button>
              <Link
                href="/"
                className={`flex items-center gap-2 rounded-2xl ${colors.bg} px-6 py-3 font-bold text-background transition-all hover:scale-105`}
              >
                <Home className="h-4 w-4" />
                More Decks
              </Link>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={next}
            className="w-full max-w-xl cursor-pointer focus:outline-none"
            disabled={isAnimating}
          >
            <div
              key={currentIndex}
              className={`animate-slide-up-fade flex flex-col items-center gap-6 rounded-3xl border ${colors.border} bg-card p-8 text-center transition-all md:p-12 ${colors.glow}`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bgMuted}`}>
                <span className={`font-mono text-2xl font-bold ${colors.text}`}>
                  {currentIndex + 1}
                </span>
              </div>
              <p className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl text-balance">
                {deck.cards[currentIndex]}
              </p>
              <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
                <span>Tap for next</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        )}
      </main>
    </div>
  )
}
