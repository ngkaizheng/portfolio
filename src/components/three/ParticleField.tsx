import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  color?: string
  size?: number
}

export default function ParticleField({
  count = 1500,
  color = '#60a5fa',
  size = 0.015,
}: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mouseTarget = useRef({ x: 0, y: 0 })

  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const base = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 20
      pos[i3 + 1] = (Math.random() - 0.5) * 20
      pos[i3 + 2] = (Math.random() - 0.5) * 10
      base[i3] = pos[i3]
      base[i3 + 1] = pos[i3 + 1]
      base[i3 + 2] = pos[i3 + 2]
    }
    return { positions: pos, basePositions: base }
  }, [count])

  // Track mouse position globally
  const handlePointerMove = useCallback((e: globalThis.PointerEvent) => {
    mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  // Register global mouse listener
  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove])

  useFrame((state) => {
    if (!mesh.current) return

    const posAttr = mesh.current.geometry.attributes.position
    const time = state.clock.getElapsedTime()
    const arr = posAttr.array as Float32Array

    // Smooth mouse following
    mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.03
    mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.03

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Floating motion from base position
      const floatX = Math.sin(time * 0.4 + i * 0.013) * 0.3
      const floatY = Math.cos(time * 0.25 + i * 0.017) * 0.3
      const floatZ = Math.sin(time * 0.3 + i * 0.011) * 0.15

      // Mouse influence
      const dx = mouse.current.x * 5 - basePositions[i3]
      const dy = mouse.current.y * 5 - basePositions[i3 + 1]
      const dist = Math.sqrt(dx * dx + dy * dy)

      let mouseX = 0
      let mouseY = 0

      if (dist < 5 && dist > 0.1) {
        const force = (5 - dist) * 0.015
        mouseX = dx * force * 0.1
        mouseY = dy * force * 0.1
      }

      arr[i3] = basePositions[i3] + floatX + mouseX
      arr[i3 + 1] = basePositions[i3 + 1] + floatY + mouseY
      arr[i3 + 2] = basePositions[i3 + 2] + floatZ
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={mesh}>
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
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
