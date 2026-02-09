"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Zap, Sparkles } from "lucide-react"
import Link from "next/link"
import { createDeck } from "@/app/actions"

const emojiOptions = [
  { key: "fire", label: "\u{1F525}" },
  { key: "brain", label: "\u{1F9E0}" },
  { key: "money", label: "\u{1F4B0}" },
  { key: "rocket", label: "\u{1F680}" },
  { key: "lightning", label: "\u{26A1}" },
  { key: "star", label: "\u{2B50}" },
  { key: "muscle", label: "\u{1F4AA}" },
  { key: "book", label: "\u{1F4DA}" },
  { key: "trophy", label: "\u{1F3C6}" },
  { key: "gem", label: "\u{1F48E}" },
]

const colorOptions: { key: string; label: string; classes: string }[] = [
  { key: "cyan", label: "Cyan", classes: "bg-[hsl(187,100%,50%)]" },
  { key: "purple", label: "Purple", classes: "bg-[hsl(270,80%,65%)]" },
  { key: "green", label: "Green", classes: "bg-[hsl(150,60%,50%)]" },
  { key: "orange", label: "Orange", classes: "bg-[hsl(30,90%,55%)]" },
  { key: "pink", label: "Pink", classes: "bg-[hsl(340,75%,55%)]" },
]

export function DeckCreator() {
  const router = useRouter()
  const [emoji, setEmoji] = useState("fire")
  const [color, setColor] = useState("cyan")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("emoji", emoji)
    formData.set("color", color)

    const result = await createDeck(formData)
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.success && result.id) {
      router.push(`/play/${result.id}`)
    }
  }

  return (
    <div className="min-h-svh">
      <header className="flex items-center gap-4 px-6 py-6 md:px-12 md:py-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only md:not-sr-only">Back</span>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Create a Deck</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-bold text-foreground">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. 10 Rules for Life"
              className="rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-bold text-foreground">
              Description
              <span className="ml-2 font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="A short teaser for the deck"
              className="rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Emoji picker */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-bold text-foreground">Icon</legend>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setEmoji(opt.key)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition-all ${
                    emoji === opt.key
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border bg-card hover:border-muted-foreground"
                  }`}
                  aria-label={opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Color picker */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-bold text-foreground">Theme Color</legend>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setColor(opt.key)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${opt.classes} transition-all ${
                    color === opt.key
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={opt.label}
                >
                  <span className="sr-only">{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Cards input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="cards" className="text-sm font-bold text-foreground">
              Cards
              <span className="ml-2 font-normal text-muted-foreground">
                (one per line)
              </span>
            </label>
            <textarea
              id="cards"
              name="cards"
              required
              rows={10}
              placeholder={`High performers set specific goals.\nHigh performers embrace discomfort.\nHigh performers read daily.`}
              className="rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="font-mono text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" />
              Each line becomes a card. Write at least 2.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Zap className="h-5 w-5" />
            {isSubmitting ? "Creating..." : "Create Deck"}
          </button>
        </form>
      </main>
    </div>
  )
}
