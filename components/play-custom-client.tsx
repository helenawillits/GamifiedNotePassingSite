"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCustomDeck } from "@/lib/create-deck-client"
import type { CardDeck } from "@/lib/types"
import { CardViewer } from "@/components/card-viewer"

export function PlayCustomClient() {
  const [deck, setDeck] = useState<CardDeck | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDeck(getCustomDeck())
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-muted-foreground">No custom deck in this session.</p>
        <Link
          href="/create"
          className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          Create a deck
        </Link>
        <Link href="/" className="text-sm text-muted-foreground underline">
          Back home
        </Link>
      </div>
    )
  }

  return <CardViewer deck={deck} />
}
