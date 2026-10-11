import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/env'

// Shared plumbing for the arcade games: round lifecycle, best score, canvas sizing.

export type Phase = 'idle' | 'playing' | 'over'

function readBest(key: string) {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

// Best score per game, kept in localStorage when the browser allows it.
export function useBest(key: string) {
  const [best, setBest] = useState(() => readBest(key))
  const submit = useCallback(
    (score: number) => {
      setBest((b) => {
        if (score <= b) return b
        try {
          localStorage.setItem(key, String(score))
        } catch {
          // Storage blocked: the best score just lives for this visit.
        }
        return score
      })
    },
    [key],
  )
  return [best, submit] as const
}

// Phase + round counter. `start` scrolls the game into view; Space / Enter
// start a round from the overlay (after a short grace period on game over,
// so a frantic last key press does not restart instantly).
export function useRound(onStart?: () => void) {
  const root = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [round, setRound] = useState(0)
  const startRef = useRef(onStart)
  useEffect(() => {
    startRef.current = onStart
  })

  const start = useCallback(() => {
    startRef.current?.()
    setRound((r) => r + 1)
    setPhase('playing')
    root.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (phase === 'playing') return
    const armedAt = performance.now() + (phase === 'over' ? 600 : 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return
      e.preventDefault()
      if (performance.now() >= armedAt) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, start])

  const end = useCallback(() => setPhase('over'), [])
  return { root, phase, round, start, end }
}

// Canvas sized to its container at device pixel ratio (max 2).
export function fitCanvas(canvas: HTMLCanvasElement, box: HTMLElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = box.clientWidth
  const h = box.clientHeight
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w, h }
}
