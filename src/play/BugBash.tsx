import { useEffect, useRef, useState } from 'react'
import { useBest, useRound } from './kit'
import { Lives, Overlay } from './ui'

// "Bug Bash": bugs pop up in the codebase. Squash them before they ship;
// leave the working features alone.

type Kind = 'bug' | 'feature'

interface Cell {
  kind: Kind | null
  // Seconds into the round when the occupant leaves (bug: ships to prod).
  until: number
  // 'hit' / 'miss' feedback, cleared shortly after.
  mark: 'hit' | 'oops' | 'shipped' | null
  markUntil: number
}

interface Hud {
  score: number
  lives: number
  combo: number
}

const FILES = [
  'auth.ts',
  'Order.cs',
  'api.ts',
  'Policy.cs',
  'router.tsx',
  'Program.cs',
  'store.ts',
  'Handler.cs',
  'hooks.ts',
  'Repo.cs',
  'main.tsx',
  'Agent.cs',
  'utils.ts',
  'Query.cs',
  'App.tsx',
  'Gateway.cs',
]
const LIVES = 3
const START_HUD: Hud = { score: 0, lives: LIVES, combo: 0 }
const empty = (): Cell[] => FILES.map(() => ({ kind: null, until: 0, mark: null, markUntil: 0 }))

function BugIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 13 5 10M10 18H4M10 23l-5 3M22 13l5-3M22 18h6M22 23l5 3M13 8l-2-3M19 8l2-3" />
      </g>
      <ellipse cx="16" cy="18" rx="7" ry="9" fill="currentColor" />
      <path d="M16 10v17" stroke="#0b0b0b" strokeWidth="1.5" />
    </svg>
  )
}

export default function BugBash() {
  const [cells, setCells] = useState<Cell[]>(empty)
  const [hud, setHud] = useState<Hud>(START_HUD)
  const [best, submitBest] = useBest('nkz-bug-bash-best')
  const game = useRef({ t: 0, cells: empty(), score: 0, lives: LIVES, combo: 0, ended: true })
  const { root, phase, round, start, end } = useRound(() => {
    game.current = { t: 0, cells: empty(), score: 0, lives: LIVES, combo: 0, ended: false }
    setCells(game.current.cells)
    setHud(START_HUD)
  })

  useEffect(() => {
    if (round === 0) return
    const g = game.current
    let spawn = 0.6
    let last = performance.now()
    let raf = 0

    const publish = () => {
      g.cells = g.cells.slice()
      setCells(g.cells)
      setHud({ score: g.score, lives: g.lives, combo: g.combo })
    }

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      g.t += dt
      let changed = false

      spawn -= dt
      if (spawn <= 0) {
        spawn = Math.max(0.32, 0.95 - g.t * 0.012) * (0.7 + Math.random() * 0.6)
        const free = g.cells.flatMap((c, i) => (c.kind ? [] : [i]))
        if (free.length) {
          const i = free[Math.floor(Math.random() * free.length)]
          const kind: Kind = Math.random() < 0.26 ? 'feature' : 'bug'
          const life = kind === 'bug' ? Math.max(0.75, 1.7 - g.t * 0.014) : 1.6
          g.cells[i] = { ...g.cells[i], kind, until: g.t + life }
          changed = true
        }
      }

      g.cells.forEach((c, i) => {
        if (c.mark && g.t >= c.markUntil) {
          g.cells[i] = { ...c, mark: null }
          changed = true
        }
        if (c.kind && g.t >= c.until) {
          if (c.kind === 'bug') {
            g.lives--
            g.combo = 0
            g.cells[i] = { kind: null, until: 0, mark: 'shipped', markUntil: g.t + 0.6 }
          } else {
            g.cells[i] = { ...c, kind: null }
          }
          changed = true
        }
      })

      if (changed) publish()
      if (g.lives <= 0) {
        g.ended = true
        submitBest(g.score)
        end()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [round, end, submitBest])

  const hit = (i: number) => {
    const g = game.current
    const c = g.cells[i]
    if (g.ended || !c.kind) return
    if (c.kind === 'bug') {
      g.combo++
      g.score += 10 + Math.min(g.combo, 10) * 2
      g.cells[i] = { kind: null, until: 0, mark: 'hit', markUntil: g.t + 0.35 }
    } else {
      g.lives--
      g.combo = 0
      g.cells[i] = { kind: null, until: 0, mark: 'oops', markUntil: g.t + 0.6 }
    }
    g.cells = g.cells.slice()
    setCells(g.cells)
    setHud({ score: g.score, lives: g.lives, combo: g.combo })
  }

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
          <dt>Prod health</dt>
          <Lives lives={hud.lives} max={LIVES} />
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{hud.combo}</dd>
        </div>
      </dl>

      <div className="game-stage bash-stage">
        <div className="bash-grid">
          {cells.map((c, i) => (
            <button
              key={FILES[i]}
              type="button"
              className={`bash-cell${c.kind ? ` is-${c.kind}` : ''}${c.mark ? ` mark-${c.mark}` : ''}`}
              onPointerDown={(e) => {
                e.preventDefault()
                hit(i)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  hit(i)
                }
              }}
              tabIndex={phase === 'playing' ? 0 : -1}
              aria-label={`${FILES[i]}${c.kind ? `: ${c.kind}` : ''}`}
            >
              <span className="bash-file">{FILES[i]}</span>
              {c.kind === 'bug' && (
                <span className="bash-bug">
                  <BugIcon />
                </span>
              )}
              {c.kind === 'feature' && <span className="bash-feature">feat ✓</span>}
              {c.mark === 'hit' && <span className="bash-pop">fixed</span>}
              {c.mark === 'oops' && <span className="bash-pop">broke it</span>}
              {c.mark === 'shipped' && <span className="bash-pop">shipped</span>}
            </button>
          ))}
        </div>
        <Overlay
          phase={phase}
          title="Bug Bash"
          intro="Squash bugs before they reach production."
          overKicker="Incident report"
          score={hud.score}
          best={best}
          onStart={start}
          hint={<>Click / tap the bugs &middot; Space to start</>}
        />
      </div>

      <ul className="game-legend">
        <li>
          <i className="is-bad" /> Bug: squash it. A bug left alone ships to prod and costs health.
        </li>
        <li>
          <i className="is-ok" /> Feature: leave it. Clicking one breaks it.
        </li>
        <li>A longer streak scores more per bug.</li>
      </ul>
    </div>
  )
}
