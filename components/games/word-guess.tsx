"use client"

import React from "react"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"

interface WordGuessProps {
  onComplete: () => void
  color: string
  cardText: string
}

function pickKeyword(text: string): { word: string; index: number } {
  // Split into words, pick a meaningful one (4+ chars, no punctuation-only)
  const words = text.split(/\s+/)
  const candidates = words
    .map((w, i) => ({ word: w.replace(/[^a-zA-Z]/g, ""), index: i, original: w }))
    .filter((w) => w.word.length >= 4)

  if (candidates.length === 0) {
    // Fallback: pick the longest word
    const sorted = words
      .map((w, i) => ({ word: w.replace(/[^a-zA-Z]/g, ""), index: i }))
      .filter((w) => w.word.length >= 2)
      .sort((a, b) => b.word.length - a.word.length)
    return sorted[0] || { word: words[0], index: 0 }
  }

  // Pick a random candidate from the longer half
  candidates.sort((a, b) => b.word.length - a.word.length)
  const topHalf = candidates.slice(0, Math.max(1, Math.ceil(candidates.length / 2)))
  const pick = topHalf[Math.floor(Math.random() * topHalf.length)]
  return { word: pick.word.toLowerCase(), index: pick.index }
}

function buildDisplayText(text: string, wordIndex: number, revealed: boolean): React.ReactNode[] {
  const words = text.split(/\s+/)
  return words.map((w, i) => {
    if (i === wordIndex && !revealed) {
      return (
        <span key={i} className="inline-block mx-1">
          {"_".repeat(w.replace(/[^a-zA-Z]/g, "").length)}
        </span>
      )
    }
    if (i === wordIndex && revealed) {
      return (
        <span key={i} className="inline-block mx-1 text-primary font-bold animate-slide-up-fade">
          {w}
        </span>
      )
    }
    return <span key={i}> {w} </span>
  })
}

export function WordGuess({ onComplete, color, cardText }: WordGuessProps) {
  const keyword = useMemo(() => pickKeyword(cardText), [cardText])
  const [guess, setGuess] = useState("")
  const [revealed, setRevealed] = useState(false)
  const [wrongShake, setWrongShake] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus the input
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const getHint = useCallback(() => {
    const word = keyword.word
    if (hintLevel === 0) {
      return `${word.length} letters`
    }
    if (hintLevel === 1) {
      return `Starts with "${word[0].toUpperCase()}"`
    }
    if (hintLevel === 2) {
      // Show first and last letter
      return `${word[0].toUpperCase()}${"_".repeat(word.length - 2)}${word[word.length - 1].toUpperCase()}`
    }
    return word.toUpperCase()
  }, [keyword.word, hintLevel])

  const checkGuess = useCallback(() => {
    const clean = guess.trim().toLowerCase().replace(/[^a-z]/g, "")
    if (clean === keyword.word) {
      setRevealed(true)
      setTimeout(onComplete, 1200)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setWrongShake(true)
      setTimeout(() => setWrongShake(false), 400)
      setGuess("")
      // Give hints after wrong attempts
      if (newAttempts >= 1 && hintLevel < 3) {
        setHintLevel((prev) => prev + 1)
      }
      // Auto-reveal after 5 wrong attempts
      if (newAttempts >= 5) {
        setRevealed(true)
        setTimeout(onComplete, 1200)
      }
    }
  }, [guess, keyword.word, onComplete, attempts, hintLevel])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (guess.trim()) {
        checkGuess()
      }
    },
    [guess, checkGuess]
  )

  const skipWord = useCallback(() => {
    setRevealed(true)
    setTimeout(onComplete, 1200)
  }, [onComplete])

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground animate-text-flicker">
        {"[PARTIAL_DECRYPT] // COMPLETE THE SEQUENCE"}
      </p>

      {/* Card with missing word */}
      <div className="w-full rounded-2xl border border-border bg-card/80 p-8 text-center md:p-10">
        <p className="text-lg font-semibold leading-relaxed text-foreground md:text-xl text-balance">
          {buildDisplayText(cardText, keyword.index, revealed)}
        </p>
      </div>

      {!revealed && (
        <>
          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col items-center gap-3">
            <div className={`relative w-full ${wrongShake ? "animate-shake" : ""}`}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                {">"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="TYPE YOUR GUESS..."
                className="w-full rounded-xl border border-border bg-secondary px-8 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="off"
                autoCapitalize="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-block h-4 w-0.5 animate-typing-blink" style={{ backgroundColor: color }} />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-background transition-all hover:scale-105"
              style={{ backgroundColor: color }}
            >
              {"DECRYPT"}
            </button>
          </form>

          {/* Hint + skip */}
          <div className="flex flex-col items-center gap-2">
            {hintLevel > 0 && (
              <p className="font-mono text-xs text-muted-foreground">
                {`HINT: ${getHint()}`}
              </p>
            )}
            {attempts >= 3 && (
              <button
                type="button"
                onClick={skipWord}
                className="font-mono text-[10px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                {"[SKIP_DECRYPT]"}
              </button>
            )}
          </div>
        </>
      )}

      {revealed && (
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          {"[DECRYPTED_SUCCESSFULLY]"}
        </p>
      )}
    </div>
  )
}
