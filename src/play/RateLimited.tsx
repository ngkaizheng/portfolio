import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/env'
import { fitCanvas, useBest, useRound } from './kit'
import { Lives, Overlay } from './ui'

// "Rate Limited": you are the API gateway. Route the legit requests,
// keep the DDoS packets off your servers, grab a TLS cert for a shield.

type Kind = 'ok' | 'bad' | 'tls'

interface Packet {
  x: number
  y: number
  vy: number
  kind: Kind
  spin: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface Hud {
  score: number
  lives: number
  multiplier: number
  level: number
  shield: boolean
}

const LIVES = 3
const SHIELD_SECONDS = 5
const COLORS: Record<Kind, string> = { ok: '#d4ff3a', bad: '#ff5a5a', tls: '#7ad7ff' }
const START_HUD: Hud = { score: 0, lives: LIVES, multiplier: 1, level: 1, shield: false }

export default function RateLimited() {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState<Hud>(START_HUD)
  const [best, submitBest] = useBest('nkz-rate-limited-best')
  const { root, phase, round, start, end } = useRound(() => setHud(START_HUD))

  useEffect(() => {
    const el = canvas.current
    const box = stage.current
    const ctx = el?.getContext('2d')
    if (!el || !box || !ctx) return

    const calm = prefersReducedMotion()
    let w = 0
    let h = 0
    const fit = () => {
      ;({ w, h } = fitCanvas(el, box, ctx))
    }
    fit()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(box)

    const playing = phase === 'playing'
    const packets: Packet[] = []
    const sparks: Spark[] = []
    const keys = { left: false, right: false }
    let px = w / 2
    let target = w / 2
    let elapsed = 0
    let spawn = 0.4
    let shield = 0
    let shake = 0
    let score = 0
    let lives = LIVES
    let combo = 0
    let last = performance.now()
    let raf = 0
    let ended = false
    const shown: Hud = { ...START_HUD }

    const unit = () => Math.min(w, 900) / 900 + 0.35
    const paddleW = () => Math.max(84, w * 0.14)
    const paddleY = () => h - 46

    const burst = (x: number, y: number, color: string, n: number) => {
      if (calm) n = Math.ceil(n / 3)
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const s = 60 + Math.random() * 220
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0.5 + Math.random() * 0.5, color })
      }
    }

    const sync = () => {
      const next: Hud = {
        score,
        lives,
        multiplier: 1 + Math.floor(combo / 5),
        level: 1 + Math.floor(elapsed / 20),
        shield: shield > 0,
      }
      if (
        next.score !== shown.score ||
        next.lives !== shown.lives ||
        next.multiplier !== shown.multiplier ||
        next.level !== shown.level ||
        next.shield !== shown.shield
      ) {
        Object.assign(shown, next)
        setHud(next)
      }
    }

    const finish = () => {
      ended = true
      submitBest(score)
      end()
    }

