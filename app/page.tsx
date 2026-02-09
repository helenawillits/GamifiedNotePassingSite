import Link from "next/link"
import { Plus } from "lucide-react"
import { decks } from "@/lib/decks"
import { DeckCard } from "@/components/deck-card"
import { getEmoji, getColorClasses } from "@/lib/decks"
import { HeroTerminal } from "@/components/hero-terminal"

export default function HomePage() {
  const latestDeck = decks[0]
  const archiveDecks = decks.slice(1)
  const latestColors = getColorClasses(latestDeck.color)

  return (
    <div className="scanlines relative min-h-svh grid-bg">
      {/* Top bar - system status */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-glow-pulse rounded-full bg-primary" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            {"SYS.ONLINE"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground" aria-hidden="true">
            {"//"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            DROP_CARDS V.1.0
          </span>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-all hover:border-primary hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          NEW_MODULE
        </Link>
      </header>

      {/* Hero - Featured / latest deck */}
      <section className="relative flex flex-col items-center px-4 pb-6 pt-12 md:px-8 md:pb-10 md:pt-20">
        {/* System access text */}
        <HeroTerminal />

        {/* Featured deck card */}
        <div className="mt-8 flex w-full max-w-2xl flex-col items-center gap-8 md:mt-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="animate-float text-6xl md:text-7xl" role="img" aria-label={latestDeck.emoji}>
              {getEmoji(latestDeck.emoji)}
            </span>
            <div className="flex flex-col gap-2">
              <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${latestColors.text}`}>
                {"[LATEST_DROP]"}
              </p>
              <h2 className="max-w-lg text-2xl font-bold leading-tight text-foreground md:text-4xl text-balance">
                {latestDeck.title}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                {latestDeck.description}
              </p>
            </div>
          </div>

          {/* Big START button */}
          <Link
            href={`/play/${latestDeck.id}`}
            className={`hud-border group relative flex items-center gap-4 rounded-2xl ${latestColors.bg} px-10 py-5 text-lg font-bold text-background transition-all hover:scale-105 md:px-14 md:py-6 md:text-xl ${latestColors.glow}`}
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="font-mono text-xs opacity-70">{">"}</span>
              START_MODULE
              <span className="inline-block h-5 w-0.5 animate-typing-blink bg-background" aria-hidden="true" />
            </span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
            <span>{latestDeck.cards.length} NODES</span>
            <span aria-hidden="true">{"/"}</span>
            <span>SPACEBAR TO LAUNCH</span>
          </div>
        </div>
      </section>

      {/* Divider with label */}
      <div className="flex items-center gap-4 px-4 py-6 md:px-8 md:py-8">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {"[ARCHIVE_MODULES]"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Archive grid */}
      <section className="px-4 pb-12 md:px-8" aria-label="Archived card decks">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archiveDecks.map((deck, i) => (
            <DeckCard key={deck.id} deck={deck} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center border-t border-border px-4 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {"// END_TRANSMISSION // SYSTEM_IDLE // V.1.0"}
        </p>
      </footer>
    </div>
  )
}
