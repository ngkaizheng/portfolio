import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Preload, OrbitControls } from '@react-three/drei'
import ParticleField from './ParticleField'
import Effects from './Effects'

function AdaptiveCanvas({ children }: { children: React.ReactNode }) {
  const [dpr, setDpr] = useState(1.5)

  useEffect(() => {
    const pixelRatio = window.devicePixelRatio
    const cores = navigator.hardwareConcurrency || 4

    if (cores <= 4 || pixelRatio > 2) {
      setDpr(1)
    } else {
      setDpr(Math.min(pixelRatio, 1.5))
    }
  }, [])

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    >
      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  )
}

export default function Scene() {
  return (
    <AdaptiveCanvas>
      <fog attach="fog" args={['#0a0a0a', 6, 18]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[-5, -5, 3]} intensity={0.4} color="#a855f7" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        dampingFactor={0.1}
        enableDamping
      />
      <ParticleField />
      <Effects />
    </AdaptiveCanvas>
  )
}
