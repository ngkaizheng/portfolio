// Visitor counter backed by Abacus (abacus.jasoncameron.dev), a free,
// key-value hit counter with open CORS. GitHub Pages has no backend, so this
// is the only server-side state the site keeps: two integers, no cookies,
// no personal data. A visit counts once per browser session.

const API = 'https://abacus.jasoncameron.dev'
const NAMESPACE = 'ngkaizheng-portfolio'
const SESSION_FLAG = 'nkz-visit-counted'

export interface VisitCounts {
  today: number
  total: number
}

// "Today" follows the owner's clock (GMT+8), not the visitor's.
export function dayKey(now = new Date()) {
  const local = new Date(now.getTime() + 8 * 3600_000)
  return `day-${local.toISOString().slice(0, 10).replaceAll('-', '')}`
}

async function read(action: 'hit' | 'get', key: string) {
  const res = await fetch(`${API}/${action}/${NAMESPACE}/${key}`)
  // A day nobody has visited yet does not exist as a key.
  if (res.status === 404) return 0
  if (!res.ok) throw new Error(`counter ${res.status}`)
  const data = (await res.json()) as { value?: number }
  return data.value ?? 0
}

function alreadyCounted() {
  try {
    return sessionStorage.getItem(SESSION_FLAG) === '1'
  } catch {
    return false
  }
}

function markCounted() {
  try {
    sessionStorage.setItem(SESSION_FLAG, '1')
  } catch {
    // Storage blocked: worst case the visit counts again next page.
  }
}

let pending: Promise<VisitCounts | null> | null = null

// Counts this visit (once per session) and resolves with the current totals,
// or null when the counter is unreachable. Never throws.
export function recordVisit(): Promise<VisitCounts | null> {
  if (import.meta.env.MODE === 'test' || typeof fetch === 'undefined') return Promise.resolve(null)
  if (pending) return pending
  const action = alreadyCounted() ? 'get' : 'hit'
  pending = Promise.all([read(action, dayKey()), read(action, 'total')])
    .then(([today, total]) => {
      if (action === 'hit') markCounted()
      return { today, total }
    })
    .catch(() => null)
  return pending
}
