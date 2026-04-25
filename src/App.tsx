import { useState } from 'react'
import './App.css'

const themes = [
  { id: 'aurora', label: 'Aurora', caption: 'Soft glow' },
  { id: 'carbon', label: 'Carbon', caption: 'Editorial' },
  { id: 'ember', label: 'Ember', caption: 'Warm pulse' },
] as const

const pillars = [
  {
    title: 'Clarity',
    body: 'Everything is structured for quick scanning: strong hierarchy, tight copy, and a path from first impression to contact.',
  },
  {
    title: 'Craft',
    body: 'The layout leans cinematic without getting noisy, with layered gradients, glassy surfaces, and animated depth.',
  },
  {
    title: 'Delivery',
    body: 'Built as a Vite app that stays responsive, lightweight, and easy to deploy to GitHub Pages.',
  },
] as const

const highlights = [
  {
    eyebrow: 'Story',
    title: 'Lead with a clear point of view',
    body: 'A hero section that explains what you do, why it matters, and where someone should click next.',
  },
  {
    eyebrow: 'Signal',
    title: 'Show work without clutter',
    body: 'Short, confident cards surface the strongest parts of your background without forcing a long scroll.',
  },
  {
    eyebrow: 'Action',
    title: 'Make contact obvious',
    body: 'The footer closes the loop with a direct call to connect and a simple route for GitHub Pages publishing.',
  },
] as const

const signals = [
  'React + TypeScript',
  'Vite-powered build',
  'Responsive layout',
  'Custom domain ready',
] as const

function App() {
  const [theme, setTheme] = useState<(typeof themes)[number]['id']>('aurora')

  return (
    <main className={`portfolio theme-${theme}`}>
      <div className="orb orb-one" aria-hidden="true" />
      <div className="orb orb-two" aria-hidden="true" />
      <div className="orb orb-three" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Ng Kaizheng home">
          NK
        </a>
        <div className="theme-switch" role="group" aria-label="Theme switcher">
          {themes.map((option) => (
            <button
              key={option.id}
              type="button"
              className={option.id === theme ? 'theme-button active' : 'theme-button'}
              onClick={() => setTheme(option.id)}
              aria-pressed={option.id === theme}
            >
              <span>{option.label}</span>
              <small>{option.caption}</small>
            </button>
          ))}
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">React / Vite portfolio</p>
          <h1>Ng Kaizheng</h1>
          <p className="lede">
            A polished single-page portfolio with an editorial feel, flexible mood settings,
            and a structure that keeps the important stuff impossible to miss.
          </p>

          <div className="hero-actions">
            <a className="primary-action" href="#work">
              View the page structure
            </a>
            <a className="secondary-action" href="#contact">
              Start a conversation
            </a>
          </div>

          <ul className="signal-list" aria-label="Build signals">
            {signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>

        <aside className="hero-panel" aria-label="Portfolio summary">
          <div className="panel-header">
            <span className="panel-kicker">Current mood</span>
            <strong>{themes.find((option) => option.id === theme)?.label}</strong>
          </div>

          <div className="panel-stat">
            <span>Focus</span>
            <strong>Clean storytelling, quick navigation, and strong visual rhythm.</strong>
          </div>

          <div className="panel-stat">
            <span>Stack</span>
            <strong>React, TypeScript, Vite, and deploy-ready static hosting.</strong>
          </div>

          <div className="panel-stat">
            <span>Layout</span>
            <strong>Hero, proof points, highlights, and a direct contact close.</strong>
          </div>
        </aside>
      </section>

      <section className="section-grid" id="work">
        <article className="section-card section-card-wide">
          <p className="section-label">What this page does</p>
          <h2>A base layout with room to evolve</h2>
          <p>
            The site is intentionally flexible: keep the core structure, swap in resume content,
            or use the theme switch to give the same story a different atmosphere.
          </p>
        </article>

        {pillars.map((pillar) => (
          <article className="section-card" key={pillar.title}>
            <p className="section-label">Principle</p>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="highlights">
        <div className="section-heading">
          <p className="section-label">Highlights</p>
          <h2>Designed to read like a real portfolio, not a template dump.</h2>
        </div>

        <div className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.title}>
              <p className="highlight-eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-card" id="contact">
        <div>
          <p className="section-label">Contact</p>
          <h2>Ready for the last mile</h2>
          <p>
            Once your real resume details are dropped in, this page is ready to ship to GitHub
            Pages under your verified domain.
          </p>
        </div>

        <a className="primary-action contact-action" href="mailto:hello@ngkaizheng.online">
          hello@ngkaizheng.online
        </a>
      </section>

      <footer className="footer">
        <span>Ng Kaizheng</span>
        <span>Built with React + Vite</span>
        <span>ngkaizheng.online</span>
      </footer>
    </main>
  )
}

export default App
