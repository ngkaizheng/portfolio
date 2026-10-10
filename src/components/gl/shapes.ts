// Particle target layouts. Each generator returns `count` xyz triples; the
// vertex shader morphs between them as the page scrolls.
//   0 core     – breathing sphere (hero)
//   1 network  – orchestrator + agents linked by data streams (experience)
//   2 layers   – stacked architecture tiers with connectors (projects)
//   3 galaxy   – spiral of everything in the stack (skills)
//   4 text     – the word HELLO (contact)
// Network and layer points that sit on a link also carry (t along link, link id)
// so the shader can run packets along them.

type Vec3 = [number, number, number]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20251101)

function gaussian() {
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function unitVector(): Vec3 {
  const z = rand() * 2 - 1
  const a = rand() * Math.PI * 2
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(a), r * Math.sin(a), z]
}

function rotate(out: Float32Array, rx: number, ry: number, rz = 0) {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(rx), Math.sin(rx), Math.cos(ry), Math.sin(ry), Math.cos(rz), Math.sin(rz)]
  for (let i = 0; i < out.length; i += 3) {
    let x = out[i]
    let y = out[i + 1]
    let z = out[i + 2]
    ;[y, z] = [y * cx - z * sx, y * sx + z * cx]
    ;[x, z] = [x * cy + z * sy, -x * sy + z * cy]
    ;[x, y] = [x * cz - y * sz, x * sz + y * cz]
    out[i] = x
    out[i + 1] = y
    out[i + 2] = z
  }
}

export function randoms(count: number) {
  const out = new Float32Array(count)
  for (let i = 0; i < count; i++) out[i] = rand()
  return out
}

export function core(count: number) {
  const out = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const inner = rand() < 0.12
    let x: number
    let y: number
    let z: number
    if (inner) {
      ;[x, y, z] = unitVector()
      const r = 1.55 * Math.cbrt(rand()) * 0.9
      x *= r
      y *= r
      z *= r
    } else {
      y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const radius = 1.55 + gaussian() * 0.03
      x = Math.cos(theta) * r * radius
      z = Math.sin(theta) * r * radius
      y *= radius
    }
    out.set([x, y, z], i * 3)
  }
  return out
}

export function network(count: number) {
  const out = new Float32Array(count * 3)
  const edge = new Float32Array(count * 2)
  const hub: Vec3 = [0, 0, 0]
  const agents: Vec3[] = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 2
    return [Math.cos(a) * 2.25, Math.sin(a) * 1.35, Math.sin(a * 2) * 0.7]
  })
  const nodes = [hub, ...agents]
  const links: [Vec3, Vec3][] = []
  agents.forEach((a, i) => {
    links.push([hub, a])
    links.push([a, agents[(i + 1) % agents.length]])
  })

  for (let i = 0; i < count; i++) {
    if (rand() < 0.42) {
      const n = rand() < 0.3 ? 0 : 1 + Math.floor(rand() * agents.length)
      const radius = (n === 0 ? 0.48 : 0.28) * (0.7 + 0.3 * rand())
      const [ux, uy, uz] = unitVector()
      const c = nodes[n]
      out.set([c[0] + ux * radius, c[1] + uy * radius, c[2] + uz * radius], i * 3)
      edge.set([0, -1], i * 2)
    } else {
      const id = Math.floor(rand() * links.length)
      const [a, b] = links[id]
      const t = rand()
      const j = 0.02
      out.set(
        [
          a[0] + (b[0] - a[0]) * t + gaussian() * j,
          a[1] + (b[1] - a[1]) * t + gaussian() * j,
          a[2] + (b[2] - a[2]) * t + gaussian() * j,
        ],
        i * 3,
      )
      edge.set([t, id], i * 2)
    }
  }
  return { positions: out, edges: edge }
}

