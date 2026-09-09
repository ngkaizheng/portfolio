import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  color?: string
  size?: number
}

export default function ParticleField({
  color = '#60a5fa',
  size = 0.022,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSpeed = useRef(0)

  // Grid params — fill viewport: camera z=5, fov=60 → visible ±6 x ±3.5
  const cols = 32
  const rows = 22
  const spacing = 0.5
  const count = cols * rows
  const scatterRadius = 1.8

  // Generate regular grid
  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)

    let idx = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i3 = idx * 3
        const x = (col - (cols - 1) / 2) * spacing
        const y = (row - (rows - 1) / 2) * spacing

        // Tiny jitter
        const jx = (Math.random() - 0.5) * 0.03
        const jy = (Math.random() - 0.5) * 0.03

        pos[i3] = x + jx
        pos[i3 + 1] = y + jy
        pos[i3 + 2] = (Math.random() - 0.5) * 0.15

        base[i3] = pos[i3]
        base[i3 + 1] = pos[i3 + 1]
        base[i3 + 2] = pos[i3 + 2]

        idx++
      }
    }
    return { positions: pos, basePositions: base }
  }, [count, cols, rows, spacing])

  // Line buffer
  const lineBuffer = useMemo(() => {
    // Each node: up to 4 diagonal connections
    const maxLines = count * 4
    return new Float32Array(maxLines * 2 * 3)
  }, [count])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove])

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array

    const prevX = mouse.current.x
    const prevY = mouse.current.y
    mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.06
    mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.06
    mouseSpeed.current = Math.sqrt(
      (mouse.current.x - prevX) ** 2 + (mouse.current.y - prevY) ** 2
    )

    // Update positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const mx = mouse.current.x * 7
      const my = mouse.current.y * 4
      const dx = arr[i3] - mx
      const dy = arr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < scatterRadius && dist > 0.01) {
        const force = (1 - dist / scatterRadius) * 0.15 * (1 + mouseSpeed.current * 8)
        arr[i3] += (dx / dist) * force
        arr[i3 + 1] += (dy / dist) * force
      }

      arr[i3] += (basePositions[i3] - arr[i3]) * 0.04
      arr[i3 + 1] += (basePositions[i3 + 1] - arr[i3 + 1]) * 0.04
      arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.04
    }

    posAttr.needsUpdate = true

    // Build DIAMOND connections: only diagonals
    // Each node connects to 4 diagonal neighbors
    // This creates diamond/rhombus shapes naturally
    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array
    let lineIdx = 0
    const maxVerts = lineBuffer.length / 3

    const addLine = (ai: number, bi: number) => {
      const a3 = ai * 3
      const b3 = bi * 3
      const vi = lineIdx * 6
      if (vi + 5 >= maxVerts) return
      lineArr[vi] = arr[a3]
      lineArr[vi + 1] = arr[a3 + 1]
      lineArr[vi + 2] = arr[a3 + 2]
      lineArr[vi + 3] = arr[b3]
      lineArr[vi + 4] = arr[b3 + 1]
      lineArr[vi + 5] = arr[b3 + 2]
      lineIdx++
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col

        // Bottom-right diagonal
        if (row < rows - 1 && col < cols - 1) {
          addLine(i, i + cols + 1)
        }

        // Bottom-left diagonal
        if (row < rows - 1 && col > 0) {
          addLine(i, i + cols - 1)
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
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
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
