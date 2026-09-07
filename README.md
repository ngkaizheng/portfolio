# Ng Kai Zheng — Portfolio

Portfolio site built with React + TypeScript + Vite. Deployed to GitHub Pages at [ngkaizheng.online](https://ngkaizheng.online).

## Content Source

- Portfolio copy is based on the resume provided in this repository.
- Canonical public resume link: `/resume/NgKaiZheng_Resume.pdf`
- Public resume file location: `public/resume/NgKaiZheng_Resume.pdf`

## Sections

- **Hero** — Identity, tagline, animated stats (productivity, delivery, auditability, CGPA)
- **Experience** — Deep-dive cards at Etiqa (problem/solution/result narrative for AI orchestration, workflow engine, MFE migration, ABAC, AI recruitment) + AIO Synergy internship
- **Projects** — Expandable cards with architecture diagrams (Pet Appointment, RAG Chat, Blockchain Multiplayer)
- **Skills** — Categorized tags (Languages, Backend, Frontend, AI, Architecture, Cloud)
- **Education** — UTM Bachelor of Computer Science, CGPA 4.0, Dean's List
- **Contact** — Email, phone, location, GitHub, resume download

## Design Notes

- Content-first, single-column layout
- Dark background (#0f1115) with high-contrast text
- Grid dot background in hero for subtle visual texture
- Animated counter stats on hero
- Reveal-on-scroll via IntersectionObserver
- Expandable deep-dive cards with Problem → Solution → Result narrative
- SVG architecture diagrams for each project
- No external animation libraries (no Framer Motion)

## Scripts

- `npm run dev`: start local dev server
- `npm run test`: run Vitest tests
- `npm run build`: create production build
- `npm run preview`: preview production build locally

## GitHub Pages

- Deployment workflow: `.github/workflows/pages.yml`
- Custom domain: `ngkaizheng.online` (from `public/CNAME`)
- Root-relative links are used for public assets.

## Tech Stack

- React 19, TypeScript 6, Vite 8
