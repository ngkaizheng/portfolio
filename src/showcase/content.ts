// Showcase copy. Every fact here mirrors the classic site (src/App.tsx) and the resume.
const base = import.meta.env.BASE_URL

export const identity = {
  name: 'Ng Kai Zheng',
  role: 'Full-Stack Software Engineer',
  stack: '.NET · React · AI Orchestration',
  location: 'Johor, Malaysia',
  email: 'kaizheng.tech@gmail.com',
  linkedIn: 'https://www.linkedin.com/in/kai-zheng-ng-tech',
  github: 'https://github.com/ngkaizheng',
  resumeHref: `${base}resume/NgKaiZheng_Resume.pdf`,
  classicHref: base,
}

export const experience = [
  {
    company: 'Etiqa Insurance and Takaful Sdn Bhd',
    role: '.NET Developer',
    period: 'Nov 2025 - Present',
    highlights: [
      ['Internal HRMS (Full SDLC)', 'Serving 7,000+ Maybank group users'],
      ['AI Agent Orchestration', 'Multi-agent workflow system'],
      ['Micro-frontend Migration', 'Module Federation architecture'],
      ['Dynamic Workflow Engine', 'Module-agnostic approval routing'],
      ['Granular Authorization', 'Attribute-Based Access Control'],
    ],
  },
  {
    company: 'AIO Synergy Sdn Bhd',
    role: 'Game Developer Intern',
    period: 'Jun 2024 - Feb 2025',
    highlights: [['Scratch Card game', 'Led backend integration over REST APIs']],
  },
]

export const projects = [
  {
    name: 'Pet Appointment System',
    tagline: 'Full-Stack Cloud-Native',
    tech: ['C#', '.NET', 'SQL Server', 'React', 'Azure', 'AWS'],
    details: [
      'Implemented secure authentication using JWT + OAuth 2.0 (Google) for flexible user access.',
      'Applied CQRS via MediatR for clear separation of concerns and maintainable code.',
      'Designed optimized SQL Server schemas with triggers to enforce business rules.',
      'Automated appointment reminders using Quartz.NET scheduling with WhatsApp API integration.',
      'Deployed to Azure App Services and AWS EC2/CloudFront with DNS managed via Route 53.',
    ],
    year: '2025',
    summary:
      'A full-stack pet appointment management system built with Clean Architecture, CQRS, and cloud-native deployment.',
  },
  {
    name: 'AI-Powered RAG Chat',
    tagline: 'Retrieval-Augmented Generation',
    tech: ['.NET', 'Azure AI Services', 'RAG'],
    details: [
      'Built a .NET Web API that processes user queries through Azure AI embeddings.',
      'Implemented retrieval-augmented generation to ground responses in a custom knowledge corpus.',
      'Chat orchestration handles context management and response generation.',
    ],
    year: '2025',
    summary:
      'A .NET Web API implementing RAG using Azure AI services to answer queries contextually from a custom blog-post corpus.',
  },
  {
    name: 'Blockchain Multiplayer Game',
    tagline: 'Final Year Project',
    tech: ['Unity', 'Azure PlayFab', 'ThirdWeb', 'Polygon', 'Photon Fusion'],
    details: [
      'Architected scalable backend using Azure PlayFab for player data, authentication, and server-side logic.',
      'Integrated ThirdWeb smart contracts on Polygon for NFT ownership verification and transactions.',
      'Utilized Photon Fusion for authoritative server networking with state synchronization.',
    ],
    year: '2025',
    summary:
      'A multiplayer game with blockchain-verified NFT ownership, authoritative server networking, and scalable backend services.',
  },
]

export const skills = ['.NET', 'React', 'TypeScript', 'C#', 'SQL', 'Azure', 'EF Core', 'MediatR (CQRS)', 'REST APIs', 'AI/ML', 'Architecture']

export const education = {
  degree: 'Bachelor of Computer Science (Graphics and Multimedia Software)',
  school: 'Universiti Teknologi Malaysia',
  cgpa: '4.0',
}
