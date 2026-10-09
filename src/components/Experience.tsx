import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { caseStudies, currentRole, internship, type CaseStudy } from '../data/content'
import { pad } from '../lib/hooks'
import { ShowcaseFigure } from './Diagrams'
import { ArrowIcon, Chips, SectionLabel, SplitHeading } from './ui'

// Horizontal scroll only where there is room for full-height panels.
const HORIZONTAL_QUERY = '(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)'

function CasePanel({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <article className="panel case" aria-labelledby={`case-${study.id}`}>
      <div className="case-copy">
        <p className="case-index">
          <span>{pad(index + 1)}</span> / {pad(caseStudies.length)}
          <em>{study.metricLabel}</em>
        </p>
        <p className="case-metric">{study.metric}</p>
        <h3 id={`case-${study.id}`} className="case-title">
          {study.title}
        </h3>
        <p className="case-subtitle">{study.subtitle}</p>
        <dl className="case-psr">
          <div>
            <dt>Problem</dt>
            <dd>{study.problem}</dd>
          </div>
          <div>
            <dt>Solution</dt>
            <dd>{study.solution}</dd>
          </div>
          <div className="is-result">
            <dt>Result</dt>
            <dd>{study.result}</dd>
          </div>
        </dl>
      </div>
      <div className="case-visual">
        <ShowcaseFigure showcase={study.showcase} index={index} />
        <Chips items={study.tech} />
      </div>
    </article>
  )
}

export default function Experience() {
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mm = gsap.matchMedia()
    mm.add(HORIZONTAL_QUERY, () => {
      const pinEl = pin.current
      const trackEl = track.current
      if (!pinEl || !trackEl) return
      pinEl.classList.add('is-horizontal')
      const distance = () => trackEl.scrollWidth - window.innerWidth
      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(trackEl, { clearProps: 'transform' })
        pinEl.classList.remove('is-horizontal')
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section id="experience" className="exp" aria-labelledby="experience-heading">
      <div className="exp-pin" ref={pin}>
        <div className="exp-track" ref={track}>
          <header className="panel exp-intro">
            <SectionLabel index="01" label="Experience" />
            <SplitHeading id="experience-heading" lines={['Selected', 'impact']} />
            <div className="exp-company" data-reveal>
              <p className="exp-company-name">{currentRole.company}</p>
              <p>
                {currentRole.role} &middot; {currentRole.period}
              </p>
              <span className="tag-live">
                <span className="pulse-dot" aria-hidden="true" /> Current
              </span>
            </div>
            <p className="exp-hint" data-reveal>
              {caseStudies.length} case files <ArrowIcon />
            </p>
          </header>

          {caseStudies.map((study, i) => (
            <CasePanel key={study.id} study={study} index={i} />
          ))}

          <article className="panel exp-outro" aria-labelledby="internship-heading">
            <p className="case-index">Previously</p>
            <h3 id="internship-heading" className="exp-outro-company">
              {internship.company}
            </h3>
            <p className="exp-outro-role">
              {internship.role} &middot; {internship.period}
            </p>
            <ul className="exp-outro-points">
              {internship.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
        <span className="exp-progress" aria-hidden="true">
          <span ref={bar} />
        </span>
      </div>
    </section>
  )
}
