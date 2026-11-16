// Shared mutable scroll/pointer state, written by the DOM loop and read by the render loop.
export const flight = { p: 0, px: 0, py: 0 }

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
