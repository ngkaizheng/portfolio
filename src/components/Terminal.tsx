import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import {
  caseStudies,
  currentRole,
  education,
  heroStats,
  profile,
  projects,
  resumeHref,
  skillCategories,
} from '../data/content'
import { OPEN_TERMINAL } from '../lib/terminal'

// Easter egg: press ~ (or `) anywhere for a fake shell. Every answer is
// read from content.ts, so it never says anything the site does not.

interface Line {
  id: number
  kind: 'in' | 'out' | 'err'
  body: ReactNode
}

const PROMPT = 'guest@nkz:~$'
const COMMANDS: [string, string][] = [
  ['whoami', 'who is this'],
  ['ls', 'list projects  (ls cases: case studies)'],
  ['stats', 'headline numbers'],
  ['skills', 'the toolbox'],
  ['education', 'degree and grades'],
  ['contact', 'how to reach me'],
  ['cat resume', 'download the PDF'],
  ['play', 'open the arcade'],
  ['now', 'what I am up to'],
  ['uses', 'stack and setup'],
  ['sudo hire-me', 'you know you want to'],
  ['clear', 'clear the screen'],
  ['exit', 'close the terminal'],
]

const link = (href: string, text: string, download = false) => (
  <a href={href} target={download || href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" download={download || undefined}>
    {text}
  </a>
)

function downloadResume() {
  const a = document.createElement('a')
  a.href = resumeHref
  a.download = ''
  document.body.appendChild(a)
  a.click()
  a.remove()
}

const BANNER = (
  <>
    <span className="term-accent">nkz-shell</span> v1.0 &middot; type <b>help</b> to see commands, <b>exit</b> or Esc to
    leave.
  </>
)

function run(input: string): { out: ReactNode[]; error?: boolean; clear?: boolean; close?: boolean } {
  const cmd = input.trim().replace(/\s+/g, ' ')
  const lower = cmd.toLowerCase()
  switch (lower) {
    case '':
      return { out: [] }
    case 'help':
      return {
        out: COMMANDS.map(([c, d]) => (
          <span className="term-row">
            <b>{c.padEnd(14, ' ')}</b>
            <span className="term-dim">{d}</span>
          </span>
        )),
      }
    case 'whoami':
      return {
        out: [
          <b>{profile.name}</b>,
          `${profile.role} · ${currentRole.role} @ ${currentRole.company} (${currentRole.period})`,
          profile.tagline,
          <span className="term-dim">
            {profile.location} · {profile.relocation}
          </span>,
        ],
      }
    case 'ls':
    case 'ls projects':
      return {
        out: projects.map((p) => (
          <span className="term-row">
            <b>{p.id}/</b>
            <span className="term-dim">
              {p.year} · {p.tagline}
            </span>
          </span>
        )),
      }
    case 'ls cases':
      return {
        out: caseStudies.map((c) => (
          <span className="term-row">
            <b className="term-accent">{c.metric.padEnd(6, ' ')}</b>
            <span>{c.title}</span>
          </span>
        )),
      }
    case 'stats':
      return {
        out: heroStats.map((s) => (
          <span className="term-row">
            <b className="term-accent">{`${s.value.toFixed(s.decimals)}${s.suffix}`.padEnd(6, ' ')}</b>
            <span>{s.label}</span>
          </span>
        )),
      }
    case 'skills':
      return {
        out: skillCategories.map((c) => (
          <span>
            <b>{c.name}:</b> <span className="term-dim">{c.skills.join(', ')}</span>
          </span>
        )),
      }
    case 'education':
      return {
        out: [
          <b>{education.degree}</b>,
          `${education.school} · ${education.period}`,
          `CGPA ${education.cgpa} · ${education.award}, ${education.awardDetail}`,
        ],
      }
    case 'contact':
      return {
        out: [
          <>email&nbsp;&nbsp;&nbsp;&nbsp;{link(`mailto:${profile.email}`, profile.email)}</>,
          <>phone&nbsp;&nbsp;&nbsp;&nbsp;{link(profile.phoneHref, profile.phone)}</>,
          <>github&nbsp;&nbsp;&nbsp;{link(profile.github, profile.githubLabel)}</>,
          <>linkedin&nbsp;{link(profile.linkedin, profile.linkedinLabel)}</>,
        ],
      }
    case 'cat resume':
    case 'cat resume.pdf':
      downloadResume()
      return { out: [<>Downloading… (or {link(resumeHref, 'click here', true)})</>] }
    case 'play':
      window.location.href = `${import.meta.env.BASE_URL}play/`
      return { out: ['Loading arcade…'] }
    case 'now':
    case 'uses':
      window.location.href = `${import.meta.env.BASE_URL}${lower}/`
      return { out: [`Opening /${lower}…`] }
    case 'sudo hire-me':
    case 'sudo hire me':
      return {
        out: [
          <span className="term-dim">[sudo] password for recruiter: ********</span>,
          <span className="term-accent">Access granted.</span>,
          <>
            Next step: {link(`mailto:${profile.email}`, profile.email)} or {link(resumeHref, 'grab the résumé', true)}.
          </>,
        ],
      }
    case 'hire-me':
    case 'hire me':
      return { out: ['Permission denied. Try: sudo hire-me'], error: true }
    case 'clear':
      return { out: [], clear: true }
    case 'exit':
    case 'quit':
      return { out: [], close: true }
    default:
      if (lower.startsWith('sudo ')) return { out: ['Nice try. Only `sudo hire-me` is allowed here.'], error: true }
      return { out: [`command not found: ${cmd.split(' ')[0]} · try help`], error: true }
  }
}

export default function Terminal() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const history = useRef<string[]>([])
  const cursor = useRef(-1)
  const nextId = useRef(0)
  const input = useRef<HTMLInputElement>(null)
  const screen = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<Element | null>(null)

  const show = useCallback(() => {
    returnFocus.current = document.activeElement
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`' && e.key !== '~') return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      e.preventDefault()
      show()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_TERMINAL, show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_TERMINAL, show)
    }
  }, [show])

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, close])

  useEffect(() => {
    const el = screen.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, open])

  const submit = () => {
    const cmd = value
    setValue('')
    cursor.current = -1
    if (cmd.trim()) history.current = [cmd, ...history.current.filter((h) => h !== cmd)].slice(0, 30)
    const res = run(cmd)
    if (res.close) {
      close()
      return
    }
    const id = () => nextId.current++
    const echo: Line = { id: id(), kind: 'in', body: cmd }
    const out = res.out.map((body): Line => ({ id: id(), kind: res.error ? 'err' : 'out', body }))
    setLines((prev) => (res.clear ? [] : [...prev, echo, ...out]))
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      cursor.current = Math.max(-1, Math.min(h.length - 1, cursor.current + (e.key === 'ArrowUp' ? 1 : -1)))
      setValue(cursor.current < 0 ? '' : h[cursor.current])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const v = value.toLowerCase()
      const hit = COMMANDS.map(([c]) => c).filter((c) => v && c.startsWith(v))
      if (hit.length === 1) setValue(hit[0])
      else if (hit.length > 1)
        setLines((prev) => [...prev, { id: nextId.current++, kind: 'out', body: <span className="term-dim">{hit.join('   ')}</span> }])
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  if (!open) return null

  return (
    <div className="term-backdrop" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="term" role="dialog" aria-modal="true" aria-label="Terminal">
        <div className="term-bar">
          <span className="term-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>guest@nkz — zsh</span>
          <button type="button" onClick={close} aria-label="Close terminal">
            esc
          </button>
        </div>
        <div className="term-screen" ref={screen} data-lenis-prevent onClick={() => input.current?.focus()}>
          <p className="term-line">{BANNER}</p>
          {lines.map((l) => (
            <p key={l.id} className={`term-line is-${l.kind}`}>
              {l.kind === 'in' && <span className="term-prompt">{PROMPT} </span>}
              {l.body}
            </p>
          ))}
          <label className="term-line term-input">
            <span className="term-prompt">{PROMPT}</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Command"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
