import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  color?: string
  size?: number
}

export default function ParticleField({
  count = 350,
  color = '#60a5fa',
  size = 0.028,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const groupRef = useRef<THREE.Group>(null)

  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSpeed = useRef(0)

  // Generate particles in a sphere shape
  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)
    const radius = 4.5

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Uniform sphere distribution
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * Math.cbrt(Math.random()) // cube root for uniform density

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = z
      base[i3] = x
      base[i3 + 1] = y
      base[i3 + 2] = z
    }
    return { positions: pos, basePositions: base }
  }, [count])

  // Line buffer
  const lineBuffer = useMemo(() => {
    return new Float32Array(count * 6 * 3) // generous buffer
  }, [count])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove)
      return () => window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove])

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current || !groupRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array
    const time = state.clock.getElapsedTime()

    // Smooth mouse
    const prevX = mouse.current.x
    const prevY = mouse.current.y
    mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.05
    mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.05
    mouseSpeed.current = Math.sqrt(
      (mouse.current.x - prevX) ** 2 + (mouse.current.y - prevY) ** 2
    )

    // Update particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Gentle floating
      arr[i3] += Math.sin(time * 0.2 + i * 0.1) * 0.0008
      arr[i3 + 1] += Math.cos(time * 0.15 + i * 0.13) * 0.0008
      arr[i3 + 2] += Math.sin(time * 0.1 + i * 0.07) * 0.0005

      // Mouse scatter
      const mx = mouse.current.x * 5
      const my = mouse.current.y * 3
      const dx = arr[i3] - mx
      const dy = arr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 2.5 && dist > 0.01) {
        const force = (1 - dist / 2.5) * 0.1 * (1 + mouseSpeed.current * 6)
        arr[i3] += (dx / dist) * force
        arr[i3 + 1] += (dy / dist) * force
      }

      // Spring back
      arr[i3] += (basePositions[i3] - arr[i3]) * 0.02
      arr[i3 + 1] += (basePositions[i3 + 1] - arr[i3 + 1]) * 0.02
      arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.02
    }

    posAttr.needsUpdate = true

    // Build connection lines — connect nearby particles
    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array
    let lineIdx = 0
    const maxVerts = lineBuffer.length / 3
    const connectionDist = 1.8

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const ax = arr[i3]
      const ay = arr[i3 + 1]
      const az = arr[i3 + 2]

      // Only check a subset for performance
      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3
        const bx = arr[j3]
        const by = arr[j3 + 1]
        const bz = arr[j3 + 2]

        const dx = ax - bx
        const dy = ay - by
        const dz = az - bz
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < connectionDist) {
          const vi = lineIdx * 6
          if (vi + 5 >= maxVerts) break
          lineArr[vi] = ax
          lineArr[vi + 1] = ay
          lineArr[vi + 2] = az
          lineArr[vi + 3] = bx
          lineArr[vi + 4] = by
          lineArr[vi + 5] = bz
          lineIdx++
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true

    // Slow auto-rotation
    groupRef.current.rotation.y += delta * 0.05
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
  })

  return (
    <group ref={groupRef}>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lineBuffer, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
