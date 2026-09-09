import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Camera positions for each section
const sectionPositions = [
  { pos: [0, 0, 5], lookAt: [0, 0, 0] },      // Hero
  { pos: [2, -1, 6], lookAt: [0, -1, 0] },     // Experience
  { pos: [-1, -2, 5.5], lookAt: [0, -2, 0] },  // Projects
  { pos: [1, -3, 5], lookAt: [0, -3, 0] },     // Skills
  { pos: [-2, -4, 6], lookAt: [0, -4, 0] },    // Education
  { pos: [0, -5, 5], lookAt: [0, -5, 0] },     // Contact
]

export default function ScrollCamera() {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 0, 5))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrollY / docHeight, 1)

      // Map scroll progress to section index
      const sectionCount = sectionPositions.length
      const rawIndex = progress * (sectionCount - 1)
      const index = Math.floor(rawIndex)
      const t = rawIndex - index

      // Interpolate between sections
      const from = sectionPositions[Math.min(index, sectionCount - 1)]
      const to = sectionPositions[Math.min(index + 1, sectionCount - 1)]

      targetPos.current.set(
        THREE.MathUtils.lerp(from.pos[0], to.pos[0], t),
        THREE.MathUtils.lerp(from.pos[1], to.pos[1], t),
        THREE.MathUtils.lerp(from.pos[2], to.pos[2], t),
      )

      targetLookAt.current.set(
        THREE.MathUtils.lerp(from.lookAt[0], to.lookAt[0], t),
        THREE.MathUtils.lerp(from.lookAt[1], to.lookAt[1], t),
        THREE.MathUtils.lerp(from.lookAt[2], to.lookAt[2], t),
      )
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(targetPos.current, 0.03)
    currentLookAt.current.lerp(targetLookAt.current, 0.03)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
