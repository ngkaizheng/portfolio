import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Skill {
  name: string
  level: number // 0-100
}

interface SkillRadarProps {
  skills: Skill[]
  radius?: number
  color?: string
}

export default function SkillRadar({
  skills,
  radius = 2,
  color = '#60a5fa',
}: SkillRadarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.Line>(null)
  const fillRef = useRef<THREE.Mesh>(null)

  const count = skills.length
  const angleStep = (Math.PI * 2) / count

  // Generate radar shape points
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

    // Close the shape
    shape.closePath()

    return { linePoints: linePts, fillShape: shape }
  }, [skills, radius, angleStep])

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = []

    // Concentric circles
    for (let r = 0.25; r <= 1; r += 0.25) {
      const circle: THREE.Vector3[] = []
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2
        circle.push(new THREE.Vector3(
          Math.cos(angle) * radius * r,
          Math.sin(angle) * radius * r,
          0
        ))
      }
      lines.push(circle)
    }

    // Radial lines
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2
      lines.push([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ),
      ])
    }

    return lines
  }, [count, radius, angleStep])

  // Animate rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Grid circles */}
      {gridLines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={line.length}
              array={new Float32Array(line.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#27272a" transparent opacity={0.5} />
        </line>
      ))}

      {/* Radar fill */}
      <mesh>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radar outline */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePoints.length}
            array={new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </line>

      {/* Skill labels */}
      {skills.map((skill, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelR = radius + 0.4
        const x = Math.cos(angle) * labelR
        const y = Math.sin(angle) * labelR

        return (
          <Text
            key={skill.name}
            position={[x, y, 0]}
            fontSize={0.12}
            color="#a1a1aa"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.5}
          >
            {skill.name}
          </Text>
        )
      })}

      {/* Skill dots */}
      {skills.map((skill, i) => {
        const angle = i * angleStep - Math.PI / 2
        const r = (skill.level / 100) * radius
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r

        return (
          <mesh key={skill.name} position={[x, y, 0.01]}>
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}
    </group>
  )
}