    const step = (dt: number) => {
      elapsed += dt
      const level = 1 + Math.floor(elapsed / 20)
      shield = Math.max(0, shield - dt)
      shake = Math.max(0, shake - dt)

      spawn -= dt
      if (spawn <= 0) {
        spawn = Math.max(0.26, 0.85 - level * 0.07) * (0.7 + Math.random() * 0.6)
        const r = Math.random()
        const kind: Kind = r < 0.035 ? 'tls' : r < 0.3 + Math.min(level * 0.03, 0.22) ? 'bad' : 'ok'
        packets.push({
          x: 24 + Math.random() * Math.max(w - 48, 1),
          y: -16,
          vy: (150 + level * 24) * (0.8 + Math.random() * 0.4) * unit(),
          kind,
          spin: Math.random() * Math.PI,
        })
      }

      const speed = 900 * unit()
      if (keys.left) target -= speed * dt
      if (keys.right) target += speed * dt
      const half = paddleW() / 2
      target = Math.min(Math.max(target, half), w - half)
      px += (target - px) * Math.min(1, dt * 16)

      const py = paddleY()
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]
        p.y += p.vy * dt
        p.spin += dt * 3
        const caught = p.y + 10 >= py && p.y - 10 <= py + 12 && Math.abs(p.x - px) <= half + 10
        if (caught) {
          packets.splice(i, 1)
          if (p.kind === 'ok') {
            combo++
            score += 10 * (1 + Math.floor(combo / 5))
            burst(p.x, py, COLORS.ok, 10)
          } else if (p.kind === 'tls') {
            shield = SHIELD_SECONDS
            burst(p.x, py, COLORS.tls, 18)
          } else if (shield > 0) {
            score += 5
            burst(p.x, py, COLORS.tls, 12)
          } else {
            lives--
            combo = 0
            shake = calm ? 0 : 0.35
            burst(p.x, py, COLORS.bad, 24)
            if (lives <= 0) {
              sync()
              finish()
              return
            }
          }
        } else if (p.y > h + 20) {
          packets.splice(i, 1)
          // A dropped legit request breaks the combo.
          if (p.kind === 'ok') combo = 0
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.life -= dt
        if (s.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        s.vy += 420 * dt
        s.x += s.vx * dt
        s.y += s.vy * dt
      }
      sync()
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      if (shake > 0) ctx.translate((Math.random() - 0.5) * 14 * shake, (Math.random() - 0.5) * 14 * shake)

      // Dot grid
      ctx.fillStyle = 'rgba(236, 235, 228, 0.07)'
      for (let x = 20; x < w; x += 32) for (let y = 20; y < h; y += 32) ctx.fillRect(x, y, 1.5, 1.5)

      // Clients along the top, servers along the bottom.
      ctx.font = '500 10px "JetBrains Mono Variable", monospace'
      ctx.fillStyle = 'rgba(236, 235, 228, 0.35)'
      ctx.fillText('CLIENTS', 16, 22)
      ctx.fillText('SERVERS', 16, h - 10)
      ctx.strokeStyle = 'rgba(236, 235, 228, 0.12)'
      ctx.beginPath()
      ctx.moveTo(0, h - 24)
      ctx.lineTo(w, h - 24)
      ctx.stroke()

      for (const p of packets) {
        const c = COLORS[p.kind]
        ctx.shadowColor = c
        ctx.shadowBlur = 14
        ctx.fillStyle = c
        ctx.strokeStyle = c
        if (p.kind === 'ok') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.kind === 'bad') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.spin)
          ctx.fillRect(-7, -7, 14, 14)
          ctx.restore()
        } else {
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.shadowBlur = 0

      for (const s of sparks) {
        ctx.globalAlpha = Math.min(s.life * 2, 1)
        ctx.fillStyle = s.color
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3)
      }
      ctx.globalAlpha = 1

      // The gateway
      const half = paddleW() / 2
      const py = paddleY()
      if (shield > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.012)
        ctx.strokeStyle = `rgba(122, 215, 255, ${0.35 + pulse * 0.4})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(px, py + 6, half + 16, 30, 0, Math.PI, 0)
        ctx.stroke()
      }
      ctx.fillStyle = '#d4ff3a'
      ctx.shadowColor = '#d4ff3a'
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.roundRect(px - half, py, half * 2, 12, 6)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = '#0a0a0a'
      ctx.font = '700 8px "JetBrains Mono Variable", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('GATEWAY', px, py + 9)
      ctx.textAlign = 'start'
      ctx.restore()
    }

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (playing && !ended) step(dt)
      draw(t)
      if (playing && !ended) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    if (!playing) {
      return () => {
        cancelAnimationFrame(raf)
        ro?.disconnect()
      }
    }

    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target = e.clientX - r.left
    }
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = down
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = down
      else return
      e.preventDefault()
    }
    const onDown = onKey(true)
    const onUp = onKey(false)
    window.addEventListener('pointermove', onPointer)
    el.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('pointermove', onPointer)
      el.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [phase, round, end, submitBest])

  return (
    <div className="game" ref={root}>
      <dl className="game-hud" aria-live="polite">
        <div>
          <dt>Score</dt>
          <dd>{hud.score}</dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{best}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <Lives lives={hud.lives} max={LIVES} />
        </div>
        <div>
          <dt>Combo</dt>
          <dd>&times;{hud.multiplier}</dd>
        </div>
        <div>
          <dt>Load</dt>
          <dd>L{hud.level}</dd>
        </div>
      </dl>

      <div className={`game-stage${hud.shield ? ' has-shield' : ''}`} ref={stage}>
        <canvas
          ref={canvas}
          role="img"
          aria-label="Game field: requests fall from clients at the top towards the gateway at the bottom"
        />
        <Overlay
          phase={phase}
          title="Rate Limited"
          intro="You are the API gateway. Keep the servers up."
          overKicker="503 Service Unavailable"
          score={hud.score}
          best={best}
          onStart={start}
          hint={<>Mouse / touch to move &middot; or &larr; &rarr; &middot; Space to start</>}
        />
      </div>

      <ul className="game-legend">
        <li>
          <i className="is-ok" /> Request: catch it. Every 5 in a row raises the combo.
        </li>
        <li>
          <i className="is-bad" /> DDoS packet: dodge it, or you lose uptime.
        </li>
        <li>
          <i className="is-tls" /> TLS cert: {SHIELD_SECONDS}s shield that absorbs attacks.
        </li>
      </ul>
    </div>
  )
}