export function layers(count: number) {
  const out = new Float32Array(count * 3)
  const edge = new Float32Array(count * 2)
  const levels = [-1.15, 0, 1.15]
  const half = 1.35
  const lines = 7
  const pillars: [number, number][] = [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
    [0, 0],
  ]

  for (let i = 0; i < count; i++) {
    if (rand() < 0.8) {
      const y = levels[Math.floor(rand() * levels.length)]
      const fixed = -half + (Math.floor(rand() * lines) / (lines - 1)) * half * 2
      const along = -half + rand() * half * 2
      const [x, z] = rand() < 0.5 ? [fixed, along] : [along, fixed]
      out.set([x, y + gaussian() * 0.006, z], i * 3)
      edge.set([0, -1], i * 2)
    } else {
      const p = Math.floor(rand() * pillars.length)
      const span = Math.floor(rand() * 2)
      const t = rand()
      const y = levels[span] + (levels[span + 1] - levels[span]) * t
      const [x, z] = pillars[p]
      out.set([x + gaussian() * 0.012, y, z + gaussian() * 0.012], i * 3)
      edge.set([t, p * 2 + span], i * 2)
    }
  }
  rotate(out, 0.52, 0.72)
  return { positions: out, edges: edge }
}

export function galaxy(count: number) {
  const out = new Float32Array(count * 3)
  const arms = 3
  const maxR = 2.6
  for (let i = 0; i < count; i++) {
    if (rand() < 0.14) {
      const [x, y, z] = unitVector()
      const r = Math.pow(rand(), 2) * 0.45
      out.set([x * r, y * r * 0.6, z * r], i * 3)
      continue
    }
    const r = Math.pow(rand(), 0.6) * maxR
    const arm = Math.floor(rand() * arms)
    const spread = gaussian() * 0.32 * (1 - r / (maxR * 1.4))
    const angle = (arm / arms) * Math.PI * 2 + r * 1.9 + spread
    const thickness = gaussian() * 0.06 * (1.4 - r / maxR)
    out.set([Math.cos(angle) * r, thickness, Math.sin(angle) * r], i * 3)
  }
  rotate(out, 1.08, 0, 0.32)
  return out
}

export function text(count: number, word: string, fontFamily: string) {
  const width = 1400
  const height = 360
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return core(count)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `800 260px ${fontFamily}`
  ctx.fillText(word, width / 2, height / 2)
  const data = ctx.getImageData(0, 0, width, height).data
  const samples: number[] = []
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      if (data[(y * width + x) * 4 + 3] > 128) samples.push(x, y)
    }
  }
  if (samples.length === 0) return core(count)

  let minX = width
  let maxX = 0
  for (let i = 0; i < samples.length; i += 2) {
    minX = Math.min(minX, samples[i])
    maxX = Math.max(maxX, samples[i])
  }
  const scale = 5.4 / Math.max(maxX - minX, 1)
  const cx = (minX + maxX) / 2
  const out = new Float32Array(count * 3)
  const pairs = samples.length / 2
  for (let i = 0; i < count; i++) {
    const s = Math.floor(rand() * pairs) * 2
    out.set(
      [
        (samples[s] - cx + rand() * 3) * scale,
        -(samples[s + 1] - height / 2 + rand() * 3) * scale + 0.55,
        gaussian() * 0.08,
      ],
      i * 3,
    )
  }
  return out
}

// Procedural shapes: the shader computes positions from these parameters
// every frame (they flow), so only (u, lane, kind) is stored per particle.

// API gateway: chaotic inbound traffic funnels through a TLS ring, a token
// bucket drips permits into it, and requests leave on three routes: a
// burst while the bucket is full, then spaced at the refill rate.
//   kind 0 ring, 1 inbound, 2 routed packets, 3 route targets, 4 token bucket
export function gatewayParams(count: number) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = rand()
    let kind: number
    let lane = 0
    if (r < 0.2) {
      kind = 0
      lane = rand() < 0.6 ? 0 : 1
    } else if (r < 0.52) {
      kind = 1
    } else if (r < 0.8) {
      kind = 2
      lane = Math.floor(rand() * 3)
    } else if (r < 0.88) {
      kind = 3
      lane = Math.floor(rand() * 3)
    } else {
      kind = 4
      const b = rand()
      lane = b < 0.4 ? 0 : b < 0.85 ? 1 : 2
    }
    out.set([rand(), lane, kind], i * 3)
  }
  return out
}

