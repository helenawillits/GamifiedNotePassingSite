"use client"

import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  color: string
  size: number
  rotation: number
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const colors = [
      "hsl(187, 100%, 50%)",
      "hsl(270, 80%, 65%)",
      "hsl(150, 60%, 50%)",
      "hsl(43, 100%, 60%)",
      "hsl(340, 75%, 55%)",
    ]
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    }))
    setPieces(newPieces)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="animate-confetti absolute"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            animationDelay: `${piece.delay}s`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.id % 3 === 0 ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
