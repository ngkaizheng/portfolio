# 3D Interactive Portfolio — Technical Reference

> Research notes and solutions for building a Higgsfield-style 3D portfolio.

---

## 1. Tech Stack Decision

| Component | Choice | Why |
|-----------|--------|-----|
| **3D Engine** | Three.js via React Three Fiber (R3F) | Declarative React integration, huge community |
| **Helpers** | @react-three/drei | Pre-built controls, environments, HTML overlays |
| **Post-processing** | @react-three/postprocessing | Bloom, chromatic aberration, vignette |
| **Scroll Animation** | GSAP + ScrollTrigger | Industry standard for scroll-driven 3D |
| **Shaders** | Custom GLSL | For unique visual effects (iridescence, particles) |
| **Compression** | Draco | 80-90% geometry size reduction for GLB models |

### Required Dependencies

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install gsap
npm install -D @types/three
```

---

## 2. Technical Challenges & Solutions

### Challenge 1: Scroll-Driven Camera Movement

**Problem:** Moving Three.js camera based on scroll position smoothly.

**Solution:** GSAP ScrollTrigger + R3F useFrame hook

```tsx
// Reference: https://wawasensei.dev/en/scroll-animations-with-react-three-fiber-and-gsap
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function CameraController() {
  useFrame(({ camera }) => {
    // ScrollTrigger updates a GSAP timeline
    // which tweens camera.position and camera.lookAt
  })
  return null
}
```

**Key Pattern:** Use `useFrame` for per-frame updates, GSAP for tweening values.

---

### Challenge 2: Post-Processing (Bloom, Chromatic Aberration)

**Problem:** Adding cinematic effects without killing performance.

**Solution:** @react-three/postprocessing (R3F wrapper)

```tsx
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={1}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.001, 0.001]}
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
```

**Reference:** [Bloom docs](https://react-postprocessing.docs.pmnd.rs/effects/bloom)

---

### Challenge 3: Particle Systems (Higgsfield-style floating particles)

**Problem:** Rendering thousands of particles efficiently.

**Solution:** Instanced rendering + custom shaders

```tsx
// Reference: https://github.com/sebastien-lempens/r3f-flow-field-particles
// Use Points + BufferGeometry for thousands of particles
function ParticleField({ count = 2000 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#60a5fa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
```

---

### Challenge 4: Mobile Performance

**Problem:** GPU-heavy 3D scenes drain battery on mobile.

**Solution:** Device detection + adaptive quality

```tsx
// Reference: https://r3f.docs.pmnd.rs/advanced/scaling-performance
function AdaptiveQuality({ children }) {
  const [dpr, setDpr] = useState(1)

  useEffect(() => {
    const pixelRatio = window.devicePixelRatio
    const cores = navigator.hardwareConcurrency || 4

    // Reduce quality on low-end devices
    if (cores <= 4 || pixelRatio > 2) {
      setDpr(1) // Render at 1x instead of 2x
    } else {
      setDpr(Math.min(pixelRatio, 1.5)) // Cap at 1.5x
    }
  }, [])

  return <Canvas dpr={dpr}>{children}</Canvas>
}
```

**Additional Tips:**
- Use `Page Visibility API` to pause rendering when tab is hidden
- Use `IntersectionObserver` to pause off-screen scenes
- Target 60fps on mid-range Android (Samsung Galaxy A-series)

---

### Challenge 5: Loading Strategy

**Problem:** Blank canvas while 3D assets load.

**Solution:** LoadingManager + progress indicator

```tsx
// Reference: Three.js LoadingManager
import { useProgress, Html } from '@react-three/drei'

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="loader">
        <div className="loader-bar" style={{ width: `${progress}%` }} />
        <span>{Math.round(progress)}%</span>
      </div>
    </Html>
  )
}
```

---

### Challenge 6: GLSL Shaders for Custom Effects

**Problem:** Creating unique visual effects (iridescence, fluid, glow).

**Solution:** Custom ShaderMaterial with vertex/fragment shaders

```glsl
// Iridescence fragment shader (simplified)
// Reference: https://threejsresources.com/tool/learn-glsl-shaders-from-scratch
varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
  float fresnel = 1.0 - dot(vNormal, vViewDirection);
  vec3 color = vec3(
    sin(fresnel * 3.14) * 0.5 + 0.5,
    sin(fresnel * 3.14 + 2.094) * 0.5 + 0.5,
    sin(fresnel * 3.14 + 4.188) * 0.5 + 0.5
  );
  gl_FragColor = vec4(color, 1.0);
}
```

**Reference:** [GLSL Tutorial](https://waelyasmina.net/articles/glsl-and-shaders-tutorial-for-beginners-webgl-threejs/)

---

### Challenge 7: TypeScript with R3F

**Problem:** Type safety for Three.js elements in React.

**Solution:** Use R3F's built-in types

```tsx
// Reference: https://r3f.docs.pmnd.rs/api/typescript
import { ThreeElements } from '@react-three/fiber'

