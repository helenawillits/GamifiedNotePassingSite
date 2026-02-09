import Link from "next/link"
import type { CardDeck } from "@/lib/types"
import { getEmoji, getColorClasses } from "@/lib/decks"

export function DeckCard({ deck }: { deck: CardDeck }) {
  const colors = getColorClasses(deck.color)

  return (
    <Link
      href={`/play/${deck.id}`}
      className={`group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-opacity-50 hover:${colors.border} ${colors.glow.replace("shadow", "hover:shadow")}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl" role="img" aria-label={deck.emoji}>
          {getEmoji(deck.emoji)}
        </span>
        <span className={`rounded-full ${colors.bgMuted} ${colors.text} px-3 py-1 font-mono text-xs`}>
          {deck.cards.length} cards
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold leading-tight text-foreground text-balance">
          {deck.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {deck.description}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2">
        <div className={`h-1 flex-1 rounded-full ${colors.bgMuted}`}>
          <div className={`h-full w-0 rounded-full ${colors.bg} transition-all duration-500 group-hover:w-full`} />
        </div>
        <span className={`${colors.text} font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100`}>
          START
        </span>
      </div>
    </Link>
  )
}
