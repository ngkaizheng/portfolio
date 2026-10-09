import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { onScroll, scrollToId, scrollToTop } from '../lib/scroll'
import { pad, useLocalTime } from '../lib/hooks'
import { resumeHref } from '../data/content'
import { DownloadIcon, RollText } from './ui'

const NAV_LINKS = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const [active, setActive] = useState('top')
  const [open, setOpen] = useState(false)
  const time = useLocalTime()
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(
    () =>
      onScroll((state) => {
        if (bar.current) bar.current.style.transform = `scaleX(${state.progress})`
        let current = 'top'
        for (const link of NAV_LINKS) {
          const el = document.getElementById(link.id)
          if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = link.id
        }
        setActive(current)
      }),
    [],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header className="nav">
        <a
          href="#top"
          className="nav-logo"
          onClick={(e) => {
            e.preventDefault()
            setOpen(false)
            scrollToTop()
          }}
          aria-label="Ng Kai Zheng, back to top"
        >
          NKZ<sup>&copy;</sup>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
              aria-current={active === link.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go(link.id)
              }}
            >
              <span className="nav-index">{pad(i + 1)}</span>
              <RollText text={link.label} />
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <span className="nav-time" aria-label="Local time in Johor, GMT+8">
            JHB {time}
          </span>
          <a className="nav-resume" href={resumeHref} download data-cursor="Get">
            <DownloadIcon />
            <span>Resume</span>
          </a>
          <button
            className={`nav-toggle${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
        <span className="nav-progress" ref={bar} aria-hidden="true" />
      </header>

      <div id="menu" className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="Menu">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              style={{ '--i': i } as CSSProperties}
              onClick={(e) => {
                e.preventDefault()
                go(link.id)
              }}
            >
              <span className="menu-index">{pad(i + 1)}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-solid menu-resume" href={resumeHref} download>
          <DownloadIcon />
          Download Resume
        </a>
      </div>
    </>
  )
}
