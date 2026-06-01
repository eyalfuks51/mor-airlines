let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function tone(
  freq: number,
  startTime: number,
  duration: number,
  gain = 0.3,
  type: OscillatorType = 'sine',
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function playBingBong() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  tone(784, t, 0.5, 0.3);
  tone(1047, t + 0.45, 0.6, 0.3);
}

let drumrollTimer: ReturnType<typeof setInterval> | null = null;

export function startDrumroll() {
  if (drumrollTimer) return;
  drumrollTimer = setInterval(() => {
    const ctx = getCtx();
    tone(120 + Math.random() * 80, ctx.currentTime, 0.05, 0.12, 'sawtooth');
  }, 55);
}

export function stopDrumroll() {
  if (drumrollTimer !== null) {
    clearInterval(drumrollTimer);
    drumrollTimer = null;
  }
}

export function playDing() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  tone(1318, t, 1.5, 0.4);
  tone(1047, t, 1.5, 0.18);
  tone(659, t, 1.5, 0.08);
}

export function playApplause() {
  const ctx = getCtx();
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const envelope = Math.min(i / (sampleRate * 0.15), 1) * (1 - i / length);
    data[i] = (Math.random() * 2 - 1) * envelope * 0.35;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = 0.5;
  source.connect(g);
  g.connect(ctx.destination);
  source.start();
}
