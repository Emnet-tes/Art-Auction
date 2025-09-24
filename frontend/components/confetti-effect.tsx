"use client"

import { useEffect, useState } from "react"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocity: {
    x: number
    y: number
    rotation: number
  }
}

export function ConfettiEffect() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]

    // Generate confetti pieces
    const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 3 + 2,
        rotation: (Math.random() - 0.5) * 10,
      },
    }))

    setConfetti(pieces)

    // Animate confetti
    const animateConfetti = () => {
      setConfetti(
        (prevConfetti) =>
          prevConfetti
            .map((piece) => ({
              ...piece,
              x: piece.x + piece.velocity.x,
              y: piece.y + piece.velocity.y,
              rotation: piece.rotation + piece.velocity.rotation,
              velocity: {
                ...piece.velocity,
                y: piece.velocity.y + 0.1, // gravity
              },
            }))
            .filter((piece) => piece.y < window.innerHeight + 20), // Remove pieces that fall off screen
      )
    }

    const interval = setInterval(animateConfetti, 16) // ~60fps

    // Clean up after 3 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setConfetti([])
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
        />
      ))}
    </div>
  )
}