// Extend JSX namespace for Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Now mesh, group, etc. are typed
function MyComponent() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}
```

---

### Challenge 8: Model Optimization (Draco Compression)

**Problem:** Raw GLB files are 20-50MB, too heavy for web.

**Solution:** Draco compression (80-90% reduction)

```tsx
// Reference: https://salivity.github.io/three.js/article/how-to-use-draco-compression-in-three-js
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// In R3F with drei:
useGLTF('/model.glb', true) // Draco enabled by default
```

---

## 3. Design Guidelines (Higgsfield-style)

### Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Background | `#0a0a0a` | Deep black |
| Primary | `#60a5fa` | Blue glow, particles |
| Secondary | `#a855f7` | Purple accent, gradients |
| Accent | `#22d3ee` | Cyan highlights |
| Text Primary | `#e4e4e7` | High contrast |
| Text Muted | `#a1a1aa` | Secondary text |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headlines | Space Grotesk | 700 |
| Body | Archivo | 400-500 |
| Code | JetBrains Mono | 400 |

### Effects Checklist

- [ ] Bloom on glowing elements (intensity 1-2)
- [ ] Chromatic aberration (subtle: 0.001-0.002 offset)
- [ ] Vignette (subtle: 0.3 offset, 0.7 darkness)
- [ ] Particles: 1000-3000 count, size 0.01-0.03
- [ ] Depth of field for cinematic focus

---

## 4. Implementation Phases (Revised)

### Phase 0: Foundation (Week 1)

- [ ] Install dependencies
- [ ] Set up Canvas with adaptive DPR
- [ ] Basic scene with camera + lights
- [ ] CSS fallback for no-WebGL devices

### Phase 1: Hero Section (Week 2)

- [ ] Particle system (1000-2000 particles)
- [ ] Mouse-tracking interaction
- [ ] Bloom effect on particles
- [ ] Smooth entry animation

### Phase 2: Scroll Experience (Week 3)

- [ ] GSAP ScrollTrigger integration
- [ ] Camera movement per section
- [ ] Section transitions
- [ ] Performance testing on mobile

### Phase 3: Content Sections (Week 4)

- [ ] Experience cards as 3D planes
- [ ] Skills radar chart (3D)
- [ ] Project cards with depth effect
- [ ] Hover interactions

### Phase 4: Polish (Week 5)

- [ ] Post-processing stack
- [ ] Loading screen
- [ ] Mobile optimization
- [ ] Accessibility (reduced motion)

---

## 5. Key References

| Topic | URL |
|-------|-----|
| R3F Performance | https://deepwiki.com/pmndrs/react-three-fiber/4.2-performance-optimization |
| GSAP + R3F Scroll | https://wawasensei.dev/en/scroll-animations-with-react-three-fiber-and-gsap |
| Bloom Effect | https://react-postprocessing.docs.pmnd.rs/effects/bloom |
| GLSL Shaders | https://waelyasmina.net/articles/glsl-and-shaders-tutorial-for-beginners-webgl-threejs/ |
| Drei Helpers | https://drei.docs.pmnd.rs/ |
| TypeScript Setup | https://r3f.docs.pmnd.rs/api/typescript |
| Draco Compression | https://salivity.github.io/three.js/article/how-to-use-draco-compression-in-three-js |
| Scaling Performance | https://r3f.docs.pmnd.rs/advanced/scaling-performance |
| Particle System | https://github.com/sebastien-lempens/r3f-flow-field-particles |
| Codrops Scroll 3D | https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/ |

---

*Created: 2026-07-25 | Status: Reference Complete*
