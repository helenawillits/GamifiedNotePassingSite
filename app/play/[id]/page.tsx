import { notFound } from "next/navigation"
import { getDeckById, decks } from "@/lib/decks"
import { CardViewer } from "@/components/card-viewer"
import { PlayCustomClient } from "@/components/play-custom-client"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return [...decks.map((deck) => ({ id: deck.id })), { id: "custom" }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (id === "custom") return { title: "Your deck | Drop Cards" }
  const deck = getDeckById(id)
  if (!deck) return { title: "Not Found" }
  return {
    title: `${deck.title} | Drop Cards`,
    description: deck.description,
  }
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (id === "custom") return <PlayCustomClient />
  const deck = getDeckById(id)
  if (!deck) notFound()

  return <CardViewer deck={deck} />
}
