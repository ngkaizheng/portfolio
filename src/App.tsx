import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

const resumeHref = '/resume/NgKaiZheng_Resume.pdf'

/* ─── Data ──────────────────────────────────────────────── */

const etiqaDeepDives = [
  {
    id: 'ai-agent',
    title: 'AI Agent Orchestration',
    subtitle: 'Multi-agent workflow system',
    problem:
      'Team needed to handle complex, multi-step tasks using AI, but context window constraints made single-agent approaches unreliable for large codebases.',
    solution:
      'Engineered a multi-agent system following an Analysis \u2192 Plan \u2192 Implement \u2192 Review pipeline. Each agent has a specialized role with constrained context, passing structured outputs between stages.',
    result: '60% boost in team productivity across development workflows.',
    tech: ['TypeScript', 'AI Orchestration', 'Prompt Engineering'],
    metric: '60%',
    metricLabel: 'productivity',
    showcase: {
      type: 'pipeline',
      title: 'Agent Pipeline Architecture',
      stages: ['Analyst', 'Planner', 'Implementer', 'Reviewer'],
      description: 'Each agent receives only the context it needs, preventing window overflow',
    },
  },
  {
    id: 'rapid-delivery',
    title: 'Rapid System Modernization',
    subtitle: 'Accelerated delivery timelines',
    problem:
      'Legacy system revamp modules had a projected 2-week lead time each, slowing the overall modernization effort and delaying feature delivery to internal users.',
    solution:
      'Streamlined development workflows and leveraged AI-assisted spec-driven development (OpenSpec + Obsidian) to maintain full context across sessions. Established coding standards and requirements that stay continuously up to date, enabling faster onboarding and execution.',
    result: 'Consistently completed complex system revamp modules in 1 week vs. the projected 2-week lead time \u2014 a 50% reduction in delivery timelines.',
    tech: ['.NET', 'React', 'AI-Assisted Development', 'Spec-Driven Workflow'],
    metric: '50%',
    metricLabel: 'faster delivery',
    showcase: {
      type: 'metricCompare',
      title: 'Delivery Speed Improvement',
      before: { label: 'Before', value: '2 weeks', sublabel: 'per module' },
      after: { label: 'After', value: '1 week', sublabel: 'per module' },
      improvement: '50% faster',
    },
  },
  {
    id: 'workflow-engine',
    title: 'Dynamic Workflow Engine',
    subtitle: 'Module-agnostic approval routing',
    problem:
      'Recruitment and internal modules needed flexible approval routing that could adapt to different business processes without code changes.',
    solution:
      'Architected a module-agnostic, dynamic approval engine supporting Parallel, Sequential, and Percentage-based routing. Each workflow is configuration-driven with a full audit trail.',
    result: '100% auditability for recruitment and internal modules. New workflows deploy without code changes.',
    tech: ['.NET', 'Domain-Driven Design', 'Clean Architecture'],
    metric: '100%',
    metricLabel: 'auditability',
    showcase: {
      type: 'flowDiagram',
      title: 'Workflow Routing Patterns',
      flows: [
        { name: 'Sequential', steps: ['Manager', 'HR', 'Finance'], icon: '\u2192' },
        { name: 'Parallel', steps: ['HR', 'Finance'], icon: '||' },
        { name: 'Percentage', steps: ['60% threshold', 'Director/VP'], icon: '\u2265' },
      ],
    },
  },
  {
    id: 'hrms',
    title: 'Internal HRMS (Full SDLC)',
    subtitle: 'Serving 7,000+ Maybank group users',
    problem:
      'The Maybank group needed internal HRMS modules for recruitment, onboarding, and OKR management, but development capacity was limited to a small team on a tight deadline.',
    solution:
      'Delivered recruitment/onboarding and OKR modules as a core developer on a 4-person team, owning the full software development lifecycle from design to deployment.',
    result: 'Modules delivered in ~2 months, serving 7,000+ internal users across the Maybank group.',
    tech: ['.NET', 'React', 'Full SDLC', 'Enterprise Scale'],
    metric: '7K+',
    metricLabel: 'users served',
    showcase: {
      type: 'moduleGrid',
      title: 'Platform Modules Delivered',
      modules: [
        { name: 'Recruitment', status: 'delivered', scope: 'Job posting \u2192 Offer' },
        { name: 'Onboarding', status: 'delivered', scope: 'Docs \u2192 IT Setup \u2192 Training' },
        { name: 'OKR Management', status: 'delivered', scope: 'Goals \u2192 Tracking \u2192 Reviews' },
      ],
      team: '4 developers',
      timeline: '2 months',
    },
  },
  {
    id: 'mfe-migration',
    title: 'Micro-frontend Migration',
    subtitle: 'Module Federation architecture',
    problem:
      'Monolithic frontend slowed deployment cycles. A change in one module required full regression testing and redeployment of the entire application.',
    solution:
      'Spearheaded transition to Micro-frontend architecture using Module Federation. Each team owns their module with independent deployment.',
    result: 'Teams ship independently on their own release cadence. Zero cross-team deployment blocking. Zero downtime for unaffected modules.',
    tech: ['React', 'Module Federation', 'TypeScript'],
    metric: 'Zero',
    metricLabel: 'downtime',
    showcase: {
      type: 'metricCompare',
      title: 'Deployment Model Transformation',
      before: { label: 'Monolith', value: 'Coordinated', sublabel: 'All teams release together' },
      after: { label: 'MFE', value: 'Independent', sublabel: 'Each team deploys anytime' },
      improvement: 'Zero coupling',
    },
  },
  {
    id: 'ai-recruitment',
    title: 'AI-Driven Recruitment',
    subtitle: 'Automated candidate screening',
    problem:
      'Manual candidate screening was time-consuming and inconsistent. Recruiters needed a way to quickly assess candidates at scale while identifying potential red flags.',
    solution:
      'Integrated AI analysis services to automate candidate screening, providing match scores, red flag detection, and summaries to streamline the hiring pipeline.',
    result: 'Automated screening with match scores and red flag detection, significantly reducing manual review time.',
    tech: ['.NET', 'React', 'AI Integration', 'Workflow Engine'],
    metric: 'Auto',
    metricLabel: 'screening',
    showcase: {
      type: 'pipeline',
      title: 'AI Screening Pipeline',
      stages: ['Resume Input', 'AI Analysis', 'Match Score', 'Red Flags', 'Summary'],
      description: 'Automated pipeline processes candidates in seconds vs hours of manual review',
    },
  },
  {
    id: 'auth',
    title: 'Granular Authorization',
    subtitle: 'Attribute-Based Access Control',
    problem:
      'Role-based access was too coarse and scattered across frontend code. Permission logic was duplicated in UI checks and API endpoints, creating security gaps.',
    solution:
      'Implemented a comprehensive Attribute-Based Access Control (ABAC) system across React and .NET for fine-grained user permission management. The API returns a capabilities object declaring what actions the current user can perform on each resource.',
    result: 'Zero-trust security model with fine-grained permissions. Frontend is a thin client with no permission logic.',
    tech: ['.NET', 'React', 'ABAC', 'JWT'],
    metric: 'ABAC',
    metricLabel: 'security model',
    showcase: {
      type: 'codeExample',
      title: 'Backend-Driven Capabilities',
      before: `// Frontend hard-coded permissions
if (user.role === 'admin' && order.status === 'paid') {
  showDeleteButton = true;
}`,
      after: `// API response with capabilities
{
  "id": "123",
  "capabilities": {
    "cancel": true,
    "pay": false,
    "delete": false
  }
}
// Frontend: pure renderer, zero logic
order.capabilities.cancel && <Button />`,
    },
  },
]

