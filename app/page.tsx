import Link from "next/link"
import { Plus } from "lucide-react"
import { decks } from "@/lib/decks"
import { DeckCard } from "@/components/deck-card"

export default function HomePage() {
  return (
    <div className="min-h-svh">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground" aria-hidden="true">
              {"//"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Drop Cards
          </h1>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          New Deck
        </Link>
      </header>

      {/* Hero section */}
      <section className="flex flex-col items-center gap-4 px-6 pb-12 pt-8 text-center md:px-12 md:pt-12">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Unlock Knowledge
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-5xl text-balance">
          Swipe through ideas that level you up
        </h2>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          Pick a deck. Tap through the cards. Each one drops a new insight.
        </p>
      </section>

      {/* Deck grid */}
      <section className="px-6 pb-16 md:px-12" aria-label="Available card decks">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 pb-8">
        <p className="font-mono text-xs text-muted-foreground">
          Drop Cards &mdash; for the squad
        </p>
      </footer>
    </div>
  )
}
