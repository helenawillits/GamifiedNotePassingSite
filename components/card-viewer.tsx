"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { ArrowLeft, ChevronRight, RotateCcw, Home } from "lucide-react"
import Link from "next/link"
import type { CardDeck } from "@/lib/types"
import { getEmoji, getColorClasses } from "@/lib/decks"
import { Confetti } from "./confetti"
import { AsteroidShoot } from "./games/asteroid-shoot"
import { IceBreak } from "./games/ice-break"
import { WordGuess } from "./games/word-guess"
import { DinoRunner } from "./games/dino-runner"
import { BlockUncover } from "./games/block-uncover"
import { PacmanChomp } from "./games/pacman-chomp"

type GameType = "asteroid" | "ice" | "word" | "dino" | "blocks" | "pacman" | "none"
type CardPhase = "game" | "revealed"

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function assignGames(totalCards: number, deckId: string): GameType[] {
  const games: GameType[] = []
  const gameTypes: GameType[] = ["asteroid", "ice", "word", "dino", "blocks", "pacman"]
  // Use deck id hash as seed for consistent but varied assignment
  let seed = 0
  for (let i = 0; i < deckId.length; i++) {
    seed += deckId.charCodeAt(i)
  }

  for (let i = 0; i < totalCards; i++) {
    const r = seededRandom(seed + i * 7)
    // ~70% chance of a game, ~30% no game (just reveal card)
    if (r < 0.7) {
      const gameIndex = Math.floor(seededRandom(seed + i * 13 + 3) * gameTypes.length)
      games.push(gameTypes[gameIndex])
    } else {
      games.push("none")
    }
  }
  return games
}

export function CardViewer({ deck }: { deck: CardDeck }) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [cardPhase, setCardPhase] = useState<CardPhase>("game")
  const [showConfetti, setShowConfetti] = useState(false)
  const colors = getColorClasses(deck.color)
  const totalCards = deck.cards.length
  const isFinished = currentIndex >= totalCards
  const isIntro = currentIndex === -1

  const gameAssignments = useMemo(() => assignGames(totalCards, deck.id), [totalCards, deck.id])

  const startNextCard = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + 1
      return nextIdx
    })
    setCardPhase("game")
  }, [])

  const onGameComplete = useCallback(() => {
    setCardPhase("revealed")
  }, [])

  const goToNext = useCallback(() => {
    startNextCard()
  }, [startNextCard])

  const restart = useCallback(() => {
    setShowConfetti(false)
    setCurrentIndex(-1)
    setCardPhase("game")
  }, [])

  useEffect(() => {
    if (isFinished) {
      setShowConfetti(true)
    }
  }, [isFinished])

  // If current card has no game, auto-reveal
  useEffect(() => {
    if (!isIntro && !isFinished && currentIndex >= 0 && gameAssignments[currentIndex] === "none") {
      setCardPhase("revealed")
    }
  }, [currentIndex, gameAssignments, isIntro, isFinished])

  // Keyboard: only handle navigation when card is revealed or on intro/finished screens
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (cardPhase === "revealed" && !isFinished) {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault()
          goToNext()
        }
      } else if (isIntro) {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault()
          startNextCard()
        }
      } else if (isFinished) {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault()
          restart()
        }
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [cardPhase, isFinished, isIntro, goToNext, startNextCard, restart])

  const progress = isIntro ? 0 : Math.min(((currentIndex + 1) / totalCards) * 100, 100)
  const currentGame = currentIndex >= 0 && currentIndex < totalCards ? gameAssignments[currentIndex] : "none"

  // Color hex for game components
  const colorHexMap: Record<string, string> = {
    cyan: "hsl(187, 100%, 50%)",
    purple: "hsl(270, 80%, 65%)",
    green: "hsl(150, 60%, 50%)",
    orange: "hsl(30, 90%, 55%)",
    pink: "hsl(340, 75%, 55%)",
  }
  const colorHex = colorHexMap[deck.color]

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
              onClick={startNextCard}
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
        ) : cardPhase === "game" && currentGame !== "none" ? (
          /* Mini-game gate */
          <div key={`game-${currentIndex}`} className="relative z-10 flex w-full max-w-xl flex-col items-center">
            {/* Node indicator */}
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {`NODE_${String(currentIndex + 1).padStart(2, "0")}`}
              </span>
              <span className={`font-mono text-[10px] ${colors.text}`}>
                {`[${currentIndex + 1}/${totalCards}]`}
              </span>
            </div>

            {currentGame === "asteroid" && (
              <AsteroidShoot onComplete={onGameComplete} color={colorHex} />
            )}
            {currentGame === "ice" && (
              <IceBreak onComplete={onGameComplete} color={colorHex} cardText={deck.cards[currentIndex]} />
            )}
            {currentGame === "word" && (
              <WordGuess onComplete={onGameComplete} color={colorHex} cardText={deck.cards[currentIndex]} />
            )}
          </div>
        ) : (
          /* Revealed card */
          <div key={`card-${currentIndex}`} className="relative z-10 w-full max-w-xl">
            <div className="animate-slide-up-fade flex flex-col items-center gap-6">
              <div
                className={`w-full rounded-2xl border ${colors.border} bg-card/80 p-8 text-center backdrop-blur-sm md:p-12 ${colors.glow}`}
              >
                {/* Node header */}
                <div className="mb-6 flex w-full items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {`NODE_${String(currentIndex + 1).padStart(2, "0")}`}
                  </span>
                  <span className={`font-mono text-[10px] ${colors.text}`}>
                    {currentGame !== "none" ? "[DECRYPTED]" : `[${currentIndex + 1}/${totalCards}]`}
                  </span>
                </div>

                <p className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl text-balance">
                  {deck.cards[currentIndex]}
                </p>
              </div>

              <button
                type="button"
                onClick={goToNext}
                className={`flex items-center gap-2 rounded-xl ${colors.bg} px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-background transition-all hover:scale-105`}
              >
                {currentIndex + 1 < totalCards ? (
                  <>
                    NEXT_NODE
                    <ChevronRight className="h-3 w-3" />
                  </>
                ) : (
                  "COMPLETE_MISSION"
                )}
              </button>

              <p className="font-mono text-[10px] text-muted-foreground">
                {"SPACEBAR // ENTER"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
