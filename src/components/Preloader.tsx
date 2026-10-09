import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../lib/env'

const LOG = [
  { at: 0, text: 'kz.os // portfolio build 2.0' },
  { at: 18, text: 'spawning agents ............ ok' },
  { at: 46, text: 'compiling shaders .......... ok' },
  { at: 74, text: 'linking case files ......... ok' },
  { at: 96, text: 'ready.' },
]

const SEEN_KEY = 'kz-booted'

function alreadyBooted() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [skip] = useState(() => prefersReducedMotion() || alreadyBooted())
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(skip)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }
    const progress = { value: 0 }
    const tween = gsap.to(progress, {
      value: 100,
      duration: 2.1,
      ease: 'power2.inOut',
      onUpdate: () => setCount(Math.round(progress.value)),
      onComplete: () => {
        try {
          sessionStorage.setItem(SEEN_KEY, '1')
        } catch {
          /* storage may be unavailable */
        }
        setLeaving(true)
        onDone()
      },
    })
    return () => {
      tween.kill()
    }
  }, [skip, onDone])

  // Backstop in case transitionend never fires.
  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(() => setGone(true), 1600)
    return () => clearTimeout(id)
  }, [leaving])

  if (gone) return null

  return (
    <div
      className={`preloader${leaving ? ' is-leaving' : ''}`}
      aria-hidden="true"
      onTransitionEnd={(e) => {
        if (leaving && e.target === e.currentTarget) setGone(true)
      }}
    >
      <ol className="preloader-log">
        {LOG.filter((line) => count >= line.at).map((line) => (
          <li key={line.text}>
            <span className="preloader-caret">&gt;</span> {line.text}
          </li>
        ))}
      </ol>
      <div className="preloader-count">
        {String(count).padStart(3, '0')}
        <span>%</span>
      </div>
      <div className="preloader-bar">
        <i style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  )
}
