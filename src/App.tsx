import { useState } from 'react'
import './App.css'

const resumeHref = '/resume/NgKaiZheng_Resume.pdf'

const themes = [
  { id: 'aurora', label: 'Aurora', caption: 'Soft glow' },
  { id: 'carbon', label: 'Carbon', caption: 'Editorial' },
  { id: 'ember', label: 'Ember', caption: 'Warm pulse' },
] as const

const experiences = [
  {
    role: '.NET Developer, Etiqa Insurance and Takaful Sdn Bhd',
    period: 'Nov 2025 - Present',
    outcomes: [
      'Accelerated delivery timelines by 50%, shipping revamp modules in 1 week vs projected 2 weeks.',
      'Engineered a multi-agent workflow that improved team productivity by 60%.',
      'Led Micro-frontend migration using Module Federation with zero downtime for unaffected modules.',
    ],
  },
  {
    role: 'Internship Game Developer, AIO SYNERGY SDN BHD',
    period: 'June 2024 - Feb 2025',
    outcomes: [
      'Built TypeScript game features with reusable and optimized mechanics.',
      'Implemented Scratch Card backend integration via REST APIs for secure progress tracking.',
      'Contributed across debugging, testing, and deployment in an Agile team using Git.',
    ],
  },
] as const

const projects = [
  {
    eyebrow: 'Cloud-Native Full Stack',
    title: 'Pet Appointment System',
    body: 'Built with .NET, React, SQL Server, and Azure/AWS deployment. Implemented JWT + OAuth 2.0 and automated reminders with Quartz.NET.',
  },
  {
    eyebrow: 'AI Engineering',
    title: 'AI-Powered RAG Chat Demo',
    body: 'Developed a .NET Web API that uses Azure AI services for embeddings and chat orchestration over a custom knowledge corpus.',
  },
  {
    eyebrow: 'Final Year Project',
    title: 'Blockchain Multiplayer Game FYP',
    body: 'Implemented scalable backend services with Azure PlayFab, ThirdWeb smart contracts on Polygon, and Photon Fusion networking.',
  },
] as const

const skills = [
  'C#',
  'TypeScript',
  'JavaScript',
  'SQL',
  'React',
  '.NET (Core/8+)',
  'EF Core',
  'MediatR (CQRS)',
  'Micro-frontends (MFE)',
  'Module Federation',
  'RAG',
  'Azure',
  'AWS',
  'Docker',
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
          <p className="eyebrow">Software Engineer</p>
          <h1>NG KAI ZHENG</h1>
          <p className="lede">
            Full-stack engineer focused on modernizing enterprise systems with .NET, React,
            and AI orchestration, with a strong emphasis on DDD and clean architecture.
          </p>

          <div className="hero-actions">
            <a className="primary-action" href={resumeHref} download>
              Download Resume
            </a>
            <a className="secondary-action" href="https://github.com/ngkaizheng" target="_blank" rel="noreferrer">
              View GitHub
            </a>
          </div>

          <ul className="signal-list" aria-label="Contact details">
            <li>kaizheng.tech@gmail.com</li>
            <li>+60 14-6850705</li>
            <li>Johor, Malaysia</li>
            <li>
              <a href="https://github.com/ngkaizheng" target="_blank" rel="noreferrer">
                github.com/ngkaizheng
              </a>
            </li>
          </ul>
        </div>

        <aside className="hero-panel" aria-label="Portfolio summary">
          <div className="panel-header">
            <span className="panel-kicker">Current role</span>
            <strong>.NET Developer</strong>
          </div>

          <div className="panel-stat">
            <span>Employer</span>
            <strong>Etiqa Insurance and Takaful Sdn Bhd</strong>
          </div>

          <div className="panel-stat">
            <span>Impact</span>
            <strong>50% faster delivery and 60% team productivity boost through AI workflows.</strong>
          </div>

          <div className="panel-stat">
            <span>Location</span>
            <strong>Johor, Malaysia</strong>
          </div>
        </aside>
      </section>

      <section className="section-grid" id="work">
        <article className="section-card section-card-wide">
          <p className="section-label">Experience</p>
          <h2>Building production systems with measurable outcomes</h2>
          <p>
            From enterprise modernization to gameplay services, I focus on maintainable architecture,
            secure integrations, and delivery speed.
          </p>
        </article>

        {experiences.map((experience) => (
          <article className="section-card" key={experience.role}>
            <p className="section-label">Role</p>
            <h3>{experience.role}</h3>
            <p>{experience.period}</p>
            <ul className="signal-list" aria-label={`${experience.role} outcomes`}>
              {experience.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="highlights">
        <div className="section-heading">
          <p className="section-label">Projects</p>
          <h2>Selected work across cloud, AI, and multiplayer systems</h2>
        </div>

        <div className="highlight-grid">
          {projects.map((item) => (
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
          <p className="section-label">Skills</p>
          <h2>Core stack from production and project delivery</h2>
          <ul className="signal-list" aria-label="Skills stack">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>

        <a className="primary-action contact-action" href={resumeHref} download>
          Download Resume
        </a>
      </section>

      <footer className="footer">
        <span>NG KAI ZHENG</span>
        <span>kaizheng.tech@gmail.com</span>
        <span>github.com/ngkaizheng</span>
      </footer>
    </main>
  )
}

export default App
