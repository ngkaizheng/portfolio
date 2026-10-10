// Decides, every frame, how much of each particle shape should be showing.
//
// Page sections hand over to each other as they scroll in. Inside the
// experience track every panel names its own shape with data-scene, so the
// swarm can change shape from one case study to the next. Shapes that
// illustrate a single case (gateway, observe, talk) are pinned to the
// panel's [data-scene-anchor] frame, so they slide with the panel.

export const SHAPES = ['core', 'network', 'gateway', 'observe', 'talk', 'layers', 'galaxy', 'text'] as const
export type ShapeKey = (typeof SHAPES)[number]

export const ANCHORED: ReadonlySet<ShapeKey> = new Set(['gateway', 'observe', 'talk'])

// Frame position in normalized device coordinates, size as viewport fractions.
export interface Anchor {
  cx: number
  cy: number
  w: number
  h: number
}

export const scene = {
  weights: new Float32Array(SHAPES.length),
  anchors: new Map<ShapeKey, Anchor>(),
  // Viewport heights the contact section has scrolled past the top.
  tail: 0,
}

const SECTION_SHAPES: [string, ShapeKey][] = [
  ['projects', 'layers'],
  ['stack', 'galaxy'],
  ['contact', 'text'],
]

const index = (key: ShapeKey) => SHAPES.indexOf(key)
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)
const smooth = (v: number) => v * v * (3 - 2 * v)

function arrival(el: Element | null, vh: number) {
  if (!el) return 0
  return clamp01((vh * 0.85 - el.getBoundingClientRect().top) / (vh * 0.7))
}

let panels: HTMLElement[] = []

export function sampleScene() {
  const w = scene.weights
  w.fill(0)
  if (typeof document === 'undefined') {
    w[0] = 1
    return
  }
  const vw = window.innerWidth
  const vh = window.innerHeight

  const experience = document.getElementById('experience')
  const arrivals = SECTION_SHAPES.map(([id]) => arrival(document.getElementById(id), vh))
  const expArrival = arrival(experience, vh)

  w[index('core')] = 1 - expArrival
  const expShare = Math.max(expArrival - arrivals[0], 0)
  SECTION_SHAPES.forEach(([, key], i) => {
    w[index(key)] = Math.max(arrivals[i] - (arrivals[i + 1] ?? 0), 0)
  })

  const contact = document.getElementById('contact')
  scene.tail = contact ? Math.max(0, -contact.getBoundingClientRect().top) / vh : 0

  if (expShare <= 0) return

  if (panels.length === 0 && experience) {
    panels = Array.from(experience.querySelectorAll<HTMLElement>('[data-scene]'))
  }
  const horizontal = Boolean(experience?.querySelector('.is-horizontal'))
  const share = new Float32Array(SHAPES.length)
  let total = 0
  const best = new Map<ShapeKey, number>()

  for (const panel of panels) {
    const r = panel.getBoundingClientRect()
    const off = horizontal
      ? Math.abs(r.left + r.width / 2 - vw / 2) / (r.width * 0.75)
      : Math.abs(r.top + r.height / 2 - vh / 2) / (Math.max(r.height, vh) * 0.6)
    const c = smooth(clamp01(1 - off))
    if (c <= 0) continue
    const key = (panel.dataset.scene as ShapeKey) || 'network'
    share[index(key)] += c
    total += c

    if (ANCHORED.has(key) && c > (best.get(key) ?? 0)) {
      const frame = panel.querySelector('[data-scene-anchor]')
      if (frame) {
        const f = frame.getBoundingClientRect()
        best.set(key, c)
        scene.anchors.set(key, {
          cx: ((f.left + f.width / 2) / vw) * 2 - 1,
          cy: -(((f.top + f.height / 2) / vh) * 2 - 1),
          w: f.width / vw,
          h: f.height / vh,
        })
      }
    }
  }

  if (total < 1e-3) {
    w[index('network')] += expShare
    return
  }
  for (let i = 0; i < SHAPES.length; i++) w[i] += (expShare * share[i]) / total
}
