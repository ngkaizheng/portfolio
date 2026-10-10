// Every fact on the site lives here and is taken from the resume
// (public/resume/NgKaiZheng_Resume.pdf). Presentation hints such as
// diagram variants or edge lists only describe how a fact is drawn.

// BASE_URL keeps the canonical resume path correct under the GitHub Pages
// project subpath (/portfolio/) without hard-coding the deployment root.
export const resumeHref = `${import.meta.env.BASE_URL}resume/NgKaiZheng_Resume.pdf`

export const profile = {
  name: 'Ng Kai Zheng',
  nameLines: ['NG KAI', 'ZHENG'],
  role: 'Full-Stack Software Engineer',
  roles: ['Full-Stack Software Engineer', '.NET + React', 'AI Agent Orchestration'],
  tagline:
    '1 year building enterprise-scale systems on Azure. Modernized legacy platforms serving 7,000+ internal users and architected AI-driven workflow engines. Ready to relocate to Singapore.',
  location: 'Johor, Malaysia',
  relocation: 'Ready to relocate to Singapore',
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
  { value: 50, suffix: '%', decimals: 0, label: 'Faster delivery' },
  { value: 7, suffix: 'K+', decimals: 0, label: 'Users served' },
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

export interface CodeShowcase {
  type: 'code'
  title: string
  before: string
  after: string
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
  | CodeShowcase
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
  period: 'Nov 2025 - Present',
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ai-agent',
    title: 'AI Agent Orchestration',
    subtitle: 'Multi-agent workflow system',
    problem:
      'Team needed to handle complex, multi-step tasks using AI, but context window constraints made single-agent approaches unreliable for large codebases.',
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
      'Consistently completed complex system revamp modules in 1 week vs. the projected 2-week lead time — a 50% reduction in delivery timelines.',
    tech: ['.NET', 'React', 'AI-Assisted Development', 'Spec-Driven Workflow'],
    metric: '50%',
    metricLabel: 'faster delivery',
    showcase: {
      type: 'compare',
      variant: 'timeline',
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
      type: 'modules',
      title: 'Platform Modules Delivered',
      modules: [
        { name: 'Recruitment', scope: ['Job posting', 'Offer'] },
        { name: 'Onboarding', scope: ['Docs', 'IT Setup', 'Training'] },
        { name: 'OKR Management', scope: ['Goals', 'Tracking', 'Reviews'] },
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
    result:
      'Teams ship independently on their own release cadence. Zero cross-team deployment blocking. Zero downtime for unaffected modules.',
    tech: ['React', 'Module Federation', 'TypeScript'],
    metric: 'Zero',
    metricLabel: 'downtime',
    showcase: {
      type: 'compare',
      variant: 'split',
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
    result: 'Automated screening with match scores, red flag detection, and summaries that streamline the hiring pipeline.',
    tech: ['.NET', 'React', 'AI Integration', 'Workflow Engine'],
    metric: 'Auto',
    metricLabel: 'screening',
    showcase: {
      type: 'pipeline',
      title: 'AI Screening Pipeline',
      stages: ['Resume Input', 'AI Analysis', 'Match Score', 'Red Flags', 'Summary'],
      description: 'Every candidate gets a match score, red flag check, and summary',
    },
  },
  {
    id: 'api-gateway',
    title: 'API Gateway (Reverse Proxy)',
    subtitle: '.NET gateway in front of internal services',
    problem: 'Requests needed one controlled entry point for routing, rate limiting, and TLS.',
    solution:
      'Built a .NET-based gateway repository that handles routing, token-bucket rate limiting, and TLS termination.',
    result: 'A single gateway handles routing, rate limiting, and TLS termination for incoming traffic.',
    tech: ['.NET', 'Reverse Proxy', 'Rate Limiting', 'TLS'],
    metric: 'TLS',
    metricLabel: 'terminated at the edge',
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
    problem: 'Application health needed to be visible in one place.',
    solution: 'Configured Azure Application Insights for centralized logging and monitoring of application health.',
    result: 'Centralized logs and health monitoring in Azure Application Insights.',
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
  {
    id: 'domain-design',
    title: 'System Architecture & Design',
    subtitle: 'With the Customer Data Hub team',
    problem: 'Employee data needed a single source of truth across teams.',
    solution: 'Collaborated with the Customer Data Hub team to define domain boundaries and ERDs.',
    result: 'Established a single source of truth for employee data.',
    tech: ['Domain-Driven Design', 'ERD', 'System Design'],
    metric: 'ERD',
    metricLabel: 'domain boundaries',
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
    problem:
      'Role-based access was too coarse and scattered across frontend code. Permission logic was duplicated in UI checks and API endpoints, creating security gaps.',
    solution:
      'Implemented a comprehensive Attribute-Based Access Control (ABAC) system across React and .NET for fine-grained user permission management. The API returns a capabilities object declaring what actions the current user can perform on each resource.',
    result: 'Fine-grained user permission management across React and .NET. Frontend is a thin client with no permission logic.',
    tech: ['.NET', 'React', 'ABAC', 'JWT'],
    metric: 'ABAC',
    metricLabel: 'security model',
    showcase: {
      type: 'code',
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

export const internship = {
  role: 'Game Developer Intern',
  company: 'AIO Synergy Sdn Bhd',
  period: 'Jun 2024 - Feb 2025',
  points: [
    'Built server-integrated game features using TypeScript with reusable, optimized mechanics.',
    'Led backend integration for a Scratch Card game - REST API calls for secure data handling, user progress tracking, and client-server communication.',
    'Collaborated in an Agile team using Git across debugging, testing, and deployment.',
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
    nodes: [
      { id: 'q', label: 'User Query', x: 200, y: 30 },
      { id: 'api', label: '.NET API', x: 200, y: 92 },
      { id: 'emb', label: 'Azure AI Embeddings', x: 104, y: 160 },
      { id: 'corpus', label: 'Blog-post Corpus', x: 296, y: 160 },
      { id: 'chat', label: 'Chat Orchestration', x: 200, y: 228 },
      { id: 'res', label: 'Response', x: 200, y: 292 },
    ],
    edges: [
      ['q', 'api'],
      ['api', 'emb'],
      ['emb', 'corpus'],
      ['corpus', 'chat'],
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
      'Architected scalable backend using Azure PlayFab for player data, authentication, and server-side logic.',
      'Integrated ThirdWeb smart contracts on Polygon for NFT ownership verification and transactions.',
      'Utilized Photon Fusion for authoritative server networking with state synchronization.',
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
      ['unity', 'tw'],
      ['playfab', 'data'],
      ['tw', 'nft'],
    ],
  },
]

/* ─── Skills & education ─────────────────────────────────── */

export const skillCategories: { name: string; skills: string[] }[] = [
  { name: 'Languages', skills: ['C#', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'Java'] },
  { name: 'Backend', skills: ['.NET (Core/8+)', 'EF Core', 'MediatR (CQRS)', 'Dapper', 'REST APIs', 'Microservices'] },
  { name: 'Frontend', skills: ['React', 'Micro-frontends (MFE)', 'Module Federation', 'Tailwind CSS', 'Redux'] },
  { name: 'AI & Automation', skills: ['AI Agent Orchestration', 'Prompt Engineering', 'RAG', 'Multi-Agent Workflows'] },
  { name: 'Architecture', skills: ['Clean Architecture', 'DDD', 'ABAC', 'JWT / OAuth 2.0'] },
  { name: 'Cloud & DevOps', skills: ['Azure', 'AWS', 'Docker', 'Git'] },
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
  period: 'Oct 2021 - Jul 2025',
  cgpa: '4.0',
  award: "Dean's List",
  awardDetail: 'All Semesters (1-8)',
  semesters: 8,
}
