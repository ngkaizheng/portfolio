import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

// Sections whose arrival advances the WebGL scene one morph stage each.
// Stage 0 is the hero; stage N means the Nth entry below has scrolled in.
export const STAGE_SECTIONS = ['experience', 'projects', 'stack', 'contact'] as const

// Mutable scroll snapshot shared with the render loop (read every frame,
// so it deliberately lives outside React state).
export const scrollState = {
  stage: 0,
  // Viewport heights the last stage section has scrolled past the top.
  tail: 0,
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
  const vh = window.innerHeight
  let stage = 0
  let top = vh
  for (const id of STAGE_SECTIONS) {
    const el = document.getElementById(id)
    if (!el) continue
    top = el.getBoundingClientRect().top
    stage += Math.min(Math.max((vh * 0.85 - top) / (vh * 0.7), 0), 1)
  }
  const max = document.documentElement.scrollHeight - vh
  scrollState.stage = stage
  scrollState.tail = Math.max(0, -top) / vh
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
