// Window-level pointer snapshot in normalized device coordinates. The WebGL
// canvas sits behind the page with pointer-events disabled, so it cannot
// rely on its own events.
export const pointer = {
  x: 0,
  y: 0,
  clientX: -100,
  clientY: -100,
  lastMove: -Infinity,
}

let attached = 0

function onMove(e: PointerEvent) {
  pointer.clientX = e.clientX
  pointer.clientY = e.clientY
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
  pointer.lastMove = performance.now()
}

export function trackPointer(): () => void {
  if (typeof window === 'undefined') return () => {}
  if (attached++ === 0) window.addEventListener('pointermove', onMove, { passive: true })
  return () => {
    if (--attached === 0) window.removeEventListener('pointermove', onMove)
  }
}
