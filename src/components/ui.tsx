import { Component, Fragment, type CSSProperties, type ReactNode } from 'react'

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="section-label" data-reveal>
      <span className="section-label-index">({index})</span>
      <span>{label}</span>
    </p>
  )
}

// Display heading whose lines slide up from a mask when revealed.
export function SplitHeading({
  id,
  lines,
  className = '',
  level = 2,
}: {
  id?: string
  lines: string[]
  className?: string
  level?: 2 | 3
}) {
  const Tag = level === 2 ? 'h2' : 'h3'
  return (
    <Tag id={id} className={`display split ${className}`} data-reveal aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span className="split-line" key={line} aria-hidden="true">
          <span className="split-inner" style={{ '--i': i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}

// Letters roll up to a second copy on hover. Words stay unbroken.
export function RollText({ text }: { text: string }) {
  const words = text.split(' ').map((word, w, all) => ({
    word,
    start: w === 0 ? 0 : all.slice(0, w).join(' ').length + 1,
  }))
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      {words.map(({ word, start }, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="roll-word" aria-hidden="true">
            {Array.from(word).map((ch, i) => (
              <span className="roll-ch" key={i} style={{ '--i': start + i } as CSSProperties}>
                <span>{ch}</span>
                <span>{ch}</span>
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

export function Chips({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`chips ${className}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16" />
    </svg>
  )
}

export function ArrowIcon({ direction = 'right' }: { direction?: 'right' | 'down' | 'up' | 'up-right' }) {
  const rotate = { right: 0, down: 90, up: -90, 'up-right': -45 }[direction]
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M4 12h16m0 0l-6-6m6 6l-6 6" />
    </svg>
  )
}

export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