const aioExperience = {
  role: 'Game Developer Intern',
  company: 'AIO Synergy Sdn Bhd',
  period: 'Jun 2024 - Feb 2025',
  points: [
    'Built server-integrated game features using TypeScript with reusable, optimized mechanics.',
    'Led backend integration for a Scratch Card game - REST API calls for secure data handling, user progress tracking, and client-server communication.',
    'Collaborated in an Agile team using Git across debugging, testing, and deployment.',
  ],
}

const projects = [
  {
    id: 'pet-appointment',
    name: 'Pet Appointment System',
    tagline: 'Full-Stack Cloud-Native',
    year: '2025',
    tech: ['C#', '.NET', 'SQL Server', 'React', 'Azure', 'AWS'],
    summary:
      'A full-stack pet appointment management system built with Clean Architecture, CQRS, and cloud-native deployment.',
    details: [
      'Implemented secure authentication using JWT + OAuth 2.0 (Google) for flexible user access.',
      'Applied CQRS via MediatR for clear separation of concerns and maintainable code.',
      'Designed optimized SQL Server schemas with triggers to enforce business rules.',
      'Automated appointment reminders using Quartz.NET scheduling with WhatsApp API integration.',
      'Deployed to Azure App Services and AWS EC2/CloudFront with DNS managed via Route 53.',
    ],
    architecture: [
      { label: 'React Frontend', x: 50, y: 12 },
      { label: '.NET Web API', x: 50, y: 32 },
      { label: 'MediatR (CQRS)', x: 25, y: 52 },
      { label: 'EF Core + Dapper', x: 75, y: 52 },
      { label: 'SQL Server', x: 50, y: 72 },
      { label: 'Quartz.NET', x: 22, y: 72 },
      { label: 'WhatsApp API', x: 78, y: 72 },
    ],
  },
  {
    id: 'rag-chat',
    name: 'AI-Powered RAG Chat',
    tagline: 'Retrieval-Augmented Generation',
    year: '2025',
    tech: ['.NET', 'Azure AI Services', 'RAG'],
    summary:
      'A .NET Web API implementing RAG using Azure AI services to answer queries contextually from a custom blog-post corpus.',
    details: [
      'Built a .NET Web API that processes user queries through Azure AI embeddings.',
      'Implemented retrieval-augmented generation to ground responses in a custom knowledge corpus.',
      'Chat orchestration handles context management and response generation.',
    ],
    architecture: [
      { label: 'User Query', x: 50, y: 10 },
      { label: '.NET API', x: 50, y: 28 },
      { label: 'Azure AI Embeddings', x: 25, y: 46 },
      { label: 'Vector Store', x: 75, y: 46 },
      { label: 'Chat Orchestration', x: 50, y: 64 },
      { label: 'Response', x: 50, y: 82 },
    ],
  },
  {
    id: 'blockchain-game',
    name: 'Blockchain Multiplayer Game',
    tagline: 'Final Year Project',
    year: '2025',
    tech: ['Unity', 'Azure PlayFab', 'ThirdWeb', 'Polygon', 'Photon Fusion'],
    summary:
      'A multiplayer game with blockchain-verified NFT ownership, authoritative server networking, and scalable backend services.',
    details: [
      'Architected scalable backend using Azure PlayFab for player data, authentication, and server-side logic.',
      'Integrated ThirdWeb smart contracts on Polygon for NFT ownership verification and transactions.',
      'Utilized Photon Fusion for authoritative server networking with state synchronization.',
    ],
    architecture: [
      { label: 'Unity Client', x: 50, y: 10 },
      { label: 'Photon Fusion Server', x: 50, y: 28 },
      { label: 'Azure PlayFab', x: 25, y: 46 },
      { label: 'ThirdWeb / Polygon', x: 75, y: 46 },
      { label: 'NFT Verification', x: 50, y: 64 },
      { label: 'Player Data', x: 50, y: 82 },
    ],
  },
]

