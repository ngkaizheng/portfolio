import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

// Mutable scroll snapshot shared with listeners and the render loop
// (deliberately outside React state).
export const scrollState = {
  velocity: 0,
  progress: 0,
}

type Listener = (state: typeof scrollState) => void
const listeners = new Set<Listener>()

export function onScroll(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let lenis: Lenis | null = null

function measure(velocity: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scrollState.velocity = velocity
  scrollState.progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0
  listeners.forEach((l) => l(scrollState))
}

export function initScroll(): () => void {
  if (typeof window === 'undefined') return () => {}

  const onResize = () => measure(0)
  window.addEventListener('resize', onResize)

  // Native scrolling for reduced motion, and where Lenis cannot run (jsdom).
  if (prefersReducedMotion() || typeof ResizeObserver === 'undefined') {
    let lastY = window.scrollY
    const onNativeScroll = () => {
      measure(window.scrollY - lastY)
      lastY = window.scrollY
    }
    window.addEventListener('scroll', onNativeScroll, { passive: true })
    measure(0)
    return () => {
      window.removeEventListener('scroll', onNativeScroll)
      window.removeEventListener('resize', onResize)
    }
  }

  const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 })
  lenis = instance
  instance.on('scroll', () => {
    ScrollTrigger.update()
    measure(instance.velocity)
  })
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  measure(0)

  return () => {
    gsap.ticker.remove(tick)
    window.removeEventListener('resize', onResize)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.6 })
  } else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.8 })
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}
