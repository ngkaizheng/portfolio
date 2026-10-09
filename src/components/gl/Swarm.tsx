import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { core, galaxy, layers, network, randoms, text } from './shapes'
import { fragmentShader, vertexShader } from './shaders'
import { scrollState } from '../../lib/scroll'
import { pointer, trackPointer } from '../../lib/pointer'
import { motion } from './motion'
import { prefersReducedMotion } from '../../lib/env'

// Where the swarm sits for each stage: [x, y, scale].
const WIDE: [number, number, number][] = [
  [1.35, 0.25, 1],
  [0, 0, 1.05],
  [1.9, 0, 0.95],
  [-1.7, 0, 1],
  [0, 0.15, 1],
]
const NARROW: [number, number, number][] = [
  [0, 0.45, 0.58],
  [0, 0, 0.52],
  [0, 0.6, 0.5],
  [0, 0.4, 0.55],
  [0, 0.9, 0.36],
]

// Brightness per stage: dimmer behind text-heavy sections, and dimmer
// still on narrow screens where copy sits directly over the swarm.
const DIM_WIDE = [1, 0.55, 0.6, 0.75, 1]
const DIM_NARROW = [0.75, 0.3, 0.32, 0.45, 1]


const { damp, lerp, clamp } = THREE.MathUtils

export default function Swarm({ count, fontFamily }: { count: number; fontFamily: string }) {
  const group = useRef<THREE.Group>(null)
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)
  const stage = useRef(0)
  const clock = useRef(0)
  const calm = useRef(prefersReducedMotion())
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const net = network(count)
    const lay = layers(count)
    g.setAttribute('position', new THREE.BufferAttribute(core(count), 3))
    g.setAttribute('aNetwork', new THREE.BufferAttribute(net.positions, 3))
    g.setAttribute('aNetworkEdge', new THREE.BufferAttribute(net.edges, 2))
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
          uStage: { value: 0 },
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
    if (!mat) return
    const dt = Math.min(delta, 0.05)
    const u = mat.uniforms
    // Reduced motion: the swarm still morphs with scroll but barely drifts.
    clock.current += calm.current ? dt * 0.1 : dt
    u.uTime.value = clock.current
    u.uIntro.value = damp(u.uIntro.value, 1, 1.3, dt)

    stage.current = damp(stage.current, scrollState.stage, 3, dt)
    u.uStage.value = stage.current

    const speed = Math.min(Math.abs(scrollState.velocity) / 55, 1)
    motion.velocity = damp(motion.velocity, speed, 5, dt)
    u.uVelocity.value = motion.velocity

    u.uPixelRatio.value = gl.getPixelRatio()
    u.uAspect.value = size.width / size.height

    const active = !calm.current && performance.now() - pointer.lastMove < 1800
    u.uMouseStrength.value = damp(u.uMouseStrength.value, active ? 1 : 0, 2.5, dt)
    u.uMouse.value.x = damp(u.uMouse.value.x, pointer.x, 10, dt)
    u.uMouse.value.y = damp(u.uMouse.value.y, pointer.y, 10, dt)

    const g = group.current
    if (!g) return
    const narrow = size.width / size.height < 0.9
    const table = narrow ? NARROW : WIDE
    const dim = narrow ? DIM_NARROW : DIM_WIDE
    const s = clamp(stage.current, 0, 4)
    const i = Math.min(Math.floor(s), 3)
    const f = s - i
    const [ax, ay, as] = table[i]
    const [bx, by, bs] = table[i + 1]
    // Once the last section scrolls past, the word scrolls away with it.
    const cam = state.camera as THREE.PerspectiveCamera
    const viewHeight = 2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.z
    g.position.set(lerp(ax, bx, f), lerp(ay, by, f) + scrollState.tail * viewHeight, 0)
    u.uDim.value = lerp(dim[i], dim[i + 1], f)
    g.scale.setScalar(lerp(as, bs, f))

    // Sway everywhere except the final word, which faces the camera.
    const sway = 1 - clamp(s - 3, 0, 1)
    const t = clock.current
    g.rotation.y = damp(g.rotation.y, Math.sin(t * 0.11) * 0.8 * sway + pointer.x * 0.22, 2, dt)
    g.rotation.x = damp(g.rotation.x, Math.cos(t * 0.07) * 0.18 * sway - pointer.y * 0.14, 2, dt)
  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