const skillCategories = [
  { name: 'Languages', skills: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'Java'] },
  { name: 'Backend', skills: ['.NET (Core/8+)', 'EF Core', 'MediatR (CQRS)', 'Dapper', 'REST APIs', 'Microservices', 'Quartz.NET'] },
  { name: 'Frontend', skills: ['React', 'Micro-frontends (MFE)', 'Module Federation', 'Tailwind CSS', 'Redux'] },
  { name: 'AI & Automation', skills: ['AI Agent Orchestration', 'Prompt Engineering', 'RAG', 'Multi-Agent Workflows'] },
  { name: 'Architecture', skills: ['Clean Architecture', 'DDD', 'ABAC', 'JWT', 'OAuth 2.0', 'Result Pattern'] },
  { name: 'Cloud & DevOps', skills: ['Azure (App Services, Storage, ServiceBus, KeyVault, AppInsights)', 'AWS (EC2, CloudFront, Route53)', 'Docker', 'Git', 'Jira'] },
]

/* ─── Hooks ─────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed')
        })
      },
      { threshold: 0.06 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useCounter(active: boolean, target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Number((eased * target).toFixed(1)))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [active, target, duration])

  return count
}

function useActiveSection() {
  const [active, setActive] = useState('top')
  const lockRef = useRef(false)
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '-10% 0px -60% 0px'
      }
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollTo = useCallback((id: string) => {
    setActive(id)
    lockRef.current = true
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current)
    lockTimeoutRef.current = setTimeout(() => {
      lockRef.current = false
      lockTimeoutRef.current = null
    }, 1500)
  }, [])

  return { active, scrollTo }
}

/* ─── Components ─────────────────────────────────────────── */

