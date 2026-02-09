export interface CardDeck {
  id: string
  title: string
  description: string
  emoji: string
  color: "cyan" | "purple" | "green" | "orange" | "pink"
  cards: string[]
  createdAt: string
}
