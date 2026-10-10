// Every fact on the site lives here. It comes from the resume
// (public/resume/NgKaiZheng_Resume.pdf) or from the owner directly: the
// resume is trimmed to fit its page, so some details and examples only
// appear here. Presentation hints such as diagram variants or edge lists
// only describe how a fact is drawn.

// BASE_URL keeps the canonical resume path correct under the GitHub Pages
// project subpath (/portfolio/) without hard-coding the deployment root.
export const resumeHref = `${import.meta.env.BASE_URL}resume/NgKaiZheng_Resume.pdf`

export const profile = {
  name: 'Ng Kai Zheng',
  nameLines: ['NG KAI', 'ZHENG'],
  role: 'Full-Stack Software Engineer',
  roles: ['Full-Stack Software Engineer', '.NET + React', 'AI Agent Orchestration'],
  tagline:
    '1 year of experience building enterprise-scale systems on Azure. Modernized legacy platforms serving 7,000+ internal users and architected an AI-driven workflow engine.',
  location: 'Johor, Malaysia',
  relocation: 'Malaysian citizen, ready to relocate to Singapore',
  email: 'kaizheng.tech@gmail.com',
  phone: '+60 14-6850705',
  phoneHref: 'tel:+60146850705',
  github: 'https://github.com/ngkaizheng',
  githubLabel: 'github.com/ngkaizheng',
  linkedin: 'https://www.linkedin.com/in/kai-zheng-ng-tech',
  linkedinLabel: 'linkedin.com/in/kai-zheng-ng-tech',
}

export const heroStats = [
  { value: 60, suffix: '%', decimals: 0, label: 'Team productivity boost' },
  { value: 50, suffix: '%', decimals: 0, label: 'Shorter lead time' },
  { value: 7, suffix: 'K+', decimals: 0, label: 'Internal users' },
  { value: 4, suffix: '', decimals: 1, label: 'CGPA at UTM' },
]

/* ─── Experience ─────────────────────────────────────────── */

export interface PipelineShowcase {
  type: 'pipeline'
  title: string
  stages: string[]
  description: string
}

export interface CompareShowcase {
  type: 'compare'
  variant: 'timeline' | 'split'
  title: string
  before: { label: string; value: string; sublabel: string }
  after: { label: string; value: string; sublabel: string }
  improvement: string
}

export interface FlowsShowcase {
  type: 'flows'
  title: string
  flows: { name: 'Sequential' | 'Parallel' | 'Percentage'; steps: string[] }[]
}

export interface ModulesShowcase {
  type: 'modules'
  title: string
  modules: { name: string; scope: string[] }[]
  team: string
  timeline: string
}

export interface AbacShowcase {
  type: 'abac'
  title: string
  inputs: string[]
  policy: string
  decisions: [string, string]
  enforce: string[]
}

// Drawn by the particle swarm itself rather than a DOM diagram.
export interface SceneShowcase {
  type: 'scene'
  scene: 'gateway' | 'observe' | 'talk'
  title: string
  labels: string[]
}

export type Showcase =
  | PipelineShowcase
  | CompareShowcase
  | FlowsShowcase
  | ModulesShowcase
  | AbacShowcase
  | SceneShowcase

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  problem: string
  solution: string
  result: string
  tech: string[]
  metric: string
  metricLabel: string
  showcase: Showcase
}

