import type { ReactNode } from 'react'
import type { Phase } from './kit'

// Start / game-over overlay and the uptime bar shared by the arcade games.

export function Overlay({
  phase,
  title,
  intro,
  overKicker,
  score,
  best,
  hint,
  onStart,
}: {
  phase: Phase
  title: string
  intro: string
  overKicker: string
  score: number
  best: number
  hint: ReactNode
  onStart: () => void
}) {
  if (phase === 'playing') return null
  return (
    <div className="game-overlay">
      {phase === 'over' ? (
        <>
          <p className="game-kicker">{overKicker}</p>
          <p className="game-big">{score}</p>
          <p className="game-note">{score > 0 && score >= best ? 'New best score.' : `Best: ${best}`}</p>
        </>
      ) : (
        <>
          <p className="game-kicker">Mini game</p>
          <p className="game-big">{title}</p>
          <p className="game-note">{intro}</p>
        </>
      )}
      <button className="btn btn-solid" onClick={onStart}>
        {phase === 'over' ? 'Restart' : 'Start'}
      </button>
      <p className="game-hint">{hint}</p>
    </div>
  )
}

export function Lives({ lives, max }: { lives: number; max: number }) {
  return (
    <dd className="game-lives" aria-label={`${lives} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < lives ? 'is-on' : ''} />
      ))}
    </dd>
  )
}
