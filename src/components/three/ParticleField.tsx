import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  color?: string
  size?: number
}

export default function ParticleField({
  count = 120,
  color = '#60a5fa',
  size = 0.03,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSpeed = useRef(0)

  const connectionDistance = 2.2
  const scatterRadius = 3.0

  // Particle positions + velocities
  const { positions, basePositions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const x = (Math.random() - 0.5) * 14
      const y = (Math.random() - 0.5) * 14
      const z = (Math.random() - 0.5) * 4
      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = z
      base[i3] = x
      base[i3 + 1] = y
      base[i3 + 2] = z
      vel[i3] = (Math.random() - 0.5) * 0.003
      vel[i3 + 1] = (Math.random() - 0.5) * 0.003
      vel[i3 + 2] = 0
    }
    return { positions: pos, basePositions: base, velocities: vel }
  }, [count])

  // Line segments buffer (max possible connections)
  const lineBuffer = useMemo(() => {
    const maxLines = count * 6 // each particle can connect to ~5 others
    const arr = new Float32Array(maxLines * 2 * 3) // 2 points per line, 3 coords each
    return arr
  }, [count])

  // Track mouse globally
  const handlePointerMove = useCallback((e: PointerEvent) => {
    mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove])

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return

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

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Gentle drift
      arr[i3] += velocities[i3] + Math.sin(time * 0.3 + i * 0.5) * 0.0008
      arr[i3 + 1] += velocities[i3 + 1] + Math.cos(time * 0.2 + i * 0.7) * 0.0008
      arr[i3 + 2] += velocities[i3 + 2]

      // Mouse scatter — push particles away from cursor
      const mx = mouse.current.x * 6
      const my = mouse.current.y * 6
      const dx = arr[i3] - mx
      const dy = arr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < scatterRadius && dist > 0.01) {
        const force = (1 - dist / scatterRadius) * 0.08 * (1 + mouseSpeed.current * 5)
        arr[i3] += (dx / dist) * force
        arr[i3 + 1] += (dy / dist) * force
      }

      // Gently pull back toward base position
      arr[i3] += (basePositions[i3] - arr[i3]) * 0.005
      arr[i3 + 1] += (basePositions[i3 + 1] - arr[i3 + 1]) * 0.005
      arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.005
    }

    posAttr.needsUpdate = true

    // Build connection lines
    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array
    let lineIdx = 0
    const maxVerts = lineBuffer.length / 3

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const ax = arr[i3]
      const ay = arr[i3 + 1]

      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3
        const bx = arr[j3]
        const by = arr[j3 + 1]

        const dx = ax - bx
        const dy = ay - by
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < connectionDistance) {
          const vertIdx = lineIdx * 6
          if (vertIdx + 5 >= maxVerts) break

          lineArr[vertIdx] = ax
          lineArr[vertIdx + 1] = ay
          lineArr[vertIdx + 2] = arr[i3 + 2]
          lineArr[vertIdx + 3] = bx
          lineArr[vertIdx + 4] = by
          lineArr[vertIdx + 5] = arr[j3 + 2]

          lineIdx++
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.9}
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
            count={lineBuffer.length / 3}
            array={lineBuffer}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