export const currentRole = {
  company: 'Etiqa Insurance and Takaful Sdn Bhd',
  role: '.NET Developer',
  period: 'Nov 2025 – Present',
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ai-agent',
    title: 'AI Agent Orchestration',
    subtitle: 'Multi-agent workflow system',
    problem:
      'The team needed to handle complex, multi-step tasks with AI, but context window constraints made single-agent approaches unreliable for large codebases.',
    solution:
      'Engineered a multi-agent system following an Analysis → Plan → Implement → Review pipeline. Each agent has a specialized role with constrained context, passing structured outputs between stages.',
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
    result:
      'Consistently completed complex revamp modules in 1 week, half the projected 2-week lead time.',
    tech: ['.NET', 'React', 'AI-Assisted Development', 'Spec-Driven Workflow'],
    metric: '50%',
    metricLabel: 'shorter lead time',
    showcase: {
      type: 'compare',
      variant: 'timeline',
      title: 'Delivery Speed Improvement',
      before: { label: 'Projected', value: '2 weeks', sublabel: 'per module' },
      after: { label: 'Delivered', value: '1 week', sublabel: 'per module' },
      improvement: '50% shorter lead time',
    },
  },
  {
    id: 'hrms',
    title: 'Internal HRMS (Full SDLC)',
    subtitle: 'Serving 7,000+ Maybank group users',
    problem:
      'The Maybank group needed internal HRMS modules for recruitment, onboarding, and OKR management, but development capacity was limited to a small team on a tight deadline.',
    solution:
      'Delivered the recruitment/onboarding and OKR modules as a core developer on a 4-person team, working across the full software development lifecycle from design to deployment.',
    result: 'Modules delivered in ~2 months, serving 7,000+ internal users across the Maybank group.',
    tech: ['.NET', 'React', 'Full SDLC'],
    metric: '7K+',
    metricLabel: 'internal users',
    showcase: {
      type: 'modules',
      title: 'Platform Modules Delivered',
      modules: [
        { name: 'Recruitment', scope: ['Job posting', 'Offer'] },
        { name: 'Onboarding', scope: ['Docs', 'IT Setup', 'Training'] },
        { name: 'OKR Management', scope: ['Goals', 'Tracking', 'Reviews'] },
      ],
      team: '4 people',
      timeline: '~2 months',
    },
  },
  {
    id: 'workflow-engine',
    title: 'Dynamic Workflow Engine',
    subtitle: 'Module-agnostic approval routing',
    problem:
      'Recruitment and internal modules needed flexible approval routing that could adapt to different business processes without code changes.',
    solution:
      'Architected a module-agnostic, dynamic approval engine supporting sequential, parallel, and percentage-based approval routing. Each workflow is configuration-driven with a full audit trail.',
    result: '100% auditability for recruitment and internal modules. New workflows deploy without code changes.',
    tech: ['.NET', 'Domain-Driven Design', 'Clean Architecture'],
    metric: '100%',
    metricLabel: 'auditability',
    showcase: {
      type: 'flows',
      title: 'Workflow Routing Patterns',
      flows: [
        { name: 'Sequential', steps: ['Manager', 'HR', 'Finance'] },
        { name: 'Parallel', steps: ['HR', 'Finance'] },
        { name: 'Percentage', steps: ['60% threshold', 'Director/VP'] },
      ],
    },
  },
  {
    id: 'mfe-migration',
    title: 'Micro-frontend Migration',
    subtitle: 'Module Federation architecture',
    problem:
      'A monolithic frontend slowed deployment cycles: a change in one module meant regression testing and redeploying the entire application.',
    solution:
      'Spearheaded the transition to a micro-frontend (MFE) architecture using Module Federation. Each team owns its module and deploys it independently.',
    result:
      'Teams ship on their own release cadence, with no cross-team deployment blocking and zero downtime for unaffected modules.',
    tech: ['React', 'Module Federation', 'TypeScript'],
    metric: 'Zero',
    metricLabel: 'downtime for unaffected modules',
    showcase: {
      type: 'compare',
      variant: 'split',
      title: 'Deployment Model Transformation',
      before: { label: 'Monolith', value: 'Coordinated', sublabel: 'All teams release together' },
      after: { label: 'MFE', value: 'Independent', sublabel: 'Each team deploys anytime' },
      improvement: 'Independent deploys',
    },
  },
  {
    id: 'ai-recruitment',
    title: 'AI-Driven Recruitment',
    subtitle: 'Automated candidate screening',
    problem:
      'Manual candidate screening was time-consuming and inconsistent. Recruiters needed a way to quickly assess candidates at scale while identifying potential red flags.',
    solution:
      'Integrated AI analysis services to automate candidate screening, providing match scores, red-flag detection, and summaries.',
    result: 'Automated candidate screening that streamlines the hiring pipeline and cuts manual review.',
    tech: ['.NET', 'React', 'AI Integration', 'Workflow Engine'],
    metric: 'AI',
    metricLabel: 'candidate screening',
    showcase: {
      type: 'pipeline',
      title: 'AI Screening Pipeline',
      stages: ['Resume Input', 'AI Analysis', 'Match Score', 'Red Flags', 'Summary'],
      description: 'One AI analysis returns a match score, red flags, and a summary for each candidate',
    },
  },
  {
    id: 'domain-design',
    title: 'Tech & Business Analysis',
    subtitle: 'Domain design with the Customer Data Hub team',
    problem: 'Employee data needed a single source of truth.',
    solution: 'Collaborated with the Customer Data Hub team to define domain boundaries and ERDs.',
    result: 'Established a single source of truth for employee data.',
    tech: ['Domain-Driven Design', 'ERD', 'System Design'],
    metric: '1',
    metricLabel: 'source of truth',
    showcase: {
      type: 'scene',
      scene: 'talk',
      title: 'Domain Design Session',
      labels: ['Customer Data Hub team', 'Domain boundaries & ERDs', 'Single source of truth'],
    },
  },
  {
    id: 'auth',
    title: 'Granular Authorization',
    subtitle: 'Attribute-Based Access Control',
    problem: 'Role-based checks were too coarse for fine-grained user permissions.',
    solution:
      'Implemented a comprehensive Attribute-Based Access Control (ABAC) system across React and .NET for fine-grained user permission management.',
    result: 'One attribute-based permission model, enforced in both the React UI and the .NET API.',
    tech: ['.NET', 'React', 'ABAC', 'JWT'],
    metric: 'ABAC',
    metricLabel: 'security model',
    showcase: {
      type: 'abac',
      title: 'Attribute-Based Decisions',
      inputs: ['User attributes', 'Resource attributes', 'Action', 'Context'],
      policy: 'ABAC policy',
      decisions: ['Permit', 'Deny'],
      enforce: ['React UI', '.NET API'],
    },
  },
  {
    id: 'api-gateway',
    title: 'API Gateway',
    subtitle: '.NET-based reverse proxy',
    problem: 'Incoming requests needed a single, controlled entry point.',
    solution:
      'Built a .NET-based gateway repository that handles routing, token-bucket rate limiting, and TLS termination.',
    result: 'Routing, rate limiting, and TLS termination are centralized in one .NET gateway.',
    tech: ['.NET', 'Reverse Proxy', 'Rate Limiting', 'TLS'],
    metric: 'TLS',
    metricLabel: 'termination',
    showcase: {
      type: 'scene',
      scene: 'gateway',
      title: 'Gateway Traffic Flow',
      labels: ['Token-bucket rate limiting', 'TLS termination', 'Routing'],
    },
  },
  {
    id: 'observability',
    title: 'Observability',
    subtitle: 'Azure Application Insights',
    problem: 'Logs and application health needed to be monitored in one place.',
    solution: 'Configured Azure Application Insights for centralized logging and monitoring of application health.',
    result: 'Logs and application health are now visible in one place.',
    tech: ['Azure', 'Application Insights', 'Logging', 'Monitoring'],
    metric: 'Logs',
    metricLabel: 'centralized',
    showcase: {
      type: 'scene',
      scene: 'observe',
      title: 'Centralized Monitoring',
      labels: ['Application health', 'Centralized logging', 'Azure Application Insights'],
    },
  },
]

