import { useEffect, useState } from 'react'
import { profile } from '../data/content'
import { recordVisit, type VisitCounts } from '../lib/visits'
import Game from './Game'

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
            <h1 className="play-title">Rate Limited</h1>
            <p className="play-intro">
              A small game in between the case studies. You are the API gateway: route real requests, dodge the
              flood, and keep uptime alive as the load climbs.
            </p>
          </div>
          <Visitors />
        </div>

        <Game />
      </main>
    </div>
  )
}
