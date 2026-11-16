// Synthesised ambient drone (no audio files): low detuned oscillators plus filtered
// noise that opens up as the camera falls, then lifts on the other side.
export function startDrone() {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)
  master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 180
  filter.connect(master)

  const base = [55, 55.4, 82.5, 110.3]
  const oscs = base.map((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = i < 2 ? 'sawtooth' : 'sine'
    osc.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.value = i < 2 ? 0.5 : 0.25
    osc.connect(gain).connect(filter)
    osc.start()
    return osc
  })

  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 500
  band.Q.value = 0.6
  const rush = ctx.createGain()
  rush.gain.value = 0
  noise.connect(band).connect(rush).connect(master)
  noise.start()

  return {
    update(p: number) {
      const now = ctx.currentTime
      const fall = Math.min(p / 0.9, 1)
      const through = p > 0.9
      filter.frequency.setTargetAtTime(through ? 900 : 180 + fall * fall * 1400, now, 0.3)
      band.frequency.setTargetAtTime(400 + fall * 1800, now, 0.3)
      rush.gain.setTargetAtTime(through ? 0.04 : fall * fall * 0.5, now, 0.3)
      oscs.forEach((osc, i) => osc.frequency.setTargetAtTime(base[i] * (through ? 1.5 : 1 - fall * 0.25), now, 0.4))
    },
    stop() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
      window.setTimeout(() => void ctx.close(), 900)
    },
  }
}

export type Drone = ReturnType<typeof startDrone>