export const internship = {
  role: 'Game Developer Intern',
  company: 'AIO Synergy Sdn Bhd',
  period: 'Jun 2024 – Feb 2025',
  points: [
    'Built server-integrated game features in TypeScript, writing reusable, optimized code for game mechanics.',
    'Led backend integration for a Scratch Card game, implementing REST API calls for secure data handling, user progress tracking, and client-server communication through to a successful deployment.',
    'Collaborated in an Agile team using Git for version control, from debugging through testing and deployment.',
  ],
}

/* ─── Projects ───────────────────────────────────────────── */

export interface ArchNode {
  id: string
  label: string
  x: number
  y: number
}

export interface Project {
  id: string
  name: string
  tagline: string
  year: string
  tech: string[]
  summary: string
  details: string[]
  nodes: ArchNode[]
  edges: [string, string][]
}

// Node coordinates are in a 400 x 320 diagram space.
export const projects: Project[] = [
  {
    id: 'pet-appointment',
    name: 'Pet Appointment System',
    tagline: 'Full-Stack Cloud-Native Web App',
    year: '2025',
    tech: ['C#', '.NET', 'SQL Server', 'React', 'Azure', 'AWS'],
    summary:
      'A full-stack pet appointment management system built with Clean Architecture and CQRS, deployed to Azure and AWS.',
    details: [
      'Implemented secure authentication and authorization using JWT and OAuth 2.0 (Google).',
      'Applied CQRS via MediatR for clear separation of concerns and maintainable code.',
      'Designed optimized SQL Server schemas with triggers to enforce business rules.',
      'Wrote comprehensive unit tests.',
      'Automated appointment reminders using Quartz.NET scheduling with WhatsApp API integration.',
      'Deployed to Azure App Services and AWS EC2/CloudFront with DNS managed via Route 53.',
    ],
    nodes: [
      { id: 'web', label: 'React Frontend', x: 200, y: 34 },
      { id: 'api', label: '.NET Web API', x: 200, y: 104 },
      { id: 'cqrs', label: 'MediatR (CQRS)', x: 104, y: 178 },
      { id: 'orm', label: 'EF Core + Dapper', x: 296, y: 178 },
      { id: 'sql', label: 'SQL Server', x: 296, y: 254 },
      { id: 'quartz', label: 'Quartz.NET', x: 104, y: 254 },
      { id: 'wa', label: 'WhatsApp API', x: 200, y: 298 },
    ],
    edges: [
      ['web', 'api'],
      ['api', 'cqrs'],
      ['cqrs', 'orm'],
      ['orm', 'sql'],
      ['quartz', 'sql'],
      ['quartz', 'wa'],
    ],
  },
  {
    id: 'rag-chat',
    name: 'AI-Powered RAG Chat Demo',
    tagline: 'Retrieval-Augmented Generation',
    year: '2025',
    tech: ['.NET', 'Azure AI Services', 'RAG'],
    summary:
      'A .NET Web API implementing RAG using Azure AI services to answer queries contextually from a custom blog-post corpus.',
    details: [
      'Built a .NET Web API that processes user queries through Azure AI embeddings.',
      'Implemented retrieval-augmented generation to ground responses in a custom blog-post corpus.',
      'Used Azure AI chat orchestration to manage context and generate answers.',
    ],
    nodes: [
      { id: 'q', label: 'User Query', x: 200, y: 30 },
      { id: 'api', label: '.NET API', x: 200, y: 92 },
      { id: 'emb', label: 'Azure AI Embeddings', x: 104, y: 160 },
      { id: 'corpus', label: 'Blog-Post Corpus', x: 296, y: 160 },
      { id: 'chat', label: 'Chat Orchestration', x: 200, y: 228 },
      { id: 'res', label: 'Response', x: 200, y: 292 },
    ],
    edges: [
      ['q', 'api'],
      ['api', 'emb'],
      ['emb', 'corpus'],
      ['corpus', 'chat'],
      ['api', 'chat'],
      ['chat', 'res'],
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
      'Architected a scalable backend using Azure PlayFab for player data, authentication, and server-side logic.',
      'Integrated ThirdWeb smart contracts on Polygon, with secure server-side routines for NFT ownership verification and transactions.',
      'Used Photon Fusion for authoritative server networking with state synchronization.',
    ],
    nodes: [
      { id: 'unity', label: 'Unity Client', x: 150, y: 42 },
      { id: 'photon', label: 'Photon Fusion Server', x: 318, y: 42 },
      { id: 'playfab', label: 'Azure PlayFab', x: 110, y: 156 },
      { id: 'tw', label: 'ThirdWeb / Polygon', x: 290, y: 156 },
      { id: 'data', label: 'Player Data', x: 110, y: 270 },
      { id: 'nft', label: 'NFT Verification', x: 290, y: 270 },
    ],
    edges: [
      ['unity', 'photon'],
      ['unity', 'playfab'],
      ['playfab', 'tw'],
      ['playfab', 'data'],
      ['tw', 'nft'],
    ],
  },
]

