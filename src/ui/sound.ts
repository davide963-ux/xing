let ctx: AudioContext | null = null
let enabled = true

export const setSoundEnabled = (on: boolean) => {
  enabled = on
}

function tone(freq: number, dur: number, delay = 0, type: OscillatorType = 'sine', vol = 0.08) {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  } catch {
    /* audio unavailable */
  }
}

export type Sfx = 'play' | 'capture' | 'xing10' | 'xing20' | 'deal' | 'win' | 'lose' | 'round'

const run = (notes: number[], dur: number, step: number, type: OscillatorType, vol: number) =>
  notes.forEach((f, i) => tone(f, dur, i * step, type, vol))

export function sfx(name: Sfx) {
  if (!enabled) return
  switch (name) {
    case 'play':
      return tone(320, 0.07, 0, 'triangle', 0.1)
    case 'deal':
      return run([500, 560], 0.05, 0.07, 'triangle', 0.06)
    case 'capture':
      return run([392, 523], 0.14, 0.1, 'triangle', 0.08)
    case 'xing10':
      return run([523, 659, 784], 0.18, 0.1, 'square', 0.06)
    case 'xing20':
      return run([523, 659, 784, 1047, 1319], 0.2, 0.09, 'square', 0.07)
    case 'round':
      return run([440, 554], 0.18, 0.14, 'sine', 0.08)
    case 'win':
      return run([523, 659, 784, 1047], 0.3, 0.15, 'triangle', 0.1)
    case 'lose':
      return run([392, 330, 262], 0.3, 0.2, 'sawtooth', 0.05)
  }
}
