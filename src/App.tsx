import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Experience from './components/Experience'
import { Contact, Education, Marquee, Projects, Stack } from './components/Sections'
import { ErrorBoundary } from './components/ui'
import { hasFinePointer, hasWebGL, prefersReducedMotion } from './lib/env'
import { useMagneticAll, useRevealAll } from './lib/hooks'
import { initScroll } from './lib/scroll'

// three.js and the post-processing stack load after first paint.
const World = lazy(() => import('./components/gl/World'))

function App() {
  const [ready, setReady] = useState(false)
  const [webgl] = useState(hasWebGL)
  const [magnetic] = useState(() => hasFinePointer() && !prefersReducedMotion())
  const handleBooted = useCallback(() => setReady(true), [])

  useEffect(() => initScroll(), [])
  useRevealAll()
  useMagneticAll(magnetic)

  // Pinned sections measure text, so re-measure once webfonts settle.
  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh()
    })
    return () => {
      alive = false
    }
  }, [])

  const fallback = <div className="world-fallback" />

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="world" aria-hidden="true">
        {webgl ? (
          <ErrorBoundary fallback={fallback}>
            <Suspense fallback={null}>
              <World />
            </Suspense>
          </ErrorBoundary>
        ) : (
          fallback
        )}
      </div>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Preloader onDone={handleBooted} />
      <Nav />
      <main id="main" className={ready ? 'is-ready' : undefined}>
        <Hero ready={ready} />
        <Marquee />
        <Experience />
        <Projects />
        <Stack />
        <Education />
        <Contact />
      </main>
    </>
  )
}

export default App
