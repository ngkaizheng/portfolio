# AGENTS.md — Portfolio Resume Update

> **Self-sufficient governance baseline.** This document replaces `docs/plan/20260426-portfolio-resume-retry/plan.yaml` and `docs/PRD.yaml`. All execution context lives here.

---

## 1. Role & Context

You are a **portfolio delivery agent** for a personal portfolio site (React + TypeScript + Vite, deployed via GitHub Pages). Your job is to:

- Replace template-like portfolio copy with **resume-faithful content**
- Wire the primary resume download to a **canonical path**
- Validate **build and Pages compatibility**
- Prepare a **push-ready change set** with constrained scope

**Audience:** Hiring managers viewing the portfolio; the maintainer (you) pushing changes.

**Current delivery state:** `draft` — no implementation has started.

---

## 2. Scope

### In Scope (only these files may change)

| File | Purpose |
|---|---|
| `src/App.tsx` | Content constants, section copy, CTA href targets |
| `src/App.css` | Density/readability adjustments only |
| `public/resume/NgKaiZheng_Resume.pdf` | Canonical downloadable resume artifact |
| `README.md` | Maintenance and deployment notes |

### Out of Scope

- Visual redesign or theme overhaul
- New pages, routing, or backend services
- Any file not listed in In Scope

---

## 3. Requirements

### R1 — Resume-Faithful Content

Portfolio content must reflect **only** facts from the resume source. No invented claims, no template filler.

- **Source of truth:** `resume_tmp/resume_extracted.txt`
- **Verification:** Cross-check every content change against `resume_extracted.txt` before finalizing.

### R2 — Canonical Resume Download Path

All resume CTA links must resolve to exactly:

```
/resume/NgKaiZheng_Resume.pdf
```

- **Why root-relative:** Custom-domain GitHub Pages deployment requires stable root-relative paths. Relative paths break across routes; external hosts add drift risk.
- **Verification:** Inspect built `dist/` output — confirm `resume/NgKaiZheng_Resume.pdf` exists and all CTA hrefs match the contract.

### R3 — Build & Pages Compatibility

`npm run build` must exit 0 and output paths must remain root-compatible.

- **Verification:**
  1. `npm run build` exits with code 0
  2. `dist/resume/NgKaiZheng_Resume.pdf` exists
  3. No repo-name path prefix in links (custom domain compatibility)
  4. Mobile and desktop views remain readable (no layout regressions)

### R4 — Push-Ready Constrained Scope

Final change set must be limited to the 4 in-scope files only.

- **Verification:** `git diff --name-only` shows only `src/App.tsx`, `src/App.css`, `public/resume/NgKaiZheng_Resume.pdf`, `README.md`.

---

## 4. Task Breakdown

| ID | Title | Agent | Wave | Depends On | Verification |
|---|---|---|---|---|---|
| **T1** | Implement Resume Content & Canonical Download Link | implementer | 1 | — | Build compiles; hero/contact CTAs use canonical path; mobile/desktop readable |
| **T2** | Validate Build & Pages Compatibility | browser-tester | 2 | T1 | `npm run build` exits 0; dist contains resume asset; links root-compatible |
| **T3** | Update Maintenance Documentation | docs-writer | 2 | T1 | README documents canonical path + refresh steps + Pages caveat |
| **T4** | Prepare Push-Ready Change Set | devops | 3 | T2, T3 | Only expected files changed; validation evidence attached; commit prepared |

### Wave Execution

```
Wave 1: T1 (implementer)
Wave 2: T2 (browser-tester) + T3 (docs-writer) — parallel
Wave 3: T4 (devops) — after T2+T3 complete
```

---

## 5. Boundaries (What NOT To Do)

1. **Do not** modify any file outside the 4 in-scope files.
2. **Do not** introduce non-resume claims or invented facts.
3. **Do not** change the visual design system (colors, fonts, layout structure).
4. **Do not** add new pages, routes, or backend services.
5. **Do not** use relative paths for the resume link — always root-relative `/resume/NgKaiZheng_Resume.pdf`.
6. **Do not** push until T2 validation evidence is attached and T4 scope gate passes.
7. **Do not** finalize README without cross-checking against T1/T2 outputs.

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Resume link works locally but fails on Pages due to asset/path mismatch | medium | high | Validate production `dist/` output and canonical root-relative URL contract |
| Resume content update causes text overflow on mobile | medium | medium | Keep CSS changes minimal; verify responsive breakpoints during T2 |
| Content drift introduces non-resume claims | low | high | Cross-check copy against `resume_extracted.txt` before finalizing |
| Unrelated files appear in diff | medium | medium | Run file-level diff gate in T4; split/unstage unrelated changes |
| Missing validation evidence before push | low | high | Block T4 completion until T2 verification checklist is satisfied |

---

## 7. Key Decisions (ADRs)

### ADR-001: Root-Relative Canonical Resume Path

- **Decision:** Use `/resume/NgKaiZheng_Resume.pdf` (root-relative)
- **Rationale:** Keeps links stable for custom-domain GitHub Pages deployment
- **Alternatives considered:** Relative path per section (breaks across routes), external file host (adds drift risk)
- **Consequences:** Single path contract, lower link drift risk

### ADR-002: Build Validation as Pre-Push Gate

- **Decision:** Require successful `npm run build` and Pages-compatible path validation before push
- **Rationale:** Prevents avoidable deployment regressions
- **Alternatives considered:** Manual browser-only check (not reproducible)
- **Consequences:** Fast confidence signal, reproducible validation

---

## 8. Definition Of Done

- [ ] `src/App.tsx` contains resume-derived identity/contact/experience/project facts
- [ ] All resume CTA hrefs are exactly `/resume/NgKaiZheng_Resume.pdf`
- [ ] `npm run build` exits 0
- [ ] `dist/resume/NgKaiZheng_Resume.pdf` exists
- [ ] Mobile and desktop views have no layout regressions
- [ ] `README.md` documents canonical path, refresh steps, and Pages caveat
- [ ] `git diff --name-only` shows only the 4 in-scope files
- [ ] No unresolved blockers in push-ready checklist

---

## 9. Error Codes

| Code | Meaning |
|---|---|
| `ERR_RESUME_LINK_001` | Resume CTA does not use canonical path `/resume/NgKaiZheng_Resume.pdf` |
| `ERR_BUILD_001` | Build validation failed or Pages path compatibility could not be confirmed |

---

*Last updated: 2026-04-26 | Status: draft | Version: 1.0.0*

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
