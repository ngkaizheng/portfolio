# AGENTS.md — Portfolio (v2: Experimental 3D Redesign)

> Governance baseline for agents working on this repo. v1 (resume content update) is done; v2 replaces the whole visual design with an experimental WebGL site. Design details live in `README.md`.

---

## 1. Role & Context

Personal portfolio for Ng Kai Zheng (React + TypeScript + Vite, GitHub Pages project page). Audience: hiring managers for software engineering roles in Singapore. The site must impress in the first seconds **and** stay scannable: name, role, key metrics and resume download within 30 seconds.

**Direction (owner-approved):** experimental / Awwwards-style, pure 3D + architecture animations, no video. Full redesign allowed.

---

## 2. Scope

### In Scope

- Anything under `src/` (components, WebGL layer, styles, tests)
- `index.html`, `package.json` / `package-lock.json` (dependencies), `vite.config.ts`
- `public/resume/NgKaiZheng_Resume.pdf`
- `README.md`, `AGENTS.md`

### Out of Scope (ask first)

- Backend services, analytics, trackers, third-party embeds
- Video assets (owner chose pure 3D)
- Changing hosting (custom domain, `base` path) or the Pages workflow

---

## 3. Requirements

### R1 — Resume-Faithful Content

All copy lives in `src/data/content.ts` and reflects **only** facts from the resume (`public/resume/NgKaiZheng_Resume.pdf`). No invented claims, metrics, skill-level percentages or filler. Diagram labels may only name things the resume already names.

### R2 — Canonical Resume Download Path

Every resume CTA uses `resumeHref` from `src/data/content.ts`:

```
${import.meta.env.BASE_URL}resume/NgKaiZheng_Resume.pdf   →   /portfolio/resume/NgKaiZheng_Resume.pdf
```

Links carry the `download` attribute. Never hard-code another path.

### R3 — Build, Tests & Pages Compatibility

- `npm run lint`, `npm run test`, `npm run build` all exit 0
- `dist/resume/NgKaiZheng_Resume.pdf` exists after build
- Asset URLs respect `base: '/portfolio/'`

### R4 — Performance & Accessibility Guardrails

- Content is real HTML rendered immediately; the WebGL bundle is lazy-loaded and never blocks reading
- `prefers-reduced-motion` disables smooth scroll, the horizontal pin and CSS animation loops
- No WebGL / WebGL error → CSS fallback; low-power devices get fewer particles and no post-processing
- Semantic headings per section; decorative layers are `aria-hidden`
- Mobile (≥ 320px) and desktop layouts have no horizontal overflow

---

## 4. Boundaries (What NOT To Do)

1. **Do not** introduce non-resume claims or invented facts.
2. **Do not** hard-code the resume path or drop the `download` attribute.
3. **Do not** block content behind the preloader or WebGL loading.
4. **Do not** load fonts or scripts from third-party CDNs at runtime (fonts are self-hosted via Fontsource).
5. **Do not** push to `main` directly; redesign work happens on a feature branch.

---

## 5. Definition Of Done

- [ ] Copy matches the resume (cross-checked against `src/data/content.ts`)
- [ ] All resume CTAs use `resumeHref` with `download`
- [ ] `npm run lint`, `npm run test`, `npm run build` exit 0
- [ ] Desktop (1440×900) and mobile (390×844) screenshots reviewed: no overflow, text readable over the particle layer
- [ ] Reduced-motion and no-WebGL paths still render all content
- [ ] `README.md` reflects the current design and structure

---

## 6. Error Codes

| Code | Meaning |
|---|---|
| `ERR_RESUME_LINK_001` | Resume CTA does not use `resumeHref` / canonical path |
| `ERR_BUILD_001` | Lint, test or build failed, or Pages path compatibility could not be confirmed |
| `ERR_CONTENT_001` | Copy contains a claim not found in the resume |

---

*Last updated: 2026-10-09 | Status: v2 redesign in review | Version: 2.0.0*

<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
<!-- caveman-end -->