// Observability: a radar scope sweeping over the app, log streams flowing
// in from both sides (centralized logging) and a heartbeat trace above.
//   kind 0 rings, 1 spokes + sweep beam, 2 blips, 3 heartbeat, 4 log streams
export function scopeParams(count: number) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = rand()
    let kind: number
    let lane = 0
    if (r < 0.32) {
      kind = 0
      lane = Math.floor(rand() * 3)
    } else if (r < 0.42) {
      kind = 1
      lane = rand() < 0.45 ? 4 : Math.floor(rand() * 4)
    } else if (r < 0.48) {
      kind = 2
      lane = rand()
    } else if (r < 0.76) {
      kind = 3
    } else {
      kind = 4
      lane = Math.floor(rand() * 6) + (rand() < 0.5 ? 0 : 6)
    }
    out.set([rand(), lane, kind], i * 3)
  }
  return out
}

// Two people seated across a table, talking over a shared ERD.
// Link ids: 0/1 conversation arc (both directions), 2-4 ERD relations.
export function talk(count: number) {
  const out = new Float32Array(count * 3)
  const edge = new Float32Array(count * 2)

  type Part =
    | { kind: 'capsule'; a: Vec3; b: Vec3; r: number; weight: number }
    | { kind: 'sphere'; c: Vec3; r: number; weight: number }
    | { kind: 'line'; a: Vec3; b: Vec3; weight: number; link?: number }
    | { kind: 'plane'; min: Vec3; max: Vec3; weight: number }
    | { kind: 'arc'; a: Vec3; b: Vec3; lift: number; weight: number; link: number }

  // One seated person facing +x; mirrored for the other side.
  const person = (gesture: boolean): Part[] => {
    const parts: Part[] = []
    const z = 0.3
    // chair
    for (const s of [-1, 1]) {
      parts.push({ kind: 'line', a: [-2.05, -0.55, s * z], b: [-1.35, -0.55, s * z], weight: 0.6 })
      parts.push({ kind: 'line', a: [-2.05, -0.55, s * z], b: [-2.14, 0.45, s * z], weight: 0.7 })
      parts.push({ kind: 'line', a: [-2.05, -0.55, s * z], b: [-2.05, -1.5, s * z], weight: 0.6 })
      parts.push({ kind: 'line', a: [-1.35, -0.55, s * z], b: [-1.35, -1.5, s * z], weight: 0.6 })
    }
    parts.push({ kind: 'line', a: [-2.14, 0.45, -z], b: [-2.14, 0.45, z], weight: 0.4 })
    parts.push({ kind: 'line', a: [-1.35, -0.55, -z], b: [-1.35, -0.55, z], weight: 0.4 })
    // body
    parts.push({ kind: 'capsule', a: [-1.78, -0.38, 0], b: [-1.6, 0.5, 0], r: 0.22, weight: 5 })
    parts.push({ kind: 'sphere', c: [-1.48, 0.93, 0], r: 0.25, weight: 3.4 })
    for (const s of [-1, 1]) {
      parts.push({ kind: 'capsule', a: [-1.75, -0.42, s * 0.11], b: [-1.07, -0.42, s * 0.11], r: 0.11, weight: 1.6 })
      parts.push({ kind: 'capsule', a: [-1.07, -0.42, s * 0.11], b: [-1.1, -1.42, s * 0.11], r: 0.085, weight: 1.4 })
      parts.push({ kind: 'capsule', a: [-1.1, -1.45, s * 0.11], b: [-0.86, -1.48, s * 0.11], r: 0.05, weight: 0.4 })
      parts.push({ kind: 'capsule', a: [-1.6, 0.42, s * 0.25], b: [-1.42, -0.02, s * 0.27], r: 0.075, weight: 0.9 })
    }
    // forearms: one resting on the table, one gesturing
    parts.push({ kind: 'capsule', a: [-1.42, -0.02, -0.27], b: [-0.95, 0.03, -0.16], r: 0.065, weight: 0.8 })
    parts.push({
      kind: 'capsule',
      a: [-1.42, -0.02, 0.27],
      b: gesture ? [-1.02, 0.38, 0.2] : [-0.92, 0.05, 0.18],
      r: 0.065,
      weight: 0.8,
    })
    return parts
  }

  const mirror = (parts: Part[]): Part[] =>
    parts.map((p) => {
      const m = (v: Vec3): Vec3 => [-v[0], v[1], v[2]]
      if (p.kind === 'sphere') return { ...p, c: m(p.c) }
      if (p.kind === 'plane') return p
      return { ...p, a: m(p.a), b: m(p.b) }
    })

  const box = (cx: number, cy: number): Part[] => {
    const [w, h] = [0.24, 0.15]
    const c: Vec3[] = [
      [cx - w, cy - h, 0],
      [cx + w, cy - h, 0],
      [cx + w, cy + h, 0],
      [cx - w, cy + h, 0],
    ]
    return c.map((a, i) => ({ kind: 'line', a, b: c[(i + 1) % 4], weight: 0.35 }))
  }
  const erd: [number, number][] = [
    [-0.5, 0.62],
    [0.5, 0.62],
    [0, 1.22],
  ]

  const parts: Part[] = [
    ...person(false),
    ...mirror(person(true)),
    // table
    { kind: 'plane', min: [-0.75, 0, -0.45], max: [0.75, 0, 0.45], weight: 2.4 },
    { kind: 'capsule', a: [0, 0, 0], b: [0, -1.42, 0], r: 0.05, weight: 0.8 },
    { kind: 'plane', min: [-0.32, -1.48, -0.32], max: [0.32, -1.48, 0.32], weight: 0.5 },
    // shared ERD: three entities and their relations
    ...erd.flatMap(([x, y]) => box(x, y)),
    { kind: 'line', a: [-0.26, 0.62, 0], b: [0.26, 0.62, 0], weight: 0.4, link: 2 },
    { kind: 'line', a: [-0.4, 0.77, 0], b: [-0.12, 1.07, 0], weight: 0.4, link: 3 },
    { kind: 'line', a: [0.4, 0.77, 0], b: [0.12, 1.07, 0], weight: 0.4, link: 4 },
    // conversation
    { kind: 'arc', a: [-1.3, 1.18, 0], b: [1.3, 1.18, 0], lift: 0.75, weight: 1.4, link: 0 },
    { kind: 'arc', a: [1.3, 1.18, 0], b: [-1.3, 1.18, 0], lift: 0.75, weight: 1.4, link: 1 },
  ]

  const totalWeight = parts.reduce((s, p) => s + p.weight, 0)
  const cumulative: number[] = []
  parts.reduce((s, p) => {
    cumulative.push(s + p.weight)
    return s + p.weight
  }, 0)

  for (let i = 0; i < count; i++) {
    const pick = rand() * totalWeight
    const part = parts[cumulative.findIndex((c) => c >= pick)] ?? parts[0]
    let p: Vec3
    let link = -1
    let t = 0
    if (part.kind === 'sphere') {
      const [ux, uy, uz] = unitVector()
      p = [part.c[0] + ux * part.r, part.c[1] + uy * part.r, part.c[2] + uz * part.r]
    } else if (part.kind === 'capsule') {
      const [ux, uy, uz] = unitVector()
      t = rand()
      p = [
        part.a[0] + (part.b[0] - part.a[0]) * t + ux * part.r,
        part.a[1] + (part.b[1] - part.a[1]) * t + uy * part.r,
        part.a[2] + (part.b[2] - part.a[2]) * t + uz * part.r,
      ]
    } else if (part.kind === 'plane') {
      p = [
        part.min[0] + (part.max[0] - part.min[0]) * rand(),
        part.min[1] + gaussian() * 0.01,
        part.min[2] + (part.max[2] - part.min[2]) * rand(),
      ]
    } else if (part.kind === 'arc') {
      t = rand()
      link = part.link
      p = [
        part.a[0] + (part.b[0] - part.a[0]) * t + gaussian() * 0.012,
        part.a[1] + (part.b[1] - part.a[1]) * t + Math.sin(Math.PI * t) * part.lift + gaussian() * 0.012,
        gaussian() * 0.012,
      ]
    } else {
      t = rand()
      link = part.link ?? -1
      p = [
        part.a[0] + (part.b[0] - part.a[0]) * t + gaussian() * 0.008,
        part.a[1] + (part.b[1] - part.a[1]) * t + gaussian() * 0.008,
        part.a[2] + (part.b[2] - part.a[2]) * t + gaussian() * 0.008,
      ]
    }
    out.set([p[0], p[1] - 0.15, p[2]], i * 3)
    edge.set([link < 0 ? 0 : t, link], i * 2)
  }
  return { positions: out, edges: edge }
}
