import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  color?: string
  size?: number
  shape?: 'diamond' | 'circle'
  radius?: number
  particleCount?: number
  innerCount?: number
  autoRotate?: boolean
}

export default function ParticleField({
  color = '#60a5fa',
  size = 0.03,
  shape = 'diamond',
  radius = 5.5,
  particleCount = 480,
  innerCount = 60,
  autoRotate = true,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const groupRef = useRef<THREE.Group>(null)

  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSpeed = useRef(0)
  const rotationAngle = useRef(0)

  // Generate boundary + inner particles
  const { positions, basePositions, neighborPairs, totalCount } = useMemo(() => {
    const pts: [number, number, number][] = []
    const pairs: [number, number][] = []

    // 1. Boundary points
    const boundaryPts: [number, number, number][] = []
    const countPerEdge = Math.floor(particleCount / 4)

    if (shape === 'diamond') {
      const edges: [[number, number], [number, number]][] = [
        [[-radius, 0], [0, radius]],
        [[0, radius], [radius, 0]],
        [[radius, 0], [0, -radius]],
        [[0, -radius], [-radius, 0]],
      ]

      for (const [start, end] of edges) {
        for (let i = 0; i < countPerEdge; i++) {
          const t = i / countPerEdge
          const noise = 0.04
          const x = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * noise
          const y = start[1] + (end[1] - start[1]) * t + (Math.random() - 0.5) * noise
          const z = (Math.random() - 0.5) * 0.2
          boundaryPts.push([x, y, z])
        }
      }
      // Fill remaining
      const remaining = particleCount - boundaryPts.length
      for (let i = 0; i < remaining; i++) {
        const t = i / Math.max(remaining, 1)
        const noise = 0.04
        const x = -radius + radius * t + (Math.random() - 0.5) * noise
        const y = radius * t + (Math.random() - 0.5) * noise
        const z = (Math.random() - 0.5) * 0.2
        boundaryPts.push([x, y, z])
      }
    } else {
      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2
        const noise = 0.03
        const r = radius + (Math.random() - 0.5) * noise
        const x = r * Math.cos(theta) + (Math.random() - 0.5) * noise
        const y = r * Math.sin(theta) + (Math.random() - 0.5) * noise
        const z = (Math.random() - 0.5) * 0.2
        boundaryPts.push([x, y, z])
      }
    }

    // 2. Inner scattered points
    const innerPts: [number, number, number][] = []
    for (let i = 0; i < innerCount; i++) {
      let x: number, y: number
      if (shape === 'diamond') {
        let valid = false
        let attempts = 0
        while (!valid && attempts < 50) {
          const rx = (Math.random() - 0.5) * radius * 1.8
          const ry = (Math.random() - 0.5) * radius * 1.8
          if (Math.abs(rx) + Math.abs(ry) < radius * 0.85) {
            x = rx
            y = ry
            valid = true
          }
          attempts++
        }
        if (!valid) {
          x = (Math.random() - 0.5) * radius * 0.6
          y = (Math.random() - 0.5) * radius * 0.6
        }
      } else {
        const r = Math.sqrt(Math.random()) * radius * 0.7
        const theta = Math.random() * Math.PI * 2
        x = r * Math.cos(theta)
        y = r * Math.sin(theta)
      }
      const z = (Math.random() - 0.5) * 0.3
      innerPts.push([x!, y!, z])
    }

    // Merge all points
    const allPts = [...boundaryPts, ...innerPts]
    const count = allPts.length

    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const [x, y, z] = allPts[i]
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      base[i * 3] = x
      base[i * 3 + 1] = y
      base[i * 3 + 2] = z
    }

    // 3. Boundary connections
    const bCount = boundaryPts.length
    if (shape === 'diamond') {
      const perEdge = Math.floor(bCount / 4)
      for (let e = 0; e < 4; e++) {
        const start = e * perEdge
        const end = Math.min((e + 1) * perEdge, bCount)
        for (let i = start; i < end - 1; i++) {
          pairs.push([i, i + 1])
        }
        if (e < 3) {
          const nextStart = (e + 1) * perEdge
          if (end < bCount && nextStart < bCount) {
            pairs.push([end - 1, nextStart])
          }
        }
      }
      if (bCount > 0) {
        const lastEdgeStart = 3 * perEdge
        if (lastEdgeStart < bCount) {
          pairs.push([bCount - 1, 0])
        }
      }
    } else {
      for (let i = 0; i < bCount; i++) {
        const j = (i + 1) % bCount
        pairs.push([i, j])
      }
    }

    // Also connect inner points to nearby boundary points
    for (let i = bCount; i < count; i++) {
      const ix = base[i * 3]
      const iy = base[i * 3 + 1]
      for (let j = 0; j < bCount; j++) {
        const jx = base[j * 3]
        const jy = base[j * 3 + 1]
        const dist = Math.sqrt((ix - jx) ** 2 + (iy - jy) ** 2)
        if (dist < 1.2) {
          pairs.push([i, j])
        }
      }
    }

    return {
      positions: pos,
      basePositions: base,
      neighborPairs: pairs,
      totalCount: count,
    }
  }, [shape, radius, particleCount, innerCount])

  // Line buffer
  const lineBuffer = useMemo(() => {
    const maxLines = neighborPairs.length
    return new Float32Array(maxLines * 2 * 3)
  }, [neighborPairs.length])

  // Mouse tracking
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

  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current || !linesRef.current || !groupRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array

    // Smooth mouse
    const prevX = mouse.current.x
    const prevY = mouse.current.y
    mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.06
    mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.06
    mouseSpeed.current = Math.sqrt(
      (mouse.current.x - prevX) ** 2 + (mouse.current.y - prevY) ** 2
    )

    const mx = mouse.current.x * 6
    const my = mouse.current.y * 4

    // Update particle positions
    for (let i = 0; i < totalCount; i++) {
      const i3 = i * 3
      const dx = arr[i3] - mx
      const dy = arr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      const scatterRadius = 2.0
      if (dist < scatterRadius && dist > 0.01) {
        const force = (1 - dist / scatterRadius) * 0.18 * (1 + mouseSpeed.current * 10)
        arr[i3] += (dx / dist) * force
        arr[i3 + 1] += (dy / dist) * force
        arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.02 +
          (Math.random() - 0.5) * 0.002
      }

      const spring = 0.035 + 0.01 * (1 - Math.min(mouseSpeed.current * 5, 1))
      arr[i3] += (basePositions[i3] - arr[i3]) * spring
      arr[i3 + 1] += (basePositions[i3 + 1] - arr[i3 + 1]) * spring
      arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.03
    }
    posAttr.needsUpdate = true

    // Update lines with distance filtering
    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array
    let lineIdx = 0
    const maxVerts = lineBuffer.length / 3

    for (let p = 0; p < neighborPairs.length; p++) {
      const [ai, bi] = neighborPairs[p]
      const a3 = ai * 3
      const b3 = bi * 3
      const vi = lineIdx * 6
      if (vi + 5 >= maxVerts) break

      const dx = arr[a3] - arr[b3]
      const dy = arr[a3 + 1] - arr[b3 + 1]
      const dz = arr[a3 + 2] - arr[b3 + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist > radius * 0.45) continue

      lineArr[vi] = arr[a3]
      lineArr[vi + 1] = arr[a3 + 1]
      lineArr[vi + 2] = arr[a3 + 2]
      lineArr[vi + 3] = arr[b3]
      lineArr[vi + 4] = arr[b3 + 1]
      lineArr[vi + 5] = arr[b3 + 2]
      lineIdx++
    }

    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true

    // Auto rotate
    if (autoRotate) {
      rotationAngle.current += delta * 0.08
      groupRef.current.rotation.y = rotationAngle.current
    }

    // Line opacity varies with mouse speed
    const lineMat = linesRef.current.material as THREE.LineBasicMaterial
    const speedFactor = Math.min(mouseSpeed.current * 2, 1)
    lineMat.opacity = 0.06 + 0.06 * (1 - speedFactor)
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={totalCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.92}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

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
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