/* ─── Skills & education ─────────────────────────────────── */

export const skillCategories: { name: string; skills: string[] }[] = [
  { name: 'Languages', skills: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'Java'] },
  { name: 'Backend', skills: ['.NET (Core/8+)', 'EF Core', 'MediatR (CQRS)', 'Dapper', 'REST APIs', 'Microservices', 'Quartz.NET'] },
  { name: 'Frontend', skills: ['React', 'Micro-frontends (MFE)', 'Module Federation', 'Tailwind CSS', 'Redux'] },
  { name: 'AI & Automation', skills: ['AI Agent Orchestration', 'Prompt Engineering', 'RAG', 'Multi-Agent Workflows'] },
  { name: 'Architecture & Security', skills: ['Clean Architecture', 'DDD', 'Result Pattern', 'ABAC', 'RBAC', 'JWT', 'OAuth 2.0'] },
  {
    name: 'Cloud & DevOps',
    skills: [
      'Azure App Services',
      'Azure Storage',
      'Azure Service Bus',
      'Azure Key Vault',
      'Application Insights',
      'AWS (EC2, CloudFront, Route 53)',
      'Docker',
      'Git',
      'Jira',
    ],
  },
]

export const marqueeWords = [
  '.NET',
  'React',
  'TypeScript',
  'Azure',
  'AI Agent Orchestration',
  'Clean Architecture',
  'DDD',
  'Micro-frontends',
  'RAG',
  'CQRS',
]

export const education = {
  degree: 'Bachelor of Computer Science (Graphics and Multimedia Software)',
  school: 'Universiti Teknologi Malaysia',
  period: 'Oct 2021 – Jul 2025',
  cgpa: '4.0',
  award: "Dean's List",
  awardDetail: 'All Semesters (1–8)',
  semesters: 8,
}
