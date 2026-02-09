import type { CardDeck } from "./types"

const CUSTOM_DECK_KEY = "customDeck"

export function buildDeckFromFormData(formData: FormData): { deck?: CardDeck; error?: string } {
  const title = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim() || "Tap through to discover."
  const emoji = (formData.get("emoji") as string) || "lightning"
  const color = (formData.get("color") as string) || "cyan"
  const cardsRaw = (formData.get("cards") as string)?.trim()

  if (!title) return { error: "Title is required" }
  if (!cardsRaw) return { error: "Cards are required" }

  const cards = cardsRaw
    .split("\n")
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  if (cards.length < 2) return { error: "Add at least 2 cards" }

  const validColors: CardDeck["color"][] = ["cyan", "purple", "green", "orange", "pink"]
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const deck: CardDeck = {
    id,
    title,
    description,
    emoji,
    color: validColors.includes(color as CardDeck["color"]) ? (color as CardDeck["color"]) : "cyan",
    cards,
    createdAt: new Date().toISOString().split("T")[0],
  }

  return { deck }
}

export function saveCustomDeck(deck: CardDeck): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CUSTOM_DECK_KEY, JSON.stringify(deck))
}

export function getCustomDeck(): CardDeck | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(CUSTOM_DECK_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CardDeck
  } catch {
    return null
  }
}
