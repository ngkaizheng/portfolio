import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Swarm from './Swarm'
import Effects from './Effects'
import { isLowPower } from '../../lib/env'

const FONT_FAMILY = '"Syne Variable", "Syne", system-ui, sans-serif'

export default function World() {
  const [fontReady, setFontReady] = useState(false)
  const [low] = useState(isLowPower)

  // The closing word is rasterised from the display font, so wait for it.
  useEffect(() => {
    let alive = true
    const loading = document.fonts?.load ? document.fonts.load('800 260px "Syne Variable"') : Promise.resolve([])
    loading
      .catch(() => [])
      .then(() => {
        if (alive) setFontReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <Canvas
      dpr={low ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#050505', 1)}
    >
      {fontReady && <Swarm count={low ? 9000 : 22000} fontFamily={FONT_FAMILY} />}
      {!low && <Effects />}
    </Canvas>
  )
}
