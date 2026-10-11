import { useEffect, useState, type ComponentType } from 'react'
import { profile } from '../data/content'
import { recordVisit, type VisitCounts } from '../lib/visits'
import BugBash from './BugBash'
import RateLimited from './RateLimited'
import Stack from './Stack'

const GAMES: { id: string; name: string; blurb: string; Game: ComponentType }[] = [
  { id: 'rate-limited', name: 'Rate Limited', blurb: 'Be the API gateway', Game: RateLimited },
  { id: 'stack', name: 'Stack the Layers', blurb: 'Build the architecture', Game: Stack },
  { id: 'bug-bash', name: 'Bug Bash', blurb: 'Squash before it ships', Game: BugBash },
]

const fromHash = () => GAMES.find((g) => `#${g.id}` === window.location.hash) ?? GAMES[0]

const home = import.meta.env.BASE_URL

function Visitors() {
  const [counts, setCounts] = useState<VisitCounts | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    recordVisit().then((c) => {
      if (alive) setCounts(c)
    })
    return () => {
      alive = false
    }
  }, [])

  const fmt = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString('en-US'))
  if (counts === null) return <p className="visitors is-offline">Visitor counter offline</p>

  return (
    <dl className="visitors" aria-busy={counts === undefined}>
      <div>
        <dt>Visitors today</dt>
        <dd>{fmt(counts?.today)}</dd>
      </div>
      <div>
        <dt>All-time</dt>
        <dd>{fmt(counts?.total)}</dd>
      </div>
    </dl>
  )
}

export default function Play() {
  const [game, setGame] = useState(fromHash)

  useEffect(() => {
    const onHash = () => setGame(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="play">
      <header className="play-bar">
        <a className="play-back" href={home}>
          <span aria-hidden="true">&larr;</span> Back to portfolio
        </a>
        <span className="play-brand">{profile.name}</span>
      </header>

      <main className="play-main">
        <div className="play-head">
          <div>
            <p className="play-label">
              <span>(∞)</span> Break room
            </p>
            <h1 className="play-title">Arcade</h1>
            <p className="play-intro">
              Three small games built around the day job: route traffic, stack the architecture, squash the bugs.
            </p>
          </div>
          <Visitors />
        </div>

        <nav className="play-tabs" aria-label="Games">
          {GAMES.map((g, i) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className={g.id === game.id ? 'is-active' : ''}
              aria-current={g.id === game.id ? 'page' : undefined}
            >
              <span className="play-tab-index">0{i + 1}</span>
              <span className="play-tab-name">{g.name}</span>
              <span className="play-tab-blurb">{g.blurb}</span>
            </a>
          ))}
        </nav>

        <game.Game key={game.id} />
      </main>
    </div>
  )
}
