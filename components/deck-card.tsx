import Link from "next/link"
import type { CardDeck } from "@/lib/types"
import { getEmoji, getColorClasses } from "@/lib/decks"

export function DeckCard({ deck, index = 0 }: { deck: CardDeck; index?: number }) {
  const colors = getColorClasses(deck.color)

  return (
    <Link
      href={`/play/${deck.id}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_0_20px_hsl(187,100%,50%,0.1)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Module header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {`MODULE_${String(index + 1).padStart(2, "0")}`}
        </span>
        <span className={`${colors.text} font-mono text-[10px]`}>
          {`[${deck.cards.length} NODES]`}
        </span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <span className="text-3xl" role="img" aria-label={deck.emoji}>
          {getEmoji(deck.emoji)}
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-sm font-bold leading-tight text-foreground text-balance">
            {deck.title}
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {deck.description}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-[10px] text-muted-foreground">
          {deck.createdAt}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
          {"[LAUNCH] >"}
        </span>
      </div>
    </Link>
  )
}
