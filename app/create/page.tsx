import type { Metadata } from "next"
import { DeckCreator } from "@/components/deck-creator"

export const metadata: Metadata = {
  title: "Create a Deck | Drop Cards",
  description: "Build a new card deck for your friends",
}

export default function CreatePage() {
  return <DeckCreator />
}
