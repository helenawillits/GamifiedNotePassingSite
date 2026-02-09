import React from "react"
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Drop Cards',
  description: 'Unlock knowledge one card at a time',
}

export const viewport: Viewport = {
  themeColor: '#00e5ff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_spaceGrotesk.variable} ${_jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
