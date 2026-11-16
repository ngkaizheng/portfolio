import { useEffect, useRef, useState } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../lib/env'

// Dot + lagging ring. Elements opt into a label with data-cursor="Label".
export default function Cursor() {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion())
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const target = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let frame = 0

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-cursor], a, button')
      setHover(Boolean(el))
      setLabel(el?.getAttribute('data-cursor') ?? '')
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => {
      target.x = -100
      target.y = -100
    }

    const loop = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18
      ringPos.y += (target.y - ringPos.y) * 0.18
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  const state = [hover && 'is-hover', label && 'has-label', pressed && 'is-pressed'].filter(Boolean).join(' ')
  return (
    <div className={`cursor ${state}`} aria-hidden="true">
      <div className="cursor-ring" ref={ring}>
        <span className="cursor-label">{label}</span>
      </div>
      <div className="cursor-dot" ref={dot} />
    </div>
  )
}
