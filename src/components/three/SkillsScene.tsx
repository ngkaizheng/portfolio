import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import SkillRadar from './SkillRadar'

interface Skill {
  name: string
  level: number
}

interface SkillsSceneProps {
  skills: Skill[]
  className?: string
}

export default function SkillsScene({ skills, className }: SkillsSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '300px' }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SkillRadar skills={skills} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
