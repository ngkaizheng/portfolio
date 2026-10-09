# Ng Kai Zheng — Portfolio

Experimental, WebGL-driven portfolio built with React + TypeScript + Vite. Deployed to GitHub Pages at [ngkaizheng.github.io/portfolio](https://ngkaizheng.github.io/portfolio/).

## Concept

One full-screen particle system (custom GLSL, ~22k points) sits behind the whole page and morphs as you scroll, each shape tied to the section on screen:

| Section | Swarm shape | Meaning |
|---|---|---|
| Hero | Breathing sphere | The core |
| Experience | Hub + 5 agents linked by streams, packets running along the links | Multi-agent orchestration |
| Projects | Three stacked tiers with pillar connectors | Layered architecture |
| Stack | Rotating spiral galaxy | Everything in the toolbox |
| Contact | The word HELLO | Say hi |

The pointer pushes particles away, scroll speed adds RGB split (post-processing), and every case study has its own animated architecture diagram.

## Content Source

- Every fact on the site lives in `src/data/content.ts` and comes from the resume. Do not add claims that are not in the resume.
- Canonical public resume path: `/portfolio/resume/NgKaiZheng_Resume.pdf` (built as `${import.meta.env.BASE_URL}resume/NgKaiZheng_Resume.pdf`, defined in `src/data/content.ts`)
- Public resume file location: `public/resume/NgKaiZheng_Resume.pdf`

To refresh the resume: replace the PDF at the same path, then update `src/data/content.ts` to match it.

## Structure

```
src/
  data/content.ts          all copy, metrics, projects, skills (resume-derived)
  lib/
    scroll.ts              Lenis smooth scroll + GSAP ScrollTrigger + shared scroll state
    pointer.ts             window-level pointer state for the WebGL layer
    env.ts                 reduced-motion / pointer / WebGL / low-power probes
    hooks.ts               in-view, reveal, local time, magnetic buttons
  components/
    gl/                    World (Canvas), Swarm (points + shader), shapes, shaders, Effects
    Preloader, Cursor, Nav, Hero, Experience (pinned horizontal track),
    Diagrams (architecture animations + project blueprints), Sections, ui
```

## Sections

- **Hero** — Liquid-weight name (letters thin out near the pointer), scrambling role, animated stats, resume CTA
- **Experience** — Pinned horizontal scroll through 7 Etiqa case files (problem / solution / result) + AIO Synergy internship. Each case has an animated diagram: agent pipeline, delivery timeline, routing patterns, delivered modules, monolith vs micro-frontends, screening pipeline, capabilities code diff
- **Projects** — Pet Appointment, RAG Chat, Blockchain Multiplayer Game, each with an animated blueprint (packets flow along the architecture links, 3D tilt on hover)
- **Stack** — Category index rows with a hover wipe
- **Education** — UTM, CGPA 4.0 fill, Dean's List across all 8 semesters
- **Contact** — Email (copy button), phone, location, GitHub, LinkedIn, resume download

## Accessibility & Fallbacks

- `prefers-reduced-motion`: no smooth scroll, no horizontal pin (cases stack vertically), CSS animations off, swarm barely drifts
- No WebGL (or a WebGL error): animated CSS gradient fallback; content is unaffected
- Small or low-core devices: fewer particles, capped DPR, no post-processing
- Custom cursor only for fine pointers; every section is real HTML with headings, so screen readers and search engines read the same content

## Scripts

- `npm run dev`: start local dev server
- `npm run test`: run Vitest tests
- `npm run lint`: run ESLint
- `npm run build`: type-check and create production build
- `npm run preview`: preview production build locally

## GitHub Pages

- Deployment workflow: `.github/workflows/pages.yml` (builds `dist/` on push to `main`, deploys via `actions/deploy-pages`)
- Live URL: `https://ngkaizheng.github.io/portfolio/` (project page, **not** a custom domain)
- `vite.config.ts` sets `base: '/portfolio/'` so built asset URLs resolve under the repo subpath. Changing the hosting path means changing that one value; the resume link follows it automatically via `import.meta.env.BASE_URL`.
- No `public/CNAME` file exists on purpose: a CNAME would re-bind the Pages site to a custom domain and redirect the `github.io/portfolio/` URL away.
- If HTTPS/custom domain is added later, add `public/CNAME` back **and** set `base` to `'/'`.

## Tech Stack

- React 19, TypeScript 6, Vite 6
- three.js + React Three Fiber, custom GLSL shaders, `@react-three/postprocessing` (bloom, chromatic aberration, vignette)
- GSAP + ScrollTrigger, Lenis
- Self-hosted fonts via Fontsource: Syne, Inter, JetBrains Mono
