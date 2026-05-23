let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function playCrunch() {
  const vol = 0.6;
  if (vol <= 0) return;
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    const bufLen = Math.floor(ac.sampleRate * 0.055);
    const buffer = ac.createBuffer(1, bufLen, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    }
    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3500 + Math.random() * 800;
    bp.Q.value = 0.7;

    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.38 * vol, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    noise.connect(bp);
    bp.connect(hp);
    hp.connect(gain);
    gain.connect(ac.destination);
    noise.start(now);
    noise.stop(now + 0.06);
  } catch {
    // silently skip if audio not available
  }
}

const pendingUnmute = new Set();
let audioUnlocked = false;

export function registerForUnmute(videoEl) {
  if (!videoEl) return;
  if (audioUnlocked) {
    videoEl.muted = false;
  } else {
    pendingUnmute.add(videoEl);
  }
}

export function unregisterFromUnmute(videoEl) {
  pendingUnmute.delete(videoEl);
}

function unlockAudio() {
  audioUnlocked = true;
  pendingUnmute.forEach((v) => { v.muted = false; });
  pendingUnmute.clear();
}

export function playVoice(src) {
  const el = new Audio(src);
  try {
    const ac = getCtx();
    const source = ac.createMediaElementSource(el);
    const gain = ac.createGain();
    gain.gain.value = 2.0;
    source.connect(gain);
    gain.connect(ac.destination);
  } catch {
    // fall through — plays at native volume
  }
  el.play().catch(() => {});
  return el;
}

export function setupGlobalClickSound() {
  const handler = (e) => {
    if (!audioUnlocked) unlockAudio();
    const el = e.target.closest("button, [role=button], a, .chapter-btn, .enter-btn, .story-step, .map-point");
    if (el && !el.closest(".volume-control")) playCrunch();
  };
  document.addEventListener("pointerdown", handler, { capture: true });
  return () => document.removeEventListener("pointerdown", handler, { capture: true });
}
