import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import { motion } from './motion'

export default function Effects() {
  const aberration = useRef<ChromaticAberrationEffect>(null)

  // RGB split grows with scroll speed.
  useFrame(() => {
    const v = motion.velocity
    aberration.current?.offset.set(0.0006 + v * 0.006, 0.0003 + v * 0.003)
  })

  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={1.1} luminanceThreshold={0.18} luminanceSmoothing={0.5} mipmapBlur radius={0.72} />
      <ChromaticAberration ref={aberration} radialModulation={false} modulationOffset={0} />
      <Vignette offset={0.22} darkness={0.82} />
    </EffectComposer>
  )
}
