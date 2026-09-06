import { useState } from 'react'
import { motion } from 'framer-motion'
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
      'Engineered a multi-agent workflow that improved team productivity by 60% using AI orchestration.',
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
    eyebrow: 'Product Launch • April 2026',
    title: 'Connectiqa',
    body: 'Architecting a full-scale modernization for a late April pre-launch. Focused on modular scalability and seamless user onboarding using React Micro-frontends.',
  },
  {
    eyebrow: 'Enterprise Architecture',
    title: 'Customer Data Hub (CDH)',
    body: 'Implemented a single source of truth for identity attributes using Domain-Driven Design (DDD) to isolate Party and HR contexts.',
  },
  {
    eyebrow: 'Cloud-Native Full Stack',
    title: 'Pet Appointment System',
    body: 'Built a full-stack pet appointment platform with .NET, React, SQL Server, and Clean Architecture. Implemented JWT + OAuth 2.0, CQRS via MediatR, Quartz.NET reminders, and deployed to Azure/AWS.',
  },
  {
    eyebrow: 'AI Engineering',
    title: 'AI-Powered RAG Chat Demo',
    body: 'Developed a .NET Web API that uses Azure AI services for embeddings and chat orchestration over a custom knowledge corpus.',
  },
] as const

const skills = [
  'C#',
  'TypeScript',
  'JavaScript',
  'SQL',
  'React',
  '.NET 8+',
  'EF Core',
  'MediatR (CQRS)',
  'Micro-frontends (MFE)',
  'Module Federation',
  'DDD',
  'Clean Architecture',
  'Azure',
  'AWS',
  'Docker',
  'RAG (AI)',
  'AI Agent Orchestration',
  'JWT / OAuth 2.0',
  'Tailwind CSS',
  'Git',
] as const

const education = {
  degree: 'Bachelor of Computer Science (Graphics and Multimedia Software)',
  institution: 'Universiti Teknologi Malaysia',
  period: 'Oct 2021 – July 2025',
  cgpa: '4.0 / 4.0',
  highlights: ["Dean's List — All Semesters (1-8)"],
} as const

const sectionReveal = {
  hidden: { opacity: 0, y: 36, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: 'easeOut' },
  },
} as const

const gridReveal = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.06,
    },
  },
} as const

const itemReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
} as const

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

      <motion.section
        className="hero"
        id="top"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        <motion.div className="hero-copy" variants={itemReveal}>
          <p className="eyebrow">Software Engineer</p>
          <h1>NG KAI ZHENG</h1>
          <p className="lede">
            Full-stack engineer modernizing enterprise systems with .NET, React,
            and AI orchestration. Specialized in DDD, CQRS, and Micro-frontends.
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
        </motion.div>

        <motion.aside className="hero-panel" aria-label="Portfolio summary" variants={itemReveal}>
          <div className="panel-header">
            <span className="panel-kicker">Current role</span>
            <strong>.NET Developer</strong>
          </div>

          <div className="panel-stat">
            <span>Employer</span>
            <strong>Etiqa Insurance</strong>
          </div>

          <div className="panel-stat">
            <span>Core Focus</span>
            <strong>Domain-Driven Design (DDD) & Clean Architecture.</strong>
          </div>

          <div className="panel-stat">
            <span>Infrastructure</span>
            <strong>Enterprise-ready workflows via Podman & Azure.</strong>
          </div>
        </motion.aside>
      </motion.section>

      <motion.section
        className="section-grid"
        id="work"
        variants={gridReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.article className="section-card section-card-wide" variants={itemReveal}>
          <p className="section-label">Experience</p>
          <h2>Scalable production systems with measurable impact</h2>
          <p>
            From modernizing insurance modules to building multiplayer game services, I prioritize 
            architectural integrity and secure, compliant delivery.
          </p>
        </motion.article>

        {experiences.map((experience) => (
          <motion.article className="section-card" key={experience.role} variants={itemReveal}>
            <p className="section-label">Role</p>
            <h3>{experience.role}</h3>
            <p>{experience.period}</p>
            <ul className="signal-list" aria-label={`${experience.role} outcomes`}>
              {experience.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        className="highlights"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="section-heading" variants={itemReveal}>
          <p className="section-label">Selected Projects</p>
          <h2>Engineering across cloud, AI, and enterprise domains</h2>
        </motion.div>

        <motion.div className="highlight-grid" variants={gridReveal}>
          {projects.map((item) => (
            <motion.article className="highlight-card" key={item.title} variants={itemReveal}>
              <p className="highlight-eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="education"
        id="education"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="section-heading" variants={itemReveal}>
          <p className="section-label">Education</p>
          <h2>Strong academic foundation in computer science</h2>
        </motion.div>

        <motion.article className="education-card" variants={itemReveal}>
          <div className="education-header">
            <div>
              <h3>{education.degree}</h3>
              <p className="education-institution">{education.institution}</p>
              <p className="education-period">{education.period}</p>
            </div>
            <div className="education-cgpa">
              <span className="cgpa-value">{education.cgpa}</span>
              <span className="cgpa-label">CGPA</span>
            </div>
          </div>
          <ul className="education-highlights">
            {education.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </motion.article>
      </motion.section>

      <motion.section
        className="highlights"
        id="skills"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="section-heading" variants={itemReveal}>
          <p className="section-label">Skills</p>
          <h2>Enterprise stack for modern software delivery</h2>
        </motion.div>
        <motion.div className="skills-grid" variants={gridReveal}>
          {skills.map((skill) => (
            <motion.span className="skill-chip" key={skill} variants={itemReveal}>
              {skill}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="contact-card"
        id="contact"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <div>
          <p className="section-label">Let's connect</p>
          <h2>Ready to bring measurable impact to your team</h2>
          <ul className="signal-list" aria-label="Contact channels">
            <li>
              <a href="mailto:kaizheng.tech@gmail.com">kaizheng.tech@gmail.com</a>
            </li>
            <li>+60 14-6850705</li>
            <li>Johor, Malaysia</li>
            <li>
              <a href="https://github.com/ngkaizheng" target="_blank" rel="noreferrer">
                github.com/ngkaizheng
              </a>
            </li>
          </ul>
        </div>

        <a className="primary-action contact-action" href={resumeHref} download>
          Download Resume
        </a>
      </motion.section>

      <motion.footer
        className="footer"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <span>NG KAI ZHENG</span>
        <span>kaizheng.tech@gmail.com</span>
        <span>github.com/ngkaizheng</span>
      </motion.footer>
    </main>
  )
}

export default App