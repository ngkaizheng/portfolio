import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Skill {
  name: string
  level: number
}

interface SkillRadarProps {
  skills: Skill[]
  radius?: number
  color?: string
}

export default function SkillRadar({
  skills,
  radius = 1.8,
  color = '#60a5fa',
}: SkillRadarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const fillRef = useRef<THREE.Mesh>(null)

  const count = skills.length
  const angleStep = (Math.PI * 2) / count

  // Radar shape points
  const { linePoints, fillShape } = useMemo(() => {
    const linePts: THREE.Vector3[] = []
    const shape = new THREE.Shape()

    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2
      const r = (skill.level / 100) * radius
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r

      linePts.push(new THREE.Vector3(x, y, 0))

      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    })

    // Close the shape — push first point again for closed line loop
    linePts.push(linePts[0].clone())
    shape.closePath()

    return { linePoints: linePts, fillShape: shape }
  }, [skills, radius, angleStep])

  // Grid: concentric polygons + radial lines
  const gridPolygons = useMemo(() => {
    const polygons: THREE.Vector3[][] = []

    // Concentric hexagons at 25%, 50%, 75%, 100%
    for (let level = 0.25; level <= 1; level += 0.25) {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= count; i++) {
        const angle = (i % count) * angleStep - Math.PI / 2
        const r = radius * level
        pts.push(new THREE.Vector3(
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          0
        ))
      }
      polygons.push(pts)
    }

    // Radial lines from center to each vertex
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2
      polygons.push([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ),
      ])
    }

    return polygons
  }, [count, radius, angleStep])

  // Gentle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      {/* Grid lines */}
      {gridPolygons.map((pts, i) => {
        const arr = new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[arr, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={i < 4 ? '#27272a' : '#3b3b3b'}
              transparent
              opacity={i < 4 ? 0.6 : 0.4}
            />
          </line>
        )
      })}

      {/* Radar fill */}
      <mesh ref={fillRef}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radar outline */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.9} linewidth={2} />
      </line>

      {/* Skill labels */}
      {skills.map((skill, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelR = radius + 0.35
        const x = Math.cos(angle) * labelR
        const y = Math.sin(angle) * labelR

        return (
          <group key={skill.name}>
            <Text
              position={[x, y, 0]}
              fontSize={0.14}
              color="#d4d4d8"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}

            >
              {skill.name}
            </Text>
            <Text
              position={[x, y - 0.18, 0]}
              fontSize={0.1}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {skill.level}%
            </Text>
          </group>
        )
      })}

      {/* Skill dots */}
      {skills.map((skill, i) => {
        const angle = i * angleStep - Math.PI / 2
        const r = (skill.level / 100) * radius
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r

        return (
          <group key={skill.name}>
            {/* Outer glow */}
            <mesh position={[x, y, -0.01]}>
              <circleGeometry args={[0.09, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Inner dot */}
            <mesh position={[x, y, 0.01]}>
              <circleGeometry args={[0.05, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )
      })}

      {/* Center dot */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#52525b" />
      </mesh>
    </group>
  )
}
