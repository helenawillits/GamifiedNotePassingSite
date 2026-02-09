"use server"

import fs from "node:fs"
import path from "node:path"
import type { CardDeck } from "@/lib/types"

function getDecksFilePath() {
  return path.join(process.cwd(), "lib", "decks.ts")
}

export async function createDeck(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const emoji = formData.get("emoji") as string
  const color = formData.get("color") as string
  const cardsRaw = formData.get("cards") as string

  if (!title || !cardsRaw) {
    return { error: "Title and cards are required" }
  }

  const cards = cardsRaw
    .split("\n")
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  if (cards.length < 2) {
    return { error: "Add at least 2 cards" }
  }

  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const newDeck: CardDeck = {
    id,
    title,
    description: description || "Tap through to discover.",
    emoji: emoji || "lightning",
    color: (color as CardDeck["color"]) || "cyan",
    cards,
    createdAt: new Date().toISOString().split("T")[0],
  }

  // Read the current file
  const filePath = getDecksFilePath()
  let fileContent = fs.readFileSync(filePath, "utf-8")

  // Find the decks array and add the new deck
  const deckString = JSON.stringify(newDeck, null, 2)
    .replace(/"([^"]+)":/g, "    $1:")
    .replace(/"/g, '"')

  // Insert before the closing bracket of the decks array
  const insertPoint = fileContent.lastIndexOf("]")
  const before = fileContent.slice(0, insertPoint)
  const after = fileContent.slice(insertPoint)

  // Build deck entry as TypeScript
  const tsEntry = `  {
    id: "${newDeck.id}",
    title: "${newDeck.title}",
    description: "${newDeck.description}",
    emoji: "${newDeck.emoji}",
    color: "${newDeck.color}",
    cards: [
${newDeck.cards.map((c) => `      "${c.replace(/"/g, '\\"')}",`).join("\n")}
    ],
    createdAt: "${newDeck.createdAt}",
  },\n`

  fileContent = before + tsEntry + after
  fs.writeFileSync(filePath, fileContent, "utf-8")

  return { success: true, id: newDeck.id }
}
