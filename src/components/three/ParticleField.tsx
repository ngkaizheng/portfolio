import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  color?: string
  size?: number
}

export default function ParticleField({
  color = '#60a5fa',
  size = 0.025,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseSpeed = useRef(0)

  // Diamond grid parameters
  const cols = 22
  const rows = 16
  const spacingX = 0.95
  const spacingY = 0.95
  const count = cols * rows
  const scatterRadius = 2.0

  // Generate structured diamond grid positions
  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)

    let idx = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i3 = idx * 3

        // Diamond pattern: offset every other row
        const offsetX = row % 2 === 1 ? spacingX * 0.5 : 0
        const x = (col - cols / 2) * spacingX + offsetX
        const y = (row - rows / 2) * spacingY

        // Subtle random offset for organic feel
        const jitterX = (Math.random() - 0.5) * 0.08
        const jitterY = (Math.random() - 0.5) * 0.08

        pos[i3] = x + jitterX
        pos[i3 + 1] = y + jitterY
        pos[i3 + 2] = (Math.random() - 0.5) * 0.3

        base[i3] = pos[i3]
        base[i3 + 1] = pos[i3 + 1]
        base[i3 + 2] = pos[i3 + 2]

        idx++
      }
    }
    return { positions: pos, basePositions: base }
  }, [count, cols, rows, spacingX, spacingY])

  // Line buffer for diamond connections
  const lineBuffer = useMemo(() => {
    // Each node connects to ~4 neighbors (diamond edges)
    const maxLines = count * 6
    return new Float32Array(maxLines * 2 * 3)
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

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return

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

    // Update positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Mouse scatter
      const mx = mouse.current.x * 7
      const my = mouse.current.y * 7
      const dx = arr[i3] - mx
      const dy = arr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < scatterRadius && dist > 0.01) {
        const force = (1 - dist / scatterRadius) * 0.12 * (1 + mouseSpeed.current * 8)
        arr[i3] += (dx / dist) * force
        arr[i3 + 1] += (dy / dist) * force
      }

      // Spring back to base position
      arr[i3] += (basePositions[i3] - arr[i3]) * 0.04
      arr[i3 + 1] += (basePositions[i3 + 1] - arr[i3 + 1]) * 0.04
      arr[i3 + 2] += (basePositions[i3 + 2] - arr[i3 + 2]) * 0.04
    }

    posAttr.needsUpdate = true

    // Build diamond connection lines
    const lineArr = linesRef.current.geometry.attributes.position.array as Float32Array
    let lineIdx = 0
    const maxVerts = lineBuffer.length / 3

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col
        const i3 = i * 3
        const ax = arr[i3]
        const ay = arr[i3 + 1]

        // Connect to right neighbor
        if (col < cols - 1) {
          const j = i + 1
          const j3 = j * 3
          const vertIdx = lineIdx * 6
          if (vertIdx + 5 < maxVerts) {
            lineArr[vertIdx] = ax
            lineArr[vertIdx + 1] = ay
            lineArr[vertIdx + 2] = arr[i3 + 2]
            lineArr[vertIdx + 3] = arr[j3]
            lineArr[vertIdx + 4] = arr[j3 + 1]
            lineArr[vertIdx + 5] = arr[j3 + 2]
            lineIdx++
          }
        }

        // Connect to bottom neighbor
        if (row < rows - 1) {
          const j = i + cols
          const j3 = j * 3
          const vertIdx = lineIdx * 6
          if (vertIdx + 5 < maxVerts) {
            lineArr[vertIdx] = ax
            lineArr[vertIdx + 1] = ay
            lineArr[vertIdx + 2] = arr[i3 + 2]
            lineArr[vertIdx + 3] = arr[j3]
            lineArr[vertIdx + 4] = arr[j3 + 1]
            lineArr[vertIdx + 5] = arr[j3 + 2]
            lineIdx++
          }
        }

        // Connect diagonal (bottom-right) for diamond shape
        if (row < rows - 1 && col < cols - 1) {
          const j = i + cols + 1
          const j3 = j * 3
          const vertIdx = lineIdx * 6
          if (vertIdx + 5 < maxVerts) {
            lineArr[vertIdx] = ax
            lineArr[vertIdx + 1] = ay
            lineArr[vertIdx + 2] = arr[i3 + 2]
            lineArr[vertIdx + 3] = arr[j3]
            lineArr[vertIdx + 4] = arr[j3 + 1]
            lineArr[vertIdx + 5] = arr[j3 + 2]
            lineIdx++
          }
        }

        // Connect diagonal (bottom-left) for diamond shape
        if (row < rows - 1 && col > 0) {
          const j = i + cols - 1
          const j3 = j * 3
          const vertIdx = lineIdx * 6
          if (vertIdx + 5 < maxVerts) {
            lineArr[vertIdx] = ax
            lineArr[vertIdx + 1] = ay
            lineArr[vertIdx + 2] = arr[i3 + 2]
            lineArr[vertIdx + 3] = arr[j3]
            lineArr[vertIdx + 4] = arr[j3 + 1]
            lineArr[vertIdx + 5] = arr[j3 + 2]
            lineIdx++
          }
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, lineIdx * 2)
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* Nodes */}
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
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Diamond grid lines */}
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
