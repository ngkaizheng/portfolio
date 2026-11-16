import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, ShaderMaterial } from 'three'
import { flight, smoothstep } from './state.ts'

// Between acts, orbiting dust assembles into the title of the act ahead.
const WORDS = ['Experience', 'Projects', 'Skills', 'Contact']
const GAPS = [0.13, 0.4, 0.64, 0.87]
const COUNT = 7000

function sampleWord(word: string) {
  const out = new Float32Array(COUNT * 2)
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 200
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return out
  // Shrink the type until the word fits with margin (Syne is a wide face).
  let size = 150
  ctx.font = `800 ${size}px 'Syne Variable', Arial, sans-serif`
  while (size > 40 && ctx.measureText(word.toUpperCase()).width > 940) {
    size -= 6
    ctx.font = `800 ${size}px 'Syne Variable', Arial, sans-serif`
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(word.toUpperCase(), 512, 104)
  const { data } = ctx.getImageData(0, 0, 1024, 200)
  const filled: number[] = []
  for (let y = 0; y < 200; y += 2) {
    for (let x = 0; x < 1024; x += 2) {
      if (data[(y * 1024 + x) * 4 + 3] > 128) filled.push(x, y)
    }
  }
  const n = filled.length / 2
  if (!n) return out
  for (let i = 0; i < COUNT; i++) {
    const k = Math.floor(Math.random() * n) * 2
    out[i * 2] = (filled[k] + Math.random() * 2 - 512) / 512
    out[i * 2 + 1] = -(filled[k + 1] + Math.random() * 2 - 100) / 512
  }
  return out
}

function buildAttributes() {
  const seeds = new Float32Array(COUNT * 3)
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random()
  return { seeds, targets: WORDS.map(sampleWord) }
}

const vertex = /* glsl */ `
attribute vec2 aT0;
attribute vec2 aT1;
attribute vec2 aT2;
attribute vec2 aT3;
uniform float uForm;
uniform float uWord;
uniform float uTime;
uniform float uAspect;
uniform float uSize;
varying float vAlpha;
void main() {
  vec3 r = position;
  vec2 tgt = uWord < 0.5 ? aT0 : uWord < 1.5 ? aT1 : uWord < 2.5 ? aT2 : aT3;
  tgt *= min(0.86 * uAspect, 1.25);
  float ang = r.x * 6.2832 + uTime * (0.08 + 0.3 * r.y);
  vec2 orbit = vec2(cos(ang), sin(ang) * 0.42) * (0.5 + 1.8 * r.z);
  float f = clamp(uForm * 1.6 - r.y * 0.6, 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  vec2 pos = mix(orbit, tgt, f);
  gl_Position = vec4(pos.x / uAspect, pos.y, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 + r.z);
  vAlpha = uForm * (0.3 + 0.7 * f);
}
`

const fragment = /* glsl */ `
uniform float uFlip;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(mix(vec3(2.6, 1.7, 0.9), vec3(0.9, 1.7, 2.6), uFlip) * a, a);
}
`

export default function Particles() {
  const mat = useRef<ShaderMaterial>(null)
  const { seeds, targets } = useMemo(() => buildAttributes(), [])
  const args = useMemo(
    () => ({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uForm: { value: 0 },
        uWord: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uSize: { value: 2 },
        uFlip: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    [],
  )

  useFrame((state) => {
    const m = mat.current
    if (!m) return
    const p = flight.p
    let word = 0
    for (let i = 1; i < GAPS.length; i++) {
      if (Math.abs(p - GAPS[i]) < Math.abs(p - GAPS[word])) word = i
    }
    const u = m.uniforms
    u.uWord.value = word
    u.uForm.value = 1 - smoothstep(0.012, 0.05, Math.abs(p - GAPS[word]))
    u.uTime.value = state.clock.elapsedTime
    u.uAspect.value = state.size.width / state.size.height
    u.uSize.value = 2.2 * state.viewport.dpr
    u.uFlip.value = p > 0.9 ? 1 : 0
  })

  return (
    <points frustumCulled={false} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seeds, 3]} />
        <bufferAttribute attach="attributes-aT0" args={[targets[0], 2]} />
        <bufferAttribute attach="attributes-aT1" args={[targets[1], 2]} />
        <bufferAttribute attach="attributes-aT2" args={[targets[2], 2]} />
        <bufferAttribute attach="attributes-aT3" args={[targets[3], 2]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} args={[args]} />
    </points>
  )
}
