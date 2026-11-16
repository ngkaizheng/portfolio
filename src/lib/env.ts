// Environment probes. Each one tolerates missing browser APIs so the app
// still renders under jsdom and on browsers without WebGL.

function matches(query: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
}

export function prefersReducedMotion(): boolean {
  return matches('(prefers-reduced-motion: reduce)')
}

export function hasFinePointer(): boolean {
  return matches('(hover: hover) and (pointer: fine)')
}

export function isLowPower(): boolean {
  if (typeof window === 'undefined') return true
  const cores = navigator.hardwareConcurrency || 4
  return cores <= 4 || window.innerWidth < 768
}

export function hasWebGL(): boolean {
  try {
    if (typeof window === 'undefined' || !('WebGLRenderingContext' in window)) return false
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
