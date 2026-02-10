"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
}

export function TypewriterText({ text, speed = 35, className = "" }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    setDisplayed("")
    let i = 0
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && (
        <span className="ml-0.5 inline-block h-5 w-0.5 animate-typing-blink bg-current" aria-hidden="true" />
      )}
    </span>
  )
}
