import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { core, galaxy, gatewayParams, layers, network, randoms, scopeParams, talk, text } from './shapes'
import { fragmentShader, vertexShader } from './shaders'
import { ANCHORED, SHAPES, sampleScene, scene, type ShapeKey } from './scene'
import { scrollState } from '../../lib/scroll'
import { pointer, trackPointer } from '../../lib/pointer'
import { motion } from './motion'
import { prefersReducedMotion } from '../../lib/env'

// Free-floating placement per shape: [x, y, scale, brightness, sway].
// Brightness is lower behind text-heavy sections, lower still on narrow
// screens where copy sits directly over the swarm.
type Placement = [number, number, number, number, number]
const WIDE: Record<ShapeKey, Placement> = {
  core: [1.35, 0.25, 1, 1, 0.8],
  network: [0, 0, 1.05, 0.55, 0.8],
  gateway: [0, 0, 0.7, 1, 0.22],
  observe: [0, 0, 0.7, 1, 0.22],
  talk: [0, 0, 0.8, 1, 0.3],
  layers: [1.9, 0, 0.95, 0.6, 0.8],
  galaxy: [-1.7, 0, 1, 0.75, 0.8],
  text: [0, 0.15, 1, 1, 0],
}
const NARROW: Record<ShapeKey, Placement> = {
  core: [0, 0.45, 0.58, 0.75, 0.8],
  network: [0, 0, 0.52, 0.3, 0.8],
  gateway: [0, 0, 0.35, 0.95, 0.22],
  observe: [0, 0, 0.35, 0.95, 0.22],
  talk: [0, 0, 0.4, 0.95, 0.3],
  layers: [0, 0.6, 0.5, 0.32, 0.8],
  galaxy: [0, 0.4, 0.55, 0.45, 0.8],
  text: [0, 0.9, 0.36, 1, 0],
}

// Local-space extents of the anchored shapes, used to fit them to their frame.
const EXTENT: Partial<Record<ShapeKey, [number, number]>> = {
  gateway: [6.2, 3.5],
  observe: [6.2, 3.3],
  talk: [4.6, 3.6],
}

const { damp } = THREE.MathUtils

export default function Swarm({ count, fontFamily }: { count: number; fontFamily: string }) {
  const group = useRef<THREE.Group>(null)
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)
  const weights = useRef(new Float32Array(SHAPES.length))
  const clock = useRef(0)
  const calm = useRef(prefersReducedMotion())
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const net = network(count)
    const lay = layers(count)
    const people = talk(count)
    g.setAttribute('position', new THREE.BufferAttribute(core(count), 3))
    g.setAttribute('aNetwork', new THREE.BufferAttribute(net.positions, 3))
    g.setAttribute('aNetworkEdge', new THREE.BufferAttribute(net.edges, 2))
    g.setAttribute('aGate', new THREE.BufferAttribute(gatewayParams(count), 3))
    g.setAttribute('aScope', new THREE.BufferAttribute(scopeParams(count), 3))
    g.setAttribute('aTalk', new THREE.BufferAttribute(people.positions, 3))
    g.setAttribute('aTalkEdge', new THREE.BufferAttribute(people.edges, 2))
    g.setAttribute('aLayers', new THREE.BufferAttribute(lay.positions, 3))
    g.setAttribute('aLayersEdge', new THREE.BufferAttribute(lay.edges, 2))
    g.setAttribute('aGalaxy', new THREE.BufferAttribute(galaxy(count), 3))
    g.setAttribute('aText', new THREE.BufferAttribute(text(count, 'HELLO', fontFamily), 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(randoms(count), 1))
    return g
  }, [count, fontFamily])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uW: { value: [1, 0, 0, 0, 0, 0, 0, 0] },
          uSize: { value: 19 },
          uPixelRatio: { value: 1 },
          uVelocity: { value: 0 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uMouseStrength: { value: 0 },
          uAspect: { value: 1 },
          uIntro: { value: 0 },
          uDim: { value: 1 },
        },
      }),
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => trackPointer(), [])

  useFrame((state, delta) => {
    const mat = points.current?.material
    const g = group.current
    if (!mat || !g) return
    const dt = Math.min(delta, 0.05)
    const u = mat.uniforms
    // Reduced motion: the swarm still morphs with scroll but barely drifts.
    clock.current += calm.current ? dt * 0.1 : dt
    u.uTime.value = clock.current
    u.uIntro.value = damp(u.uIntro.value, 1, 1.3, dt)

    sampleScene()
    const w = weights.current
    let total = 0
    for (let i = 0; i < SHAPES.length; i++) {
      w[i] = damp(w[i], scene.weights[i], 3, dt)
      total += w[i]
    }
    total = Math.max(total, 1e-4)
    for (let i = 0; i < SHAPES.length; i++) u.uW.value[i] = w[i] / total

    const speed = Math.min(Math.abs(scrollState.velocity) / 55, 1)
    motion.velocity = damp(motion.velocity, speed, 5, dt)
    u.uVelocity.value = motion.velocity

    const aspect = size.width / size.height
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uAspect.value = aspect

    const active = !calm.current && performance.now() - pointer.lastMove < 1800
    u.uMouseStrength.value = damp(u.uMouseStrength.value, active ? 1 : 0, 2.5, dt)
    u.uMouse.value.x = damp(u.uMouse.value.x, pointer.x, 10, dt)
    u.uMouse.value.y = damp(u.uMouse.value.y, pointer.y, 10, dt)

    // Blend each shape's placement by its weight. Anchored shapes sit on
    // their panel's frame, scaled to fit it.
    const cam = state.camera as THREE.PerspectiveCamera
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * cam.position.z
    const halfW = halfH * aspect
    const table = aspect < 0.9 ? NARROW : WIDE
    let x = 0
    let y = 0
    let s = 0
    let dim = 0
    let sway = 0
    SHAPES.forEach((key, i) => {
      const k = w[i] / total
      if (k < 1e-4) return
      const [, , , pd, pw] = table[key]
      let [px, py, ps] = table[key]
      const anchor = ANCHORED.has(key) ? scene.anchors.get(key) : undefined
      const extent = EXTENT[key]
      if (anchor && extent) {
        px = anchor.cx * halfW
        py = anchor.cy * halfH
        ps = Math.min((anchor.w * 2 * halfW) / extent[0], (anchor.h * 2 * halfH) / extent[1])
      }
      x += px * k
      y += py * k
      s += ps * k
      dim += pd * k
      sway += pw * k
    })
    // Once the contact section scrolls past, the word scrolls away with it.
    g.position.set(x, y + scene.tail * halfH * 2, 0)
    g.scale.setScalar(s)
    u.uDim.value = dim

    const t = clock.current
    g.rotation.y = damp(g.rotation.y, Math.sin(t * 0.11) * sway + pointer.x * 0.22 * Math.min(sway * 2, 1), 2, dt)
    g.rotation.x = damp(g.rotation.x, Math.cos(t * 0.07) * 0.22 * sway - pointer.y * 0.14 * Math.min(sway * 2, 1), 2, dt)
  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
