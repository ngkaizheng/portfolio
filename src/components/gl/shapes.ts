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
