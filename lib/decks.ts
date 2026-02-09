import type { CardDeck } from "./types"

export const decks: CardDeck[] = [
  {
    id: "high-performers",
    title: "10 Differences Between High Performers and Average People",
    description: "What separates the best from the rest? Tap through to find out.",
    emoji: "fire",
    color: "cyan",
    cards: [
      "High performers set specific goals. Average people set vague ones.",
      "High performers embrace discomfort. Average people avoid it at all costs.",
      "High performers read daily. Average people watch TV daily.",
      "High performers take 100% responsibility. Average people blame others.",
      "High performers invest in themselves. Average people spend on things.",
      "High performers wake up early with purpose. Average people hit snooze.",
      "High performers say no to distractions. Average people say yes to everything.",
      "High performers learn from failure. Average people fear failure.",
      "High performers surround themselves with winners. Average people hang with anyone.",
      "High performers take action now. Average people wait for the perfect moment.",
    ],
    createdAt: "2026-02-09",
  },
  {
    id: "stoic-wisdom",
    title: "7 Stoic Principles That Will Change Your Life",
    description: "Ancient wisdom that still hits hard today.",
    emoji: "brain",
    color: "purple",
    cards: [
      "Focus only on what you can control. Everything else is noise.",
      "The obstacle is the way. Every challenge is an opportunity to grow.",
      "Memento mori. Remember you will die. So stop wasting time.",
      "Amor fati. Love your fate. Even the hard parts made you who you are.",
      "You are not disturbed by things, but by your opinion of things.",
      "Wealth is not about having a lot. It is about needing very little.",
      "The best revenge is not to be like your enemy.",
    ],
    createdAt: "2026-02-08",
  },
  {
    id: "money-rules",
    title: "8 Money Rules Nobody Teaches You in School",
    description: "Financial wisdom they forgot to mention in class.",
    emoji: "money",
    color: "green",
    cards: [
      "Pay yourself first. Before bills, before spending, save something.",
      "Your income is not your wealth. What you keep is your wealth.",
      "Avoid lifestyle inflation. Earn more, but don't spend more.",
      "Invest early. Time in the market beats timing the market.",
      "Multiple income streams are not optional. They are essential.",
      "Debt is a tool. Good debt builds assets. Bad debt buys liabilities.",
      "Never spend money to impress people you don't even like.",
      "Financial literacy is the most important skill you will ever learn.",
    ],
    createdAt: "2026-02-07",
  },
]

const emojiMap: Record<string, string> = {
  fire: "\u{1F525}",
  brain: "\u{1F9E0}",
  money: "\u{1F4B0}",
  rocket: "\u{1F680}",
  lightning: "\u{26A1}",
  star: "\u{2B50}",
  muscle: "\u{1F4AA}",
  book: "\u{1F4DA}",
  trophy: "\u{1F3C6}",
  gem: "\u{1F48E}",
}

export function getEmoji(key: string): string {
  return emojiMap[key] || "\u{1F4A1}"
}

export function getDeckById(id: string): CardDeck | undefined {
  return decks.find((d) => d.id === id)
}

export function getColorClasses(color: CardDeck["color"]) {
  const map = {
    cyan: {
      bg: "bg-[hsl(187,100%,50%)]",
      text: "text-[hsl(187,100%,50%)]",
      border: "border-[hsl(187,100%,50%)]",
      glow: "shadow-[0_0_30px_hsl(187,100%,50%,0.3)]",
      bgMuted: "bg-[hsl(187,100%,50%,0.1)]",
    },
    purple: {
      bg: "bg-[hsl(270,80%,65%)]",
      text: "text-[hsl(270,80%,65%)]",
      border: "border-[hsl(270,80%,65%)]",
      glow: "shadow-[0_0_30px_hsl(270,80%,65%,0.3)]",
      bgMuted: "bg-[hsl(270,80%,65%,0.1)]",
    },
    green: {
      bg: "bg-[hsl(150,60%,50%)]",
      text: "text-[hsl(150,60%,50%)]",
      border: "border-[hsl(150,60%,50%)]",
      glow: "shadow-[0_0_30px_hsl(150,60%,50%,0.3)]",
      bgMuted: "bg-[hsl(150,60%,50%,0.1)]",
    },
    orange: {
      bg: "bg-[hsl(30,90%,55%)]",
      text: "text-[hsl(30,90%,55%)]",
      border: "border-[hsl(30,90%,55%)]",
      glow: "shadow-[0_0_30px_hsl(30,90%,55%,0.3)]",
      bgMuted: "bg-[hsl(30,90%,55%,0.1)]",
    },
    pink: {
      bg: "bg-[hsl(340,75%,55%)]",
      text: "text-[hsl(340,75%,55%)]",
      border: "border-[hsl(340,75%,55%)]",
      glow: "shadow-[0_0_30px_hsl(340,75%,55%,0.3)]",
      bgMuted: "bg-[hsl(340,75%,55%,0.1)]",
    },
  }
  return map[color]
}
