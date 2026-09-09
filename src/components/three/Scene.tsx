import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Preload } from '@react-three/drei'
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <ParticleField />
      <Effects />
    </AdaptiveCanvas>
  )
}
