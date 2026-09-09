import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ConnectionsProps {
  particlePositions: Float32Array
  maxDistance?: number
  color?: string
  count?: number
}

export default function Connections({
  particlePositions,
  maxDistance = 2.5,
  color = '#60a5fa',
  count = 1500,
}: ConnectionsProps) {
  const lineRef = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Max possible connections: each particle connects to at most a few neighbors
    const maxLines = count * 3
    const positions = new Float32Array(maxLines * 6) // 2 points per line, 3 coords each
    const opacities = new Float32Array(maxLines * 2)
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))
    geo.setDrawRange(0, 0)
    return geo
  }, [count])

  useFrame(() => {
    if (!lineRef.current) return

    const posAttr = lineRef.current.geometry.attributes.position as THREE.BufferAttribute
    const opacityAttr = lineRef.current.geometry.attributes.opacity as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const opacities = opacityAttr.array as Float32Array

    let lineIndex = 0
    const maxLines = count * 3

    // Check a subset of particles for connections (performance)
    const step = Math.max(1, Math.floor(count / 200))

    for (let i = 0; i < count; i += step) {
      const i3 = i * 3
      const ax = particlePositions[i3]
      const ay = particlePositions[i3 + 1]
      const az = particlePositions[i3 + 2]

      for (let j = i + step; j < count; j += step) {
        if (lineIndex >= maxLines) break

        const j3 = j * 3
        const bx = particlePositions[j3]
        const by = particlePositions[j3 + 1]
        const bz = particlePositions[j3 + 2]

        const dx = ax - bx
        const dy = ay - by
        const dz = az - bz
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < maxDistance) {
          const idx = lineIndex * 6
          positions[idx] = ax
          positions[idx + 1] = ay
          positions[idx + 2] = az
          positions[idx + 3] = bx
          positions[idx + 4] = by
          positions[idx + 5] = bz

          const opacity = 1 - dist / maxDistance
          opacities[lineIndex * 2] = opacity * 0.3
          opacities[lineIndex * 2 + 1] = opacity * 0.3

          lineIndex++
        }
      }
    }

    lineRef.current.geometry.setDrawRange(0, lineIndex * 2)
    posAttr.needsUpdate = true
    opacityAttr.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}
