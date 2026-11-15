import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { education, experience, identity, projects, skills } from './content.ts'
import { flight, smoothstep } from './state.ts'
import { startDrone, type Drone } from './sound.ts'

const Scene = lazy(() => import('./Scene.tsx'))

// Scroll-progress window in which each act is visible.
const acts = [
  { id: 'intro', from: -1, to: 0.1 },
  { id: 'experience', from: 0.16, to: 0.37 },
  { id: 'projects', from: 0.43, to: 0.61 },
  { id: 'skills', from: 0.67, to: 0.84 },
  { id: 'contact', from: 0.93, to: 2 },
]

function detectWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Showcase() {
  const [webgl] = useState(detectWebGL)
  const [lowPower] = useState(() => window.matchMedia('(max-width: 820px), (pointer: coarse)').matches)
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const drone = useRef<Drone | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(false)
  const [openProject, setOpenProject] = useState<number | null>(null)
  const project = openProject === null ? null : projects[openProject]

  const toggleSound = () => {
    if (drone.current) {
      drone.current.stop()
      drone.current = null
    } else {
      drone.current = startDrone()
    }
    setSound(!sound)
  }

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (openProject !== null && !el.open) el.showModal()
    if (openProject === null && el.open) el.close()
  }, [openProject])

  useEffect(() => () => drone.current?.stop(), [])

  useEffect(() => {
    if (!webgl) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>('.sc-act') ?? [])
    let raf = 0
    let target = 0
    let tx = 0
    let ty = 0
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      target = max > 0 ? window.scrollY / max : 0
    }
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }
    let last = performance.now()
    const tick = (now: number) => {
      // Time-based easing so the fall feels the same at any frame rate.
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      flight.p += (target - flight.p) * (reduced ? 1 : 1 - Math.exp(-dt * 4.5))
      const k = 1 - Math.exp(-dt * 3)
      flight.px += (tx - flight.px) * k
      flight.py += (ty - flight.py) * k
      acts.forEach((act, i) => {
        const el = els[i]
        if (!el) return
        const o = smoothstep(act.from, act.from + 0.035, flight.p) * (1 - smoothstep(act.to - 0.035, act.to, flight.p))
        el.style.opacity = o.toFixed(3)
        el.style.transform = `translate3d(0, ${((1 - o) * 36).toFixed(1)}px, 0)`
        el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      })
      drone.current?.update(flight.p)
      if (bar.current) bar.current.style.transform = `scaleX(${flight.p.toFixed(4)})`
      raf = requestAnimationFrame(tick)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [webgl])

  return (
    <div ref={root} className={webgl ? 'sc' : 'sc sc-static'}>
      {webgl && (
        <Suspense fallback={null}>
          <Scene lowPower={lowPower} onReady={() => setReady(true)} />
        </Suspense>
      )}
      <div className={ready || !webgl ? 'sc-loader sc-loader-done' : 'sc-loader'} aria-hidden="true">
        <span className="sc-loader-ring" />
        <span>Approaching event horizon</span>
      </div>
      <div className="sc-progress" ref={bar} aria-hidden="true" />

      <header className="sc-top">
        <span>{identity.name.toUpperCase()}</span>
        <nav>
          {webgl && (
            <button type="button" onClick={toggleSound} aria-pressed={sound}>
              Sound {sound ? 'on' : 'off'}
            </button>
          )}
          <a href={identity.classicHref}>Classic site ↗</a>
        </nav>
      </header>

      <main className="sc-acts">
        <section className="sc-act sc-intro">
          <h1>
            Ng Kai
            <br />
            Zheng
          </h1>
          <p className="sc-role">{identity.role}</p>
          <p className="sc-kicker">{identity.stack}</p>
          <p className="sc-hint">Scroll to fall in ↓</p>
        </section>

        <section className="sc-act sc-left">
          <p className="sc-label">01 — Experience</p>
          {experience.map((job) => (
            <div className="sc-job" key={job.company}>
              <h2>{job.company}</h2>
              <p className="sc-meta">
                {job.role} · {job.period}
              </p>
              <ul>
                {job.highlights.map(([title, sub]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="sc-act sc-right">
          <p className="sc-label">02 — Projects</p>
          {projects.map((item, i) => (
            <button type="button" className="sc-project" key={item.name} onClick={() => setOpenProject(i)}>
              <span className="sc-meta">
                {item.tagline} · {item.year}
              </span>
              <strong>{item.name}</strong>
              <span className="sc-summary">{item.summary}</span>
              <span className="sc-more">Open details +</span>
            </button>
          ))}
        </section>

        <section className="sc-act sc-left">
          <p className="sc-label">03 — Skills &amp; Education</p>
          <ul className="sc-skills">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <div className="sc-edu">
            <span className="sc-cgpa">{education.cgpa}</span>
            <div>
              <h2>{education.degree}</h2>
              <p className="sc-meta">{education.school} · CGPA</p>
            </div>
          </div>
        </section>

        <section className="sc-act sc-contact">
          <p className="sc-label">04 — The other side</p>
          <h2>Let&rsquo;s build something.</h2>
          <a className="sc-email" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
          <p className="sc-meta">{identity.location}</p>
          <div className="sc-links">
            <a className="sc-cta" href={identity.resumeHref} download>
              Download Resume
            </a>
            <a href={identity.linkedIn} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={identity.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </section>
      </main>

      <dialog
        className="sc-dialog"
        ref={dialog}
        onClose={() => setOpenProject(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenProject(null)
        }}
      >
        {project && (
          <div className="sc-dialog-body">
            <p className="sc-label">
              {project.tagline} · {project.year}
            </p>
            <h2>{project.name}</h2>
            <p>{project.summary}</p>
            <ul className="sc-details">
              {project.details.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <ul className="sc-skills">
              {project.tech.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
            <button type="button" className="sc-close" onClick={() => setOpenProject(null)}>
              Close
            </button>
          </div>
        )}
      </dialog>
    </div>
  )
}
