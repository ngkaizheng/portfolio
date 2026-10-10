import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { education, marqueeWords, profile, projects, resumeHref, skillCategories } from '../data/content'
import { pad, useLocalTime } from '../lib/hooks'
import { onScroll, scrollToTop } from '../lib/scroll'
import { Blueprint } from './Diagrams'
import { ArrowIcon, Chips, DownloadIcon, RollText, SectionLabel, SplitHeading } from './ui'

/* ─── Marquee ────────────────────────────────────────────── */

export function Marquee() {
  const ref = useRef<HTMLDivElement>(null)

  // Skews with scroll speed.
  useEffect(
    () =>
      onScroll((state) => {
        const skew = Math.max(-6, Math.min(6, state.velocity * -0.2))
        ref.current?.style.setProperty('--skew', `${skew.toFixed(2)}deg`)
      }),
    [],
  )

  const row = (
    <span className="marquee-row">
      {marqueeWords.map((word) => (
        <span key={word}>
          {word}
          <i aria-hidden="true">&#10035;</i>
        </span>
      ))}
    </span>
  )

  return (
    <div className="marquee" ref={ref} aria-hidden="true">
      <div className="marquee-lane">
        {row}
        {row}
      </div>
    </div>
  )
}

/* ─── Projects ───────────────────────────────────────────── */

export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-heading">
      <header className="section-head">
        <SectionLabel index="02" label="Projects" />
        <SplitHeading id="projects-heading" lines={['Things', "I've built"]} />
      </header>

      <div className="project-list">
        {projects.map((project, i) => (
          <article className={`project${i % 2 ? ' is-flipped' : ''}`} key={project.id} aria-labelledby={`project-${project.id}`}>
            <p className="project-meta" data-reveal>
              <span>P/{pad(i + 1)}</span>
              <span>{project.tagline}</span>
              <span>{project.year}</span>
            </p>
            <h3 id={`project-${project.id}`} className="project-name" data-reveal>
              <RollText text={project.name} />
            </h3>
            <div className="project-grid">
              <div className="project-copy" data-reveal>
                <p className="project-summary">{project.summary}</p>
                <ul className="project-details">
                  {project.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <Chips items={project.tech} />
              </div>
              <div data-reveal>
                <Blueprint project={project} index={i} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ─── Stack ──────────────────────────────────────────────── */

export function Stack() {
  return (
    <section id="stack" className="section stack" aria-labelledby="stack-heading">
      <header className="section-head">
        <SectionLabel index="03" label="Stack" />
        <SplitHeading id="stack-heading" lines={['What I', 'work with']} />
      </header>
      <ul className="stack-list">
        {skillCategories.map((cat, i) => (
          <li className="stack-row" key={cat.name} data-reveal style={{ '--i': i } as CSSProperties}>
            <span className="stack-index">{pad(i + 1)}</span>
            <h3 className="stack-name">{cat.name}</h3>
            <ul className="stack-skills">
              {cat.skills.map((s, j) => (
                <li key={s} style={{ '--j': j } as CSSProperties}>
                  {s}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ─── Education ──────────────────────────────────────────── */

export function Education() {
  return (
    <section id="education" className="section edu" aria-labelledby="education-heading">
      <header className="section-head">
        <SectionLabel index="04" label="Education" />
        <SplitHeading id="education-heading" lines={['Academic', 'record']} />
      </header>
      <div className="edu-grid">
        <p className="edu-cgpa" data-reveal>
          <span className="edu-cgpa-value">{education.cgpa}</span>
          <span className="edu-cgpa-label">CGPA</span>
        </p>
        <div className="edu-info" data-reveal>
          <h3 className="edu-degree">{education.degree}</h3>
          <p className="edu-school">{education.school}</p>
          <p className="edu-period">{education.period}</p>
          <div className="edu-award">
            <p>
              <strong>{education.award}</strong> &mdash; {education.awardDetail} &mdash; {education.school}
            </p>
            <ol className="edu-semesters" aria-label={`${education.award} in all ${education.semesters} semesters`}>
              {Array.from({ length: education.semesters }, (_, i) => (
                <li key={i} style={{ '--i': i } as CSSProperties}>
                  <span>S{i + 1}</span>
                  <i aria-hidden="true">&#10003;</i>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Contact ────────────────────────────────────────────── */

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <button
      className="contact-copy"
      data-cursor={copied ? 'Copied' : 'Copy'}
      onClick={() => {
        navigator.clipboard?.writeText(profile.email).then(
          () => setCopied(true),
          () => setCopied(false),
        )
      }}
    >
      {copied ? 'Copied' : 'Copy'}
      <span className="sr-only"> email address</span>
    </button>
  )
}

export function Contact() {
  const time = useLocalTime()
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-heading">
      <div className="contact-stage" aria-hidden="true" />
      <header className="section-head">
        <SectionLabel index="05" label="Contact" />
        <SplitHeading id="contact-heading" lines={["Let's", 'talk.']} className="contact-title" />
      </header>

      <div className="contact-email-row" data-reveal>
        <a className="contact-email" href={`mailto:${profile.email}`} data-cursor="Write">
          {profile.email}
        </a>
        <CopyEmail />
      </div>

      <div className="contact-grid" data-reveal>
        <ul className="contact-list">
          <li>
            <span>Phone</span>
            <a href={profile.phoneHref}>{profile.phone}</a>
          </li>
          <li>
            <span>Location</span>
            <p>
              {profile.location}
              <br />
              <em>{profile.relocation}</em>
            </p>
          </li>
          <li>
            <span>GitHub</span>
            <a href={profile.github} target="_blank" rel="noreferrer">
              {profile.githubLabel} <ArrowIcon direction="up-right" />
            </a>
          </li>
          <li>
            <span>LinkedIn</span>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              {profile.linkedinLabel} <ArrowIcon direction="up-right" />
            </a>
          </li>
        </ul>
        <a className="btn btn-solid btn-xl" href={resumeHref} download data-cursor="Get" data-magnetic>
          <DownloadIcon />
          Download Resume
        </a>
      </div>

      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} {profile.name}</span>
        <span>Custom GLSL &middot; React Three Fiber &middot; GSAP</span>
        <span>Johor {time} GMT+8</span>
        <button className="footer-top" onClick={scrollToTop} data-magnetic>
          Back to top <ArrowIcon direction="up" />
        </button>
      </footer>
    </section>
  )
}
