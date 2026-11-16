import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { HalfFloatType, ShaderMaterial, Vector2, Vector3 } from 'three'
import { fragment, vertex } from './shader.ts'
import { flight, smoothstep } from './state.ts'
import Particles from './Particles.tsx'

const mix = (a: number, b: number, t: number) => a + (b - a) * t

function BlackHole({ lowPower }: { lowPower: boolean }) {
  const mat = useRef<ShaderMaterial>(null)
  const args = useMemo(
    () => ({
      vertexShader: vertex,
      fragmentShader: fragment,
      defines: { STEPS: lowPower ? 90 : 170, STEP_SCALE: lowPower ? '1.8' : '1.0' },
      uniforms: {
        uRes: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uCam: { value: new Vector3(0, 1.1, -11) },
        uLook: { value: new Vector3() },
        uShift: { value: new Vector2() },
        uFlash: { value: 0 },
        uFlip: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    }),
    [lowPower],
  )

  useFrame((state) => {
    const m = mat.current
    if (!m) return
    const u = m.uniforms
    const t = state.clock.elapsedTime
    const p = flight.p
    ;(u.uRes.value as Vector2).set(state.size.width, state.size.height)
    u.uTime.value = t

    // Flight path: spiral inward, flash through the singularity, emerge above a blue disk.
    const through = p > 0.9
    const fall = smoothstep(0, 0.88, p)
    let radius = mix(11, 3.3, fall * fall * (3 - 2 * fall))
    let elev = 0.1 + 0.3 * Math.sin(p * 7) * smoothstep(0.05, 0.3, p) + 0.12 * fall
    let look = smoothstep(0.2, 0.8, p) * 4.2
    if (through) {
      radius = mix(15, 8.5, smoothstep(0.9, 1, p))
      elev = 1.05
      look = 0
    }
    const az = -Math.PI / 2 - p * 5.5 + t * 0.015 + flight.px * 0.12
    elev += flight.py * 0.06
    const cam = u.uCam.value as Vector3
    cam.set(radius * Math.cos(elev) * Math.cos(az), radius * Math.sin(elev), radius * Math.cos(elev) * Math.sin(az))
    // Near the hole, look along the orbit so the disk streams past instead of staring into black.
    ;(u.uLook.value as Vector3).set(-Math.sin(az) * look, 0, Math.cos(az) * look)

    const portrait = state.size.width < state.size.height
    const hero = 1 - smoothstep(0, 0.15, p)
    ;(u.uShift.value as Vector2).set(portrait ? 0 : 0.28 * hero, portrait ? 0.42 * hero : 0)
    u.uFlash.value = Math.exp(-(((p - 0.9) / 0.022) ** 2))
    u.uFlip.value = through ? 1 : 0
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} args={[args]} />
    </mesh>
  )
}

// Lowers render resolution while the average frame stays slower than ~45 fps.
function AdaptiveResolution({ onDecline }: { onDecline: () => void }) {
  const acc = useRef({ time: 0, frames: 0, cooldown: 1 })
  useFrame((_, delta) => {
    const a = acc.current
    if (a.cooldown > 0) {
      a.cooldown -= delta
      return
    }
    a.time += delta
    a.frames += 1
    if (a.time < 1) return
    if (a.frames / a.time < 45) {
      onDecline()
      a.cooldown = 1
    }
    a.time = 0
    a.frames = 0
  })
  return null
}

export default function Scene({ lowPower, onReady }: { lowPower: boolean; onReady: () => void }) {
  // Start sharp, then drop resolution if the device cannot hold frame rate.
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5))
  return (
    <Canvas
      className="sc-canvas"
      flat
      dpr={dpr}
      onCreated={onReady}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <AdaptiveResolution onDecline={() => setDpr((d) => Math.max(0.5, d * 0.7))} />
      <BlackHole lowPower={lowPower} />
      <Particles />
      <EffectComposer multisampling={0} frameBufferType={HalfFloatType}>
        <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} intensity={0.4} />
        <ChromaticAberration offset={[0.0012, 0.0008]} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Noise opacity={0.045} />
        <Vignette eskil={false} offset={0.2} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