function SkipToContent() {
  return (
    <a href="#experience" className="skip-to-content">
      Skip to content
    </a>
  )
}

function MobileMenu({ active, scrollTo }: { active: string; scrollTo: (id: string) => void }) {
  const [open, setOpen] = useState(false)

  const links = [
    { id: 'top', label: 'Top' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ]

  const handleNav = (id: string) => {
    setOpen(false)
    scrollTo(id)
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`hamburger ${open ? 'open' : ''}`}>
          <span />
          <span />
          <span />
        </span>
      </button>

      {open && <div className="mobile-overlay" onClick={() => setOpen(false)} />}

      <nav className={`mobile-drawer ${open ? 'open' : ''}`} aria-label="Mobile navigation">
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-name">Ng Kai Zheng</span>
          <button className="mobile-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {links.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`mobile-link ${active === link.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              handleNav(link.id)
            }}
          >
            <span className="mobile-link-dot" />
            {link.label}
          </a>
        ))}
        <div className="mobile-drawer-footer">
          <a className="btn-primary mobile-resume-btn" href={resumeHref} download>
            Download Resume
          </a>
        </div>
      </nav>
    </>
  )
}

function SideNav({ active, scrollTo }: { active: string; scrollTo: (id: string) => void }) {
  const links = [
    { id: 'top', label: 'Top' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <nav className="sidenav" aria-label="Section navigation">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={`sidenav-link ${active === link.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            scrollTo(link.id)
            document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <span className="sidenav-dot" />
          <span className="sidenav-label">{link.label}</span>
        </a>
      ))}
    </nav>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`scroll-to-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}

function Hero({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [active, setActive] = useState(false)
  const prod = useCounter(active, 60)
  const delivery = useCounter(active, 50)
  const users = useCounter(active, 7000)
  const cgpa = useCounter(active, 4.0)

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="hero" id="top">
      <div className="hero-grid" aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="grid-dot" />
        ))}
      </div>

      <div className="hero-inner">
        <div className="hero-badge reveal">
          <span className="badge-dot" />
          Available for hire
        </div>

        <h1 className="hero-title reveal">Ng Kai Zheng</h1>
        <p className="hero-role reveal">Full-Stack Software Engineer - .NET - React - AI Orchestration</p>
        <p className="hero-tagline reveal">
          1 year building enterprise-scale systems on Azure. Modernized legacy platforms serving 7,000+ internal users and architected AI-driven workflow engines. Ready to relocate to Singapore.
        </p>

        <div className="hero-stats reveal">
          <div className="stat-card">
            <span className="stat-value">{prod}%</span>
            <span className="stat-label">Team productivity boost</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{delivery}%</span>
            <span className="stat-label">Faster delivery</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{users >= 1000 ? `${Math.round(users / 1000)}K+` : users}</span>
            <span className="stat-label">Users served</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{cgpa.toFixed(1)}</span>
            <span className="stat-label">CGPA at UTM</span>
          </div>
        </div>

        <div className="hero-actions reveal">
          <a className="btn-primary" href={resumeHref} download>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Resume
          </a>
          <button
            className="btn-secondary"
            onClick={() => {
              scrollTo('experience')
              document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            See My Work
          </button>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-dot" />
      </div>
    </section>
  )
}

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="section-header reveal">
      <span className="section-label">{label}</span>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ShowcasePanel({ showcase }: { showcase: typeof etiqaDeepDives[number]['showcase'] }) {
  if (!showcase) return null
  const s = showcase as any

  if (s.type === 'pipeline') {
    return (
      <div className="showcase-pipeline">
        <p className="showcase-title">{s.title}</p>
        <div className="pipeline-stages">
          {s.stages.map((stage: string, i: number) => (
            <span key={stage} className="pipeline-stage-wrap">
              <span className="pipeline-stage">{stage}</span>
              {i < s.stages.length - 1 && (
                <span className="pipeline-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="showcase-desc">{s.description}</p>
      </div>
    )
  }

  if (s.type === 'metricCompare') {
    return (
      <div className="showcase-metric">
        <p className="showcase-title">{s.title}</p>
        <div className="metric-compare">
          <div className="metric-box before">
            <span className="metric-box-label">{s.before.label}</span>
            <span className="metric-box-value">{s.before.value}</span>
            <span className="metric-box-sub">{s.before.sublabel}</span>
          </div>
          <span className="metric-arrow" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
          <div className="metric-box after">
            <span className="metric-box-label">{s.after.label}</span>
            <span className="metric-box-value">{s.after.value}</span>
            <span className="metric-box-sub">{s.after.sublabel}</span>
          </div>
        </div>
        <span className="metric-badge">{s.improvement}</span>
      </div>
    )
  }

  if (s.type === 'flowDiagram') {
    return (
      <div className="showcase-flow">
        <p className="showcase-title">{s.title}</p>
        <div className="flow-list">
          {s.flows.map((flow: any) => (
            <div key={flow.name} className="flow-row">
              <span className="flow-name">{flow.name}</span>
              <span className="flow-steps">
                {flow.steps.map((step: string, i: number) => (
                  <span key={step}>
                    <span className="flow-step">{step}</span>
                    {i < flow.steps.length - 1 && <span className="flow-sep">{flow.icon}</span>}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (s.type === 'moduleGrid') {
    return (
      <div className="showcase-modules">
        <p className="showcase-title">{s.title}</p>
        <div className="module-list">
          {s.modules.map((mod: any) => (
            <div key={mod.name} className="module-item">
              <span className="module-status" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              <div className="module-info">
                <span className="module-name">{mod.name}</span>
                <span className="module-scope">{mod.scope}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="module-meta">
          <span>{s.team}</span>
          <span className="module-meta-sep">/</span>
          <span>{s.timeline}</span>
        </div>
      </div>
    )
  }

  if (s.type === 'codeExample') {
    return (
      <div className="showcase-code">
        <p className="showcase-title">{s.title}</p>
        <div className="code-snippet">
          <div className="code-block">
            <span className="code-label">Before</span>
            <pre><code>{s.before}</code></pre>
          </div>
          <div className="code-block">
            <span className="code-label">After</span>
            <pre><code>{s.after}</code></pre>
          </div>
        </div>
      </div>
    )
  }

  return null
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function DeepDiveCard({ dive }: { dive: typeof etiqaDeepDives[number] }) {
  const [open, setOpen] = useState(false)

  return (
    <article className={`deep-dive ${open ? 'open' : ''}`}>
      <button className="deep-dive-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="deep-dive-left">
          <span className="deep-dive-metric">{dive.metric}</span>
          <div>
            <h3 className="deep-dive-title">{dive.title}</h3>
            <p className="deep-dive-subtitle">{dive.subtitle}</p>
          </div>
        </div>
        <span className="deep-dive-toggle" aria-hidden="true">
          {open ? '\u2212' : '+'}
        </span>
      </button>

      {open && (
        <div className="deep-dive-body">
          <div className="deep-dive-row">
            <span className="deep-dive-tag problem">Problem</span>
            <p>{dive.problem}</p>
          </div>
          <div className="deep-dive-row">
            <span className="deep-dive-tag solution">Solution</span>
            <p>{dive.solution}</p>
          </div>
          <div className="deep-dive-row">
            <span className="deep-dive-tag result">Result</span>
            <p>{dive.result}</p>
          </div>
          <ShowcasePanel showcase={dive.showcase} />
          <div className="deep-dive-tech">
            {dive.tech.map((t) => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function Experience() {
  return (
    <section className="section" id="experience">
      <SectionHeader
        label="Experience"
        title="Where I've worked"
        subtitle="Deep dives into problems I solved and results I delivered."
      />

      <div className="company-block reveal">
        <div className="company-header">
          <div className="company-info">
            <h3 className="company-name">Etiqa Insurance and Takaful Sdn Bhd</h3>
            <p className="company-role">.NET Developer &middot; Nov 2025 - Present</p>
          </div>
          <span className="company-badge">Current</span>
        </div>

        <div className="deep-dives">
          {etiqaDeepDives.map((dive) => (
            <DeepDiveCard key={dive.id} dive={dive} />
          ))}
        </div>
      </div>

      <div className="company-block reveal">
        <div className="company-header">
          <div className="company-info">
            <h3 className="company-name">AIO Synergy Sdn Bhd</h3>
            <p className="company-role">Game Developer Intern &middot; Jun 2024 - Feb 2025</p>
          </div>
        </div>
        <ul className="experience-points">
          {aioExperience.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ArchitectureDiagram({ nodes }: { nodes: { label: string; x: number; y: number }[] }) {
  return (
    <>
      <div className="arch-diagram arch-diagram-desktop">
        <svg className="arch-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {nodes.map((node, i) => {
            if (i === nodes.length - 1) return null
            const next = nodes[i + 1]
            return (
              <line
                key={i}
                x1={node.x}
                y1={node.y + 4}
                x2={next.x}
                y2={next.y - 4}
                className="arch-line"
              />
            )
          })}
        </svg>
        {nodes.map((node, i) => (
          <span
            key={i}
            className="arch-node"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.label}
          </span>
        ))}
      </div>
      <ol className="arch-list-mobile">
        {nodes.map((node, i) => (
          <li key={i} className="arch-list-item">
            <span className="arch-list-num">{i + 1}</span>
            <span className="arch-list-label">{node.label}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function ProjectCard({ project }: { project: typeof projects[number] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={`project-card ${expanded ? 'expanded' : ''}`}>
      <div className="project-header">
        <div>
          <h3 className="project-name">{project.name}</h3>
          <p className="project-tagline">{project.tagline} &middot; {project.year}</p>
        </div>
        <button className="project-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? 'Close' : 'Explore'}
        </button>
      </div>

      <p className="project-summary">{project.summary}</p>

      <div className="project-tech">
        {project.tech.map((t) => (
          <span key={t} className="tech-chip">{t}</span>
        ))}
      </div>

      {expanded && (
        <div className="project-details">
          <ArchitectureDiagram nodes={project.architecture} />
          <ul className="project-points">
            {project.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function Projects() {
  return (
    <section className="section" id="projects">
      <SectionHeader
        label="Projects"
        title="Things I've built"
        subtitle="Click any project to see the architecture and technical details."
      />
      <div className="projects-list">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section className="section" id="skills">
      <SectionHeader label="Skills" title="What I work with" />
      <div className="skills-categories">
        {skillCategories.map((cat) => (
          <div key={cat.name} className="skill-category reveal">
            <h3 className="skill-cat-name">{cat.name}</h3>
            <div className="skill-tags">
              {cat.skills.map((s) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Education() {
  return (
    <section className="section" id="education">
      <SectionHeader label="Education" title="Background" />
      <div className="education-card reveal">
        <div className="education-main">
          <h3>Bachelor of Computer Science (Graphics and Multimedia Software)</h3>
          <p className="education-school">Universiti Teknologi Malaysia</p>
          <p className="education-period">Oct 2021 - Jul 2025</p>
        </div>
        <div className="education-cgpa">
          <span className="cgpa-value">4.0</span>
          <span className="cgpa-label">CGPA</span>
        </div>
      </div>
      <div className="awards-card reveal">
        <h3 className="awards-title">Awards & Honors</h3>
        <p className="awards-item">
          <span className="awards-badge">Dean's List</span>
          All Semesters (1-8) &mdash; Universiti Teknologi Malaysia
        </p>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="section" id="contact">
      <SectionHeader label="Contact" title="Get in touch" />
      <ul className="contact-list">
        <li>
          <a href="mailto:kaizheng.tech@gmail.com">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            kaizheng.tech@gmail.com
          </a>
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          +60 14-6850705
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Johor, Malaysia
        </li>
        <li>
          <a href="https://github.com/ngkaizheng" target="_blank" rel="noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            github.com/ngkaizheng
          </a>
        </li>
      </ul>
      <a className="btn-primary contact-btn" href={resumeHref} download>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Resume
      </a>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span>&copy; {new Date().getFullYear()} Ng Kai Zheng</span>
      <span>Built with React + Vite</span>
    </footer>
  )
}

/* ─── App ───────────────────────────────────────────────── */

function App() {
  useReveal()
  const { active, scrollTo } = useActiveSection()

  return (
    <div className="layout">
      <SkipToContent />
      <MobileMenu active={active} scrollTo={scrollTo} />
      <SideNav active={active} scrollTo={scrollTo} />
      <main className="page" id="main-content">
        <Hero scrollTo={scrollTo} />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
        <Footer />
      </main>
      <ScrollToTop />
    </div>
  )
}

export default App
