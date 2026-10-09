import { useEffect, useRef, useState } from 'react'

// Flips to true the first time the element is near the viewport, and
// reports live visibility so looping animations can pause off-screen.
export function useInView<T extends Element>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null)
  const [state, setState] = useState(() => {
    const unsupported = typeof IntersectionObserver === 'undefined'
    return { seen: unsupported, visible: unsupported }
  })

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState((prev) => ({
          seen: prev.seen || entry.isIntersecting,
          visible: entry.isIntersecting,
        }))
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return [ref, state] as const
}

// Adds `is-in` to every [data-reveal] element as it scrolls into view.
export function useRevealAll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

const timeFormat =
  typeof Intl !== 'undefined'
    ? new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kuala_Lumpur',
      })
    : null

// Live local time in Johor (GMT+8, same as Singapore).
export function useLocalTime() {
  const [time, setTime] = useState(() => (timeFormat ? timeFormat.format(new Date()) : ''))
  useEffect(() => {
    if (!timeFormat) return
    const id = setInterval(() => setTime(timeFormat.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export const pad = (n: number) => String(n).padStart(2, '0')

// Elements marked [data-magnetic] drift toward the pointer while hovered.
export function useMagneticAll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))
    const cleanups = els.map((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - (r.left + r.width / 2)) * 0.3
        const y = (e.clientY - (r.top + r.height / 2)) * 0.4
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      const leave = () => {
        el.style.transform = ''
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })
    return () => cleanups.forEach((c) => c())
  }, [enabled])
}
