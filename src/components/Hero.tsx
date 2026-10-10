import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { gsap } from 'gsap'
import { heroStats, profile, resumeHref } from '../data/content'
import { hasFinePointer, prefersReducedMotion } from '../lib/env'
import { scrollToId } from '../lib/scroll'
import { ArrowIcon, DownloadIcon } from './ui'

const GLYPHS = '!<>-_\\/[]{}=+*^?#01'

function Scramble({ words, active }: { words: string[]; active: boolean }) {
  const [text, setText] = useState(words[0])

  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    let index = 0
    let raf = 0
    let timer: ReturnType<typeof setTimeout>

    const run = (from: string, to: string) => {
      const queue = Array.from({ length: Math.max(from.length, to.length) }, (_, i) => {
        const start = Math.floor(Math.random() * 10)
        return { from: from[i] ?? '', to: to[i] ?? '', start, end: start + 10 + Math.floor(Math.random() * 10) + i * 0.5 }
      })
      let frame = 0
      const tick = () => {
        let out = ''
        let done = 0
        for (const q of queue) {
          if (frame >= q.end) {
            out += q.to
            done++
          } else if (frame >= q.start) {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          } else {
            out += q.from
          }
        }
        setText(out)
        frame++
        if (done < queue.length) raf = requestAnimationFrame(tick)
        else timer = setTimeout(next, 2600)
      }
      tick()
    }
    const next = () => {
      const from = words[index]
      index = (index + 1) % words.length
      run(from, words[index])
    }
    timer = setTimeout(next, 2400)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [active, words])

  return (
    <span className="scramble" aria-hidden="true">
      {text}
    </span>
  )
}

function Counter({ value, decimals, suffix, start }: { value: number; decimals: number; suffix: string; start: boolean }) {
  const [n, setN] = useState(() => (prefersReducedMotion() ? value : 0))

  useEffect(() => {
    if (!start || prefersReducedMotion()) return
    const o = { v: 0 }
    const tween = gsap.to(o, { v: value, duration: 2.2, delay: 0.5, ease: 'expo.out', onUpdate: () => setN(o.v) })
    return () => {
      tween.kill()
    }
  }, [start, value])

  return (
    <>
      {n.toFixed(decimals)}
      {suffix}
    </>
  )
}

// Letters thin out and lift as the pointer approaches.
function useLiquidType(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || !hasFinePointer() || prefersReducedMotion()) return
    const section = el.closest('section') ?? el
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.hero-ch'))
    let raf = 0
    let mx = -1e4
    let my = -1e4

    const update = () => {
      raf = 0
      for (const c of chars) {
        const r = c.getBoundingClientRect()
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
        const k = Math.max(0, 1 - d / 340)
        const eased = k * k * (3 - 2 * k)
        c.style.fontVariationSettings = `"wght" ${Math.round(800 - eased * 400)}`
        c.style.setProperty('--lift', `${(-eased * 0.08).toFixed(3)}em`)
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      schedule()
    }
    const onLeave = () => {
      mx = -1e4
      my = -1e4
      schedule()
    }
    section.addEventListener('pointermove', onMove as EventListener)
    section.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      section.removeEventListener('pointermove', onMove as EventListener)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [ref])
}

export default function Hero({ ready }: { ready: boolean }) {
  const nameRef = useRef<HTMLHeadingElement>(null)
  useLiquidType(nameRef)

  return (
    <section id="top" className={`hero${ready ? ' is-ready' : ''}`} aria-label="Introduction">
      <div className="hero-top">
        <p className="hero-status">
          <span className="pulse-dot" aria-hidden="true" />
          Open to Singapore roles
        </p>
        <p className="hero-role">
          <span className="sr-only">{profile.role}</span>
          <span className="hero-role-bracket" aria-hidden="true">
            [
          </span>
          <Scramble words={profile.roles} active={ready} />
          <span className="hero-role-bracket" aria-hidden="true">
            ]
          </span>
        </p>
        <p className="hero-location">
          {profile.location}
          <br />
          <span>{profile.relocation}</span>
        </p>
      </div>

      <h1 className="hero-name" ref={nameRef} aria-label={profile.name}>
        {profile.nameLines.map((line, row) => (
          <span className="hero-line" key={line} aria-hidden="true">
            {Array.from(line).map((ch, col) => (
              <span className="hero-ch" key={col} style={{ '--i': row * 6 + col } as CSSProperties}>
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="hero-bottom">
        <p className="hero-tagline">{profile.tagline}</p>

        <dl className="hero-stats">
          {heroStats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} start={ready} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="hero-actions">
          <a className="btn btn-solid" href={resumeHref} download data-cursor="Get" data-magnetic>
            <DownloadIcon />
            Download Resume
          </a>
          <button className="btn btn-ghost" onClick={() => scrollToId('experience')} data-magnetic>
            See the work
            <ArrowIcon direction="down" />
          </button>
        </div>
      </div>

      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
