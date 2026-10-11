import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/env'
import { fitCanvas, useBest, useRound } from './kit'
import { Overlay } from './ui'

// "Stack the Layers": drop each architecture layer onto the one below.
// Whatever overhangs gets cut off; land three perfect drops in a row and
// the layer grows back a little.

interface Block {
  x: number
  w: number
  label: string
  hue: number
}

interface Debris {
  x: number
  y: number
  w: number
  vx: number
  vy: number
  rot: number
  spin: number
  hue: number
}

interface Hud {
  height: number
  streak: number
  width: number
}

const LAYERS = ['Database', 'Repository', 'Domain', 'Services', 'API', 'Gateway', 'Cache', 'CDN', 'Frontend', 'Users']
const BLOCK_H = 28
const PERFECT = 5
const START_HUD: Hud = { height: 0, streak: 0, width: 100 }

const fill = (hue: number, a: number) => `hsla(${hue}, 92%, 62%, ${a})`

export default function Stack() {
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState<Hud>(START_HUD)
  const [best, submitBest] = useBest('nkz-stack-best')
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

    // Keyed on the round, not the phase, so the final tower stays on screen
    // under the game-over overlay.
    const playing = round > 0
    const baseW = Math.min(w * (w < 600 ? 0.66 : 0.5), 340)
    const blocks: Block[] = [{ x: (w - baseW) / 2, w: baseW, label: LAYERS[0], hue: 75 }]
    const debris: Debris[] = []
    let cur = { x: 0, w: baseW, dir: 1 }
    let streak = 0
    let camY = 0
    let flash = { text: '', life: 0 }
    let last = performance.now()
    let raf = 0
    let ended = false

    const layer = (i: number) => ({ label: LAYERS[i % LAYERS.length], hue: (75 + i * 11) % 360 })
    const groundY = () => h - 40
    // Screen y of the top edge of block i, before the camera offset.
    const blockY = (i: number) => groundY() - (i + 1) * BLOCK_H

    const spawn = () => {
      const top = blocks[blocks.length - 1]
      const fromLeft = blocks.length % 2 === 1
      cur = { x: fromLeft ? -top.w * 0.2 : w - top.w * 0.8, w: top.w, dir: fromLeft ? 1 : -1 }
    }
    spawn()

    const sync = () =>
      setHud({ height: blocks.length - 1, streak, width: Math.round((blocks[blocks.length - 1].w / baseW) * 100) })

    const drop = () => {
      if (ended) return
      const i = blocks.length
      const below = blocks[i - 1]
      const { label, hue } = layer(i)
      const left = Math.max(cur.x, below.x)
      const right = Math.min(cur.x + cur.w, below.x + below.w)
      const overlap = right - left
      const y = blockY(i)

      if (overlap <= 0) {
        debris.push({ x: cur.x, y, w: cur.w, vx: cur.dir * 60, vy: 0, rot: 0, spin: cur.dir * 2, hue })
        ended = true
        submitBest(blocks.length - 1)
        end()
        return
      }

      if (Math.abs(cur.x - below.x) <= PERFECT) {
        streak++
        const grown = streak >= 3 ? Math.min(below.w + 8, baseW) : below.w
        blocks.push({ x: below.x - (grown - below.w) / 2, w: grown, label, hue })
        flash = { text: streak > 1 ? `Perfect ×${streak}` : 'Perfect', life: 1 }
      } else {
        streak = 0
        const cutLeft = cur.x < below.x
        const offX = cutLeft ? cur.x : right
        const offW = cur.w - overlap
        debris.push({ x: offX, y, w: offW, vx: (cutLeft ? -1 : 1) * 80, vy: -40, rot: 0, spin: cutLeft ? -2.5 : 2.5, hue })
        blocks.push({ x: left, w: overlap, label, hue })
      }
      sync()
      spawn()
    }

    const step = (dt: number) => {
      const level = blocks.length
      const speed = Math.min(170 + level * 9, 460) * (Math.min(w, 900) / 900 + 0.4)
      cur.x += cur.dir * speed * dt
      if (cur.x + cur.w > w + cur.w * 0.25) cur.dir = -1
      if (cur.x < -cur.w * 0.25) cur.dir = 1
    }

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (playing && !ended) step(dt)

      // Keep the top of the tower around 40% down the field.
      const targetCam = Math.max(0, groundY() - blockY(blocks.length) - h * 0.6)
      camY += (targetCam - camY) * Math.min(1, dt * (calm ? 20 : 5))

      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i]
        d.vy += 900 * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.rot += d.spin * dt
        if (d.y + camY > h + 200) debris.splice(i, 1)
      }
      flash.life = Math.max(0, flash.life - dt * 1.4)

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(236, 235, 228, 0.07)'
      for (let x = 20; x < w; x += 32) for (let y = 20 + (camY % 32); y < h; y += 32) ctx.fillRect(x, y, 1.5, 1.5)

      ctx.save()
      ctx.translate(0, camY)

      // Ground
      ctx.strokeStyle = 'rgba(236, 235, 228, 0.18)'
      ctx.beginPath()
      ctx.moveTo(0, groundY())
      ctx.lineTo(w, groundY())
      ctx.stroke()

      const drawBlock = (x: number, y: number, bw: number, label: string, hue: number, alpha = 1) => {
        ctx.globalAlpha = alpha
        ctx.fillStyle = fill(hue, 0.16)
        ctx.fillRect(x, y, bw, BLOCK_H - 3)
        ctx.fillStyle = fill(hue, 0.9)
        ctx.fillRect(x, y, bw, 3)
        ctx.strokeStyle = fill(hue, 0.55)
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, BLOCK_H - 4)
        if (bw > 54) {
          ctx.fillStyle = fill(hue, 0.95)
          ctx.font = '600 10px "JetBrains Mono Variable", monospace'
          ctx.textAlign = 'center'
          ctx.fillText(label.toUpperCase(), x + bw / 2, y + 17)
          ctx.textAlign = 'start'
        }
        ctx.globalAlpha = 1
      }

      blocks.forEach((b, i) => drawBlock(b.x, blockY(i), b.w, b.label, b.hue))
      if (playing && !ended) {
        const i = blocks.length
        const { label, hue } = layer(i)
        ctx.shadowColor = fill(hue, 1)
        ctx.shadowBlur = 16
        drawBlock(cur.x, blockY(i), cur.w, label, hue)
        ctx.shadowBlur = 0
      }
      for (const d of debris) {
        ctx.save()
        ctx.translate(d.x + d.w / 2, d.y + BLOCK_H / 2)
        ctx.rotate(d.rot)
        drawBlock(-d.w / 2, -BLOCK_H / 2, d.w, '', d.hue, 0.7)
        ctx.restore()
      }

      if (flash.life > 0) {
        const y = blockY(blocks.length - 1) - 16 - (1 - flash.life) * 30
        ctx.globalAlpha = flash.life
        ctx.fillStyle = '#d4ff3a'
        ctx.font = '700 13px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(flash.text.toUpperCase(), w / 2, y)
        ctx.textAlign = 'start'
        ctx.globalAlpha = 1
      }
      ctx.restore()

      if ((playing && !ended) || debris.length > 0 || Math.abs(targetCam - camY) > 0.5) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    if (!playing) {
      return () => {
        cancelAnimationFrame(raf)
        ro?.disconnect()
      }
    }

    const onPointer = (e: PointerEvent) => {
      if (e.button !== 0) return
      drop()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'ArrowDown') return
      e.preventDefault()
      if (!e.repeat) drop()
    }
    el.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      el.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [round, end, submitBest])

  return (
    <div className="game" ref={root}>
      <dl className="game-hud" aria-live="polite">
        <div>
          <dt>Layers</dt>
          <dd>{hud.height}</dd>
        </div>
        <div>
          <dt>Best</dt>
          <dd>{best}</dd>
        </div>
        <div>
          <dt>Perfect streak</dt>
          <dd>{hud.streak}</dd>
        </div>
        <div>
          <dt>Width</dt>
          <dd>{hud.width}%</dd>
        </div>
      </dl>

      <div className="game-stage" ref={stage}>
        <canvas ref={canvas} role="img" aria-label="Game field: a tower of architecture layers with a sliding block on top" />
        <Overlay
          phase={phase}
          title="Stack the Layers"
          intro="Drop each layer onto the one below. Overhang gets cut."
          overKicker="Build failed"
          score={hud.height}
          best={best}
          onStart={start}
          hint={<>Click / tap or Space to drop</>}
        />
      </div>

      <ul className="game-legend">
        <li>Only the overlapping part of a layer stays; the rest falls off.</li>
        <li>Three perfect drops in a row widen the layer again.</li>
        <li>Miss the tower completely and the build fails.</li>
      </ul>
    </div>
  )
}
